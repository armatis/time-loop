import { LoopNode } from '@/types/timer';

export interface WorkoutPreset {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji for visual identification
    generateTree: () => LoopNode;
}

export const PRESETS: WorkoutPreset[] = [
    {
        id: 'tabata',
        name: 'Tabata',
        description: '8 rounds × (20s work / 10s rest)',
        icon: '⚡',
        generateTree: () => ({
            id: crypto.randomUUID(),
            type: 'loop',
            iterations: 8,
            children: [
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 20,
                    label: 'Work'
                },
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 10,
                    label: 'Rest'
                }
            ]
        })
    },
    {
        id: 'pomodoro',
        name: 'Pomodoro',
        description: '4 rounds × (25m focus / 5m break)',
        icon: '🍅',
        generateTree: () => ({
            id: crypto.randomUUID(),
            type: 'loop',
            iterations: 4,
            children: [
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 1500, // 25 minutes
                    label: 'Focus'
                },
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 300, // 5 minutes
                    label: 'Break'
                }
            ]
        })
    },
    {
        id: 'emom-10',
        name: 'EMOM 10',
        description: '10 rounds × (50s work / 10s transition)',
        icon: '⏱️',
        generateTree: () => ({
            id: crypto.randomUUID(),
            type: 'loop',
            iterations: 10,
            children: [
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 50,
                    label: 'Work'
                },
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 10,
                    label: 'Transition'
                }
            ]
        })
    },
    {
        id: 'interval-30-30',
        name: '30/30 Intervals',
        description: '6 rounds × (30s work / 30s rest)',
        icon: '🔄',
        generateTree: () => ({
            id: crypto.randomUUID(),
            type: 'loop',
            iterations: 6,
            children: [
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 30,
                    label: 'Work'
                },
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 30,
                    label: 'Rest'
                }
            ]
        })
    },
    {
        id: 'stretch-routine',
        name: 'Stretch Routine',
        description: '8 stretches × 30s each',
        icon: '🧘',
        generateTree: () => ({
            id: crypto.randomUUID(),
            type: 'loop',
            iterations: 8,
            children: [
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 30,
                    label: 'Stretch'
                },
                {
                    id: crypto.randomUUID(),
                    type: 'atomic',
                    duration: 5,
                    label: 'Transition'
                }
            ]
        })
    }
];
