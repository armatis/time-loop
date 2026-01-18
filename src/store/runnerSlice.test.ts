import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { useTimerStore, COUNTDOWN_DURATION } from './useTimerStore';
import { LoopNode } from '@/types/timer';

// Mocks handled in src/test/setup.ts

describe('useTimerStore - Runner Slice', () => {
    // Reset store before each test
    beforeEach(() => {
        useTimerStore.setState({
            workouts: [],
            activeWorkoutId: null,
            draftWorkout: null,
            runnerStatus: 'idle',
            runnerQueue: [],
            runnerIndex: 0,
            timeLeft: 0,
            isMuted: false
        });
    });

    const createTestWorkout = () => {
        // Create a simple workout: 2 events
        const root: LoopNode = {
            id: 'root',
            type: 'loop',
            iterations: 1,
            children: [
                { id: '1', type: 'atomic', eventType: 'work', duration: 2, label: 'Work 1' },
                { id: '2', type: 'atomic', eventType: 'rest', duration: 1, label: 'Rest 1' }
            ]
        };


        useTimerStore.getState().createWorkout(root, 'Test Workout');
    };

    it('startRunner initializes runner state correctly', () => {
        createTestWorkout();
        const store = useTimerStore.getState();

        store.startRunner();

        const state = useTimerStore.getState();
        expect(state.runnerStatus).toBe('countdown');
        expect(state.timeLeft).toBe(COUNTDOWN_DURATION);
        expect(state.runnerIndex).toBe(0);
        expect(state.runnerQueue).toHaveLength(2);
    });

    it('tick() handles countdown and transitions to running', () => {
        createTestWorkout();
        const store = useTimerStore.getState();
        store.startRunner();

        // Tick through countdown
        for (let i = 0; i < COUNTDOWN_DURATION; i++) {
            useTimerStore.getState().tick();
        }

        // Should be running now
        const state = useTimerStore.getState();
        expect(state.runnerStatus).toBe('running');
        // Initial duration of first event
        expect(state.timeLeft).toBe(2);
    });

    it('tick() decrements time and transitions events', () => {
        createTestWorkout();
        const store = useTimerStore.getState();

        // Fast forward past countdown
        store.startRunner();
        useTimerStore.setState({ runnerStatus: 'running', timeLeft: 2, runnerIndex: 0 }); // manually force running state

        // Tick 1: Time remaining 2 -> 1
        store.tick();
        let state = useTimerStore.getState();
        expect(state.timeLeft).toBe(1);
        expect(state.runnerIndex).toBe(0);

        // Tick 2: Time remaining 1 -> 0 (transition)
        store.tick();
        state = useTimerStore.getState();
        // Should have moved to next event
        expect(state.runnerIndex).toBe(1);
        expect(state.timeLeft).toBe(1); // Duration of second event
    });

    it('completes workout when queue ends', () => {
        createTestWorkout();
        const store = useTimerStore.getState();

        store.startRunner();
        // Force state to last second of last event
        useTimerStore.setState({
            runnerStatus: 'running',
            runnerIndex: 1, // Last event
            timeLeft: 1
        });

        store.tick(); // Should finish

        const state = useTimerStore.getState();
        expect(state.runnerStatus).toBe('completed');
        expect(state.timeLeft).toBe(0);
    });

    it('pause and resume logic works', () => {
        createTestWorkout();
        const store = useTimerStore.getState();

        store.startRunner();
        useTimerStore.setState({ runnerStatus: 'running', timeLeft: 10 });

        store.togglePause();
        expect(useTimerStore.getState().runnerStatus).toBe('paused');

        // Ticking while paused should do nothing
        store.tick();
        expect(useTimerStore.getState().timeLeft).toBe(10);

        store.togglePause();
        expect(useTimerStore.getState().runnerStatus).toBe('running');

        store.tick();
        expect(useTimerStore.getState().timeLeft).toBe(9);
    });
});
