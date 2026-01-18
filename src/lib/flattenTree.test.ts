import { describe, it, expect } from 'vitest';
import { flattenTree } from './flattenTree';
import { LoopNode, TimerNode } from '@/types/timer';

describe('flattenTree', () => {
    // Helper to create atomic nodes
    const createAtomic = (id: string, duration: number, label: string): TimerNode => ({
        id,
        type: 'atomic',
        eventType: 'work',
        duration,
        label,
    });

    // Helper to create loop nodes
    const createLoop = (id: string, iterations: number, children: (TimerNode | LoopNode)[]): LoopNode => ({
        id,
        type: 'loop',
        iterations,
        children,
    });

    it('correctly handles nested loop multiplication', () => {
        // Structure:
        // Loop (2x)
        //   - Atomic (5s)
        //   - Loop (3x)
        //     - Atomic (10s)

        // Expected total length: 2 * (1 + (3 * 1)) = 2 * 4 = 8 events

        const innerNode = createAtomic('inner', 10, 'Inner');
        const middleLoop = createLoop('middle', 3, [innerNode]);
        const outerNode = createAtomic('outer', 5, 'Outer');
        const rootLoop = createLoop('root', 2, [outerNode, middleLoop]);

        const result = flattenTree(rootLoop);

        expect(result).toHaveLength(8);

        // Verify content calculation: (5, 10, 10, 10) repeats twice
        const durations = result.map(e => e.duration);
        expect(durations).toEqual([5, 10, 10, 10, 5, 10, 10, 10]);
    });

    it('preserves order of events', () => {
        const node1 = createAtomic('1', 1, 'First');
        const node2 = createAtomic('2', 2, 'Second');
        const node3 = createAtomic('3', 3, 'Third');
        const loop = createLoop('loop', 1, [node1, node2, node3]);

        const result = flattenTree(loop);

        // Check length and specific order
        expect(result).toHaveLength(3);
        expect(result[0].label).toBe('First');
        expect(result[1].label).toBe('Second');
        expect(result[2].label).toBe('Third');
    });

    it('returns empty array when iterations is 0', () => {
        const node = createAtomic('child', 5, 'Child');
        const loop = createLoop('loop', 0, [node]);

        // Behavior: 0 iterations results in no events, effectively skipping the loop contents
        const result = flattenTree(loop);

        expect(result).toEqual([]);
    });

    it('handles atomic node input directly', () => {
        const node = createAtomic('single', 10, 'Single');
        const result = flattenTree(node);

        // Assert minimal invariants: length 1, properties preserved
        expect(result).toHaveLength(1);
        expect(result[0].duration).toBe(10);
        expect(result[0].label).toBe('Single');
        expect(result[0].type).toBe('work');
    });
});

