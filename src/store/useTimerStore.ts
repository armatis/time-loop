import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LoopNode, TimerNode, PlayableEvent } from '@/types/timer';
import { arrayMove } from '@dnd-kit/sortable';
import { flattenTree } from '@/lib/flattenTree';

export interface Workout {
    id: string;
    name: string;
    rootNode: LoopNode;
}

export type RunnerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerStore {
    workouts: Workout[];
    activeWorkoutId: string | null;

    // Runner State
    runnerStatus: RunnerStatus;
    runnerQueue: PlayableEvent[];
    runnerIndex: number;
    timeLeft: number;
    isMuted: boolean;

    // Workout Actions
    createWorkout: (rootNode?: LoopNode, name?: string) => void;
    deleteWorkout: (id: string) => void;
    setActiveWorkout: (id: string | null) => void;
    updateWorkoutName: (id: string, name: string) => void;

    // Runner Actions
    startRunner: () => void;
    tick: () => void;
    togglePause: () => void;
    exitRunner: () => void;
    toggleMute: () => void;

    // Node Actions (operate on active Active Workout)
    addNode: (parentId: string, type: 'atomic' | 'loop') => void;
    updateNode: (id: string, data: Partial<TimerNode | LoopNode>) => void;
    deleteNode: (id: string) => void;
    moveNode: (activeId: string, overId: string) => void;
    getNode: (id: string) => LoopNode | TimerNode | null;
}

// Helper to find parent of a node
function findParent(root: LoopNode, targetId: string): LoopNode | null {
    if (root.children.some(child => child.id === targetId)) {
        return root;
    }
    for (const child of root.children) {
        if (child.type === 'loop') {
            const found = findParent(child, targetId);
            if (found) return found;
        }
    }
    return null;
}

// Helper to find a node by ID
function findNode(root: LoopNode, targetId: string): LoopNode | TimerNode | null {
    if (root.id === targetId) return root;
    for (const child of root.children) {
        if (child.id === targetId) return child;
        if (child.type === 'loop') {
            const found = findNode(child, targetId);
            if (found) return found;
        }
    }
    return null;
}

export const useTimerStore = create<TimerStore>()(
    persist(
        (set, get) => ({
            workouts: [],
            activeWorkoutId: null,

            // Runner State Defaults
            runnerStatus: 'idle',
            runnerQueue: [],
            runnerIndex: 0,
            timeLeft: 0,
            isMuted: false,

            createWorkout: (rootNode?: LoopNode, name?: string) => set((state) => {
                const newWorkout: Workout = {
                    id: crypto.randomUUID(),
                    name: name || 'New Workout',
                    rootNode: rootNode || {
                        id: crypto.randomUUID(),
                        type: 'loop',
                        iterations: 1,
                        children: [
                            {
                                id: crypto.randomUUID(),
                                type: 'atomic',
                                eventType: 'work',
                                duration: 30,
                                label: 'Work'
                            }
                        ]
                    }
                };
                return {
                    workouts: [...state.workouts, newWorkout],
                    activeWorkoutId: newWorkout.id
                };
            }),

            deleteWorkout: (id) => set((state) => ({
                workouts: state.workouts.filter(w => w.id !== id),
                activeWorkoutId: state.activeWorkoutId === id ? null : state.activeWorkoutId
            })),

            setActiveWorkout: (id) => set({ activeWorkoutId: id }),

            updateWorkoutName: (id, name) => set((state) => ({
                workouts: state.workouts.map(w => w.id === id ? { ...w, name } : w)
            })),

            // Runner Actions
            startRunner: () => {
                const state = get();
                if (!state.activeWorkoutId) return;

                const workout = state.workouts.find(w => w.id === state.activeWorkoutId);
                if (!workout) return;

                const queue = flattenTree(workout.rootNode);
                if (queue.length === 0) return;

                set({
                    runnerQueue: queue,
                    runnerIndex: 0,
                    timeLeft: queue[0].duration,
                    runnerStatus: 'running'
                });
            },

            tick: () => {
                const state = get();
                if (state.runnerStatus !== 'running') return;

                const newTimeLeft = state.timeLeft - 1;

                if (newTimeLeft > 0) {
                    set({ timeLeft: newTimeLeft });
                } else {
                    // Move to next step
                    const nextIndex = state.runnerIndex + 1;

                    if (nextIndex >= state.runnerQueue.length) {
                        set({ runnerStatus: 'completed', timeLeft: 0 });
                    } else {
                        set({
                            runnerIndex: nextIndex,
                            timeLeft: state.runnerQueue[nextIndex].duration
                        });
                    }
                }
            },

            togglePause: () => set((state) => ({
                runnerStatus: state.runnerStatus === 'running' ? 'paused' : (state.runnerStatus === 'paused' ? 'running' : state.runnerStatus)
            })),

            exitRunner: () => set({ runnerStatus: 'idle', runnerQueue: [], runnerIndex: 0, timeLeft: 0 }),

            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

            addNode: (parentId, type) => set((state) => {
                if (!state.activeWorkoutId) return state;

                const workoutIndex = state.workouts.findIndex(w => w.id === state.activeWorkoutId);
                if (workoutIndex === -1) return state;

                const newWorkouts = [...state.workouts];
                const activeWorkout = structuredClone(newWorkouts[workoutIndex]);
                const newRoot = activeWorkout.rootNode;

                let parent = parentId === 'root' ? newRoot : findNode(newRoot, parentId);

                // If parent not found or is atomic (shouldn't happen), try finding actual parent
                if (!parent || parent.type === 'atomic') {
                    // Fallback: maybe parentId refers to the ID of the loop
                    parent = parentId === 'root' ? newRoot : (findNode(newRoot, parentId) as LoopNode);
                }

                if (parent && parent.type === 'loop') {
                    const newNode: TimerNode | LoopNode = type === 'atomic'
                        ? {
                            id: crypto.randomUUID(),
                            type: 'atomic',
                            eventType: 'work',
                            duration: 30, // Default 30s
                            label: 'New Interval'
                        }
                        : {
                            id: crypto.randomUUID(),
                            type: 'loop',
                            iterations: 2,
                            children: []
                        };

                    parent.children.push(newNode);

                    // Update the workout in the array
                    activeWorkout.rootNode = newRoot;
                    newWorkouts[workoutIndex] = activeWorkout;

                    return { workouts: newWorkouts };
                }
                return state;
            }),

            updateNode: (id, data) => set((state) => {
                if (!state.activeWorkoutId) return state;
                const workoutIndex = state.workouts.findIndex(w => w.id === state.activeWorkoutId);
                if (workoutIndex === -1) return state;

                const newWorkouts = [...state.workouts];
                const activeWorkout = structuredClone(newWorkouts[workoutIndex]);
                const newRoot = activeWorkout.rootNode;

                const node = findNode(newRoot, id);
                if (node) {
                    Object.assign(node, data);
                    newWorkouts[workoutIndex] = activeWorkout; // Commit changes
                    return { workouts: newWorkouts };
                }
                return state;
            }),

            deleteNode: (id) => set((state) => {
                if (!state.activeWorkoutId) return state;
                const workoutIndex = state.workouts.findIndex(w => w.id === state.activeWorkoutId);
                if (workoutIndex === -1) return state;

                const newWorkouts = [...state.workouts];
                const activeWorkout = structuredClone(newWorkouts[workoutIndex]);
                const newRoot = activeWorkout.rootNode;

                // Cannot delete root
                if (newRoot.id === id) return state;

                const parent = findParent(newRoot, id);
                if (parent) {
                    parent.children = parent.children.filter(child => child.id !== id);
                    newWorkouts[workoutIndex] = activeWorkout;
                    return { workouts: newWorkouts };
                }
                return state;
            }),

            moveNode: (activeId, overId) => set((state) => {
                if (!state.activeWorkoutId) return state;
                const workoutIndex = state.workouts.findIndex(w => w.id === state.activeWorkoutId);
                if (workoutIndex === -1) return state;

                const newWorkouts = [...state.workouts];
                const activeWorkout = structuredClone(newWorkouts[workoutIndex]);
                const newRoot = activeWorkout.rootNode;

                const activeParent = findParent(newRoot, activeId);
                const overParent = findParent(newRoot, overId);

                // Only allow move if parents match (siblings)
                if (activeParent && overParent && activeParent.id === overParent.id) {
                    const activeIndex = activeParent.children.findIndex(c => c.id === activeId);
                    const overIndex = activeParent.children.findIndex(c => c.id === overId);

                    if (activeIndex !== -1 && overIndex !== -1) {
                        activeParent.children = arrayMove(activeParent.children, activeIndex, overIndex);
                        newWorkouts[workoutIndex] = activeWorkout;
                        return { workouts: newWorkouts };
                    }
                }
                return state;
            }),

            getNode: (id: string) => {
                const state = get();
                if (!state.activeWorkoutId) return null;
                const workout = state.workouts.find(w => w.id === state.activeWorkoutId);
                if (!workout) return null;
                return findNode(workout.rootNode, id);
            }
        }),
        {
            name: 'timer-storage',
            storage: createJSONStorage(() => localStorage),
            version: 1, // Invalidates old storage
        }
    )
);
