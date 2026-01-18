import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { useTimerStore } from './useTimerStore';
import { LoopNode, TimerNode } from '@/types/timer';

// Mocks handled in src/test/setup.ts

// --- Helpers ---

// Recursive helper to find a node by ID in the tree
function findNode(root: LoopNode | TimerNode, id: string): LoopNode | TimerNode | null {
    if (root.id === id) return root;
    if (root.type === 'loop') {
        for (const child of root.children) {
            const found = findNode(child, id);
            if (found) return found;
        }
    }
    return null;
}

// Helper to get children IDs of a loop
function getChildrenIds(root: LoopNode | TimerNode | null): string[] {
    if (!root || root.type !== 'loop') return [];
    return root.children.map(c => c.id);
}

// Helper to get all IDs in tree
function collectIds(root: LoopNode | TimerNode): string[] {
    const ids = [root.id];
    if (root.type === 'loop') {
        for (const child of root.children) {
            ids.push(...collectIds(child));
        }
    }
    return ids;
}

describe('useTimerStore - Editor Slice (moveNode)', () => {
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

    it('moves a node within the same parent (reorder)', () => {
        // Setup: Root -> [A, B, C]
        const nodeA: TimerNode = { id: 'A', type: 'atomic', eventType: 'work', duration: 5, label: 'A' };
        const nodeB: TimerNode = { id: 'B', type: 'atomic', eventType: 'rest', duration: 5, label: 'B' };
        const nodeC: TimerNode = { id: 'C', type: 'atomic', eventType: 'work', duration: 5, label: 'C' };

        const root: LoopNode = {
            id: 'root',
            type: 'loop',
            iterations: 1,
            children: [nodeA, nodeB, nodeC]
        };

        // Create draft
        useTimerStore.getState().createWorkout(root, 'Draft');

        // Action: Move C (index 2) to index 0 (before A)
        // Store's moveNode takes (activeId, overId). 
        // We pretend to drag C over A.
        useTimerStore.getState().moveNode('C', 'A');

        // Assert
        const state = useTimerStore.getState();
        const newRoot = state.draftWorkout!.rootNode;
        const newChildren = getChildrenIds(newRoot);

        expect(newChildren).toEqual(['C', 'A', 'B']);
        expect(newRoot.children).toHaveLength(3);

        // Verify integrity
        expect(findNode(newRoot, 'A')).toBeTruthy();
        expect(findNode(newRoot, 'B')).toBeTruthy();
        expect(findNode(newRoot, 'C')).toBeTruthy();

        // Check for duplicates
        const allIds = collectIds(newRoot);
        expect(new Set(allIds).size).toBe(allIds.length);
    });

    it('swaps items correctly using arrayMove behavior', () => {
        // arrayMove behavior: dragging active to over index.
        // Setup: [1, 2, 3, 4]
        // Move 2 (index 1) over 4 (index 3) -> [1, 3, 4, 2]

        const n1 = { id: '1', type: 'atomic', eventType: 'work', duration: 1, label: '1' } as const;
        const n2 = { id: '2', type: 'atomic', eventType: 'work', duration: 1, label: '2' } as const;
        const n3 = { id: '3', type: 'atomic', eventType: 'work', duration: 1, label: '3' } as const;
        const n4 = { id: '4', type: 'atomic', eventType: 'work', duration: 1, label: '4' } as const;

        const root: LoopNode = {
            id: 'root',
            type: 'loop',
            iterations: 1,
            children: [n1, n2, n3, n4]
        };

        useTimerStore.getState().createWorkout(root, 'Draft');

        useTimerStore.getState().moveNode('2', '4');

        const newRoot = useTimerStore.getState().draftWorkout!.rootNode;
        expect(getChildrenIds(newRoot)).toEqual(['1', '3', '4', '2']);

        const allIds = collectIds(newRoot);
        expect(new Set(allIds).size).toBe(allIds.length);
    });

    it('ignores moves across different parents (current implementation limitation)', () => {
        // Setup:
        // Root
        //  - Loop1 (id: L1) -> [A, B]
        //  - Loop2 (id: L2) -> [C]
        // Attempt to move B to L2 (over C)

        const nodeA: TimerNode = { id: 'A', type: 'atomic', eventType: 'work', duration: 5, label: 'A' };
        const nodeB: TimerNode = { id: 'B', type: 'atomic', eventType: 'work', duration: 5, label: 'B' };
        const nodeC: TimerNode = { id: 'C', type: 'atomic', eventType: 'work', duration: 5, label: 'C' };

        const loop1: LoopNode = { id: 'L1', type: 'loop', iterations: 1, children: [nodeA, nodeB] };
        const loop2: LoopNode = { id: 'L2', type: 'loop', iterations: 1, children: [nodeC] };

        const root: LoopNode = {
            id: 'root',
            type: 'loop',
            iterations: 1,
            children: [loop1, loop2]
        };

        useTimerStore.getState().createWorkout(root, 'Draft');

        // Action: Try to move B -> C
        useTimerStore.getState().moveNode('B', 'C');

        const state = useTimerStore.getState();
        const resultRoot = state.draftWorkout!.rootNode;
        const resultL1 = findNode(resultRoot, 'L1') as LoopNode;
        const resultL2 = findNode(resultRoot, 'L2') as LoopNode;

        // Assertion: No change should happen because parents are different (L1 vs L2)
        // Expected behavior of current moveNode implementation.
        expect(getChildrenIds(resultL1)).toEqual(['A', 'B']);
        expect(getChildrenIds(resultL2)).toEqual(['C']);
    });

    it('ignores moves when active or over node does not exist', () => {
        const nodeA: TimerNode = { id: 'A', type: 'atomic', eventType: 'work', duration: 5, label: 'A' };
        const root: LoopNode = { id: 'root', type: 'loop', iterations: 1, children: [nodeA] };

        useTimerStore.getState().createWorkout(root, 'Draft');

        // Move A to non-existent Z
        useTimerStore.getState().moveNode('A', 'Z');

        const newRoot = useTimerStore.getState().draftWorkout!.rootNode;
        expect(getChildrenIds(newRoot)).toEqual(['A']);
    });
});
