/**
 * Format seconds into human-readable duration string.
 * Example: 90 -> "1m 30s", 60 -> "1m", 30 -> "30s"
 */
export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

/**
 * Format seconds into MM:SS timer display.
 * Example: 90 -> "01:30", 5 -> "00:05"
 */
export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
