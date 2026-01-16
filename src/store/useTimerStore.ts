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

export type RunnerStatus = 'idle' | 'countdown' | 'running' | 'paused' | 'completed';
export type SoundPreset = 'default' | 'soft' | 'retro' | 'minimal';
export type ThemeMode = 'system' | 'light' | 'dark';

export const COUNTDOWN_DURATION = 5; // seconds

interface TimerStore {
    workouts: Workout[];
    activeWorkoutId: string | null;

    // Runner State
    runnerStatus: RunnerStatus;
    runnerQueue: PlayableEvent[];
    runnerIndex: number;
    timeLeft: number;
    isMuted: boolean;

    // Settings
    soundPreset: SoundPreset;
    themeMode: ThemeMode;

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
    skipToNext: () => void;
    skipToPrevious: () => void;

    // Settings Actions
    setSoundPreset: (preset: SoundPreset) => void;
    setThemeMode: (mode: ThemeMode) => void;

    // Computed Helpers
    getTotalDuration: () => number;
    getElapsedDuration: () => number;

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

            // Settings Defaults
            soundPreset: 'default',
            themeMode: 'system',

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

                // Start with countdown
                set({
                    runnerQueue: queue,
                    runnerIndex: 0,
                    timeLeft: COUNTDOWN_DURATION,
                    runnerStatus: 'countdown'
                });
            },

            tick: () => {
                const state = get();

                // Handle countdown phase
                if (state.runnerStatus === 'countdown') {
                    const newTimeLeft = state.timeLeft - 1;
                    if (newTimeLeft > 0) {
                        set({ timeLeft: newTimeLeft });
                    } else {
                        // Countdown finished, start actual workout
                        set({
                            runnerStatus: 'running',
                            timeLeft: state.runnerQueue[0].duration
                        });
                    }
                    return;
                }

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

            togglePause: () => set((state) => {
                // Can pause during countdown or running
                if (state.runnerStatus === 'running' || state.runnerStatus === 'countdown') {
                    return { runnerStatus: 'paused' };
                }
                if (state.runnerStatus === 'paused') {
                    // Resume to running (countdown would have been interrupted)
                    return { runnerStatus: 'running' };
                }
                return {};
            }),

            exitRunner: () => set({ runnerStatus: 'idle', runnerQueue: [], runnerIndex: 0, timeLeft: 0 }),

            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

            skipToNext: () => {
                const state = get();
                if (state.runnerStatus === 'idle' || state.runnerStatus === 'completed') return;

                // If in countdown, skip to first interval
                if (state.runnerStatus === 'countdown') {
                    set({
                        runnerStatus: 'running',
                        timeLeft: state.runnerQueue[0].duration
                    });
                    return;
                }

                const nextIndex = state.runnerIndex + 1;
                if (nextIndex >= state.runnerQueue.length) {
                    set({ runnerStatus: 'completed', timeLeft: 0 });
                } else {
                    set({
                        runnerIndex: nextIndex,
                        timeLeft: state.runnerQueue[nextIndex].duration
                    });
                }
            },

            skipToPrevious: () => {
                const state = get();
                if (state.runnerStatus === 'idle' || state.runnerStatus === 'completed') return;

                // If in countdown, just restart countdown
                if (state.runnerStatus === 'countdown') {
                    set({ timeLeft: COUNTDOWN_DURATION });
                    return;
                }

                // If more than 3 seconds into current interval, restart it
                const currentEvent = state.runnerQueue[state.runnerIndex];
                if (currentEvent && (currentEvent.duration - state.timeLeft) > 3) {
                    set({ timeLeft: currentEvent.duration });
                    return;
                }

                // Otherwise go to previous interval
                const prevIndex = state.runnerIndex - 1;
                if (prevIndex < 0) {
                    // Go back to countdown
                    set({
                        runnerStatus: 'countdown',
                        runnerIndex: 0,
                        timeLeft: COUNTDOWN_DURATION
                    });
                } else {
                    set({
                        runnerIndex: prevIndex,
                        timeLeft: state.runnerQueue[prevIndex].duration
                    });
                }
            },

            // Settings Actions
            setSoundPreset: (preset) => set({ soundPreset: preset }),
            setThemeMode: (mode) => set({ themeMode: mode }),

            // Computed Helpers
            getTotalDuration: () => {
                const state = get();
                return state.runnerQueue.reduce((sum, event) => sum + event.duration, 0);
            },

            getElapsedDuration: () => {
                const state = get();
                if (state.runnerStatus === 'idle') return 0;
                if (state.runnerStatus === 'countdown') return 0;

                // Sum of all completed intervals + time spent in current interval
                let elapsed = 0;
                for (let i = 0; i < state.runnerIndex; i++) {
                    elapsed += state.runnerQueue[i].duration;
                }
                // Add elapsed time in current interval
                if (state.runnerQueue[state.runnerIndex]) {
                    elapsed += state.runnerQueue[state.runnerIndex].duration - state.timeLeft;
                }
                return elapsed;
            },

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
