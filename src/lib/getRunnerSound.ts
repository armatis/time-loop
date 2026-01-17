import type { RunnerStatus } from '@/store/useTimerStore';

/**
 * Sound types that the runner can play.
 */
export type RunnerSound = 'countdown' | 'go' | 'tick' | 'switch' | null;

/**
 * Pure function that determines which sound (if any) should play
 * based on the current runner status and time remaining.
 * 
 * @param status - Current runner status ('countdown' | 'running' | etc)
 * @param timeLeft - Seconds remaining in current interval
 * @returns The sound to play, or null if no sound should play
 */
export function getRunnerSound(status: RunnerStatus, timeLeft: number): RunnerSound {
    if (status === 'countdown') {
        // "Get Ready" countdown sounds at 5, 4, 3, 2, 1
        if (timeLeft >= 1 && timeLeft <= 5) {
            // "GO!" sound when countdown ends (at timeLeft === 1, before tick decrements)
            if (timeLeft === 1) {
                return 'go';
            }
            return 'countdown';
        }
    } else if (status === 'running') {
        // Countdown beeps at 3, 2, 1 seconds remaining
        if (timeLeft >= 1 && timeLeft <= 3) {
            // Switch sound when transitioning to next event (at timeLeft === 1)
            if (timeLeft === 1) {
                return 'switch';
            }
            return 'tick';
        }
    }

    return null;
}
