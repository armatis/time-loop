import { describe, it, expect, beforeEach } from 'vitest';
import { createTimerStore, Workout } from './useTimerStore';
import { LoopNode } from '@/types/timer';

describe('useTimerStore - Persistence', () => {
    beforeEach(() => {
        // Clear mocked localStorage before each test to ensure a clean slate
        localStorage.clear();
    });

    it('persists workouts to localStorage', () => {
        // 1. Create a store and add a workout (via draft -> save)
        const store1 = createTimerStore();

        const root: LoopNode = {
            id: 'root',
            type: 'loop',
            iterations: 1,
            children: []
        };
        store1.getState().createWorkout(root, 'Persisted Workout');
        store1.getState().saveDraft();

        // 2. Verify localStorage content (Black Box: check if data exists)
        const storedValue = localStorage.getItem('timer-storage');
        expect(storedValue).toBeDefined();

        const parsed = JSON.parse(storedValue!);
        expect(parsed.state.workouts).toHaveLength(1);
        expect(parsed.state.workouts[0].name).toBe('Persisted Workout');

        // 3. Rehydrate: Create a fresh store instance
        const store2 = createTimerStore();

        // Assert state restored
        expect(store2.getState().workouts).toHaveLength(1);
        expect(store2.getState().workouts[0].name).toBe('Persisted Workout');
        expect(store2.getState().activeWorkoutId).toBe(store1.getState().activeWorkoutId);
    });

    it('persists soundPreset (Partialization check)', () => {
        const store1 = createTimerStore();

        // Change setting
        store1.getState().setSoundPreset('minimal');

        // Rehydrate
        const store2 = createTimerStore();
        expect(store2.getState().soundPreset).toBe('minimal');
    });

    it('handles corrupt localStorage gracefully', () => {
        // Inject invalid JSON
        localStorage.setItem('timer-storage', 'invalid-json-{');

        // Create store - should not throw, should fall back to defaults
        const store = createTimerStore();

        expect(store.getState().workouts).toEqual([]);
        expect(store.getState().soundPreset).toBe('default');
    });
});
