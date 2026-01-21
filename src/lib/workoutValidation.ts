import { Workout } from '@/store/useTimerStore';

// Normalize name for comparison (lowercase, trimmed)
export function normalizeName(name: string): string {
    return name.trim().toLowerCase();
}

// Check if name is unique among workouts (excluding a specific ID for rename case)
export function isNameUnique(
    name: string,
    workouts: Workout[],
    draft: Workout | null,
    excludeId?: string
): boolean {
    const normalized = normalizeName(name);
    if (!normalized) return false; // Empty names are invalid

    const allWorkouts = draft ? [...workouts, draft] : workouts;
    return !allWorkouts.some(
        w => w.id !== excludeId && normalizeName(w.name) === normalized
    );
}

// Generate unique default name: "New Workout", "New Workout 2", "New Workout 3"...
export function generateUniqueName(workouts: Workout[], draft: Workout | null): string {
    const baseName = 'New Workout';
    const allWorkouts = draft ? [...workouts, draft] : workouts;

    // Find highest existing "New Workout N" number
    let maxNumber = 0;
    const pattern = /^new workout(?: (\d+))?$/i;

    for (const w of allWorkouts) {
        const match = normalizeName(w.name).match(pattern);
        if (match) {
            const num = match[1] ? parseInt(match[1]) : 1;
            maxNumber = Math.max(maxNumber, num);
        }
    }

    if (maxNumber === 0) return baseName;
    return `${baseName} ${maxNumber + 1}`;
}

// Validate name (non-empty after trim)
export function isValidName(name: string): boolean {
    return name.trim().length > 0;
}
