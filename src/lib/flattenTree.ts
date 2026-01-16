import { LoopNode, PlayableEvent, TimerNode } from "@/types/timer";

export function flattenTree(node: LoopNode | TimerNode): PlayableEvent[] {
    if (node.type === 'atomic') {
        return [{
            duration: node.duration,
            label: node.label,
            type: node.eventType
        }];
    }

    // It's a loop
    const childrenEvents: PlayableEvent[] = [];

    // Recursively flatten children
    for (const child of node.children) {
        childrenEvents.push(...flattenTree(child));
    }

    // Repeat for iterations
    const result: PlayableEvent[] = [];
    for (let i = 0; i < node.iterations; i++) {
        result.push(...childrenEvents);
    }

    return result;
}
