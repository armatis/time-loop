import { useTimerStore } from '@/store/useTimerStore';
import {
    Pause, Play, X, RotateCcw, Volume2, VolumeX,
    SkipForward, SkipBack, ChevronRight
} from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { formatTime } from '@/lib/format';
import { AudioEngine } from '@/lib/audio';
import { getRunnerSound } from '@/lib/getRunnerSound';

export function RunnerOverlay() {
    const {
        runnerStatus,
        runnerQueue,
        runnerIndex,
        timeLeft,
        isMuted,
        togglePause,
        exitRunner,
        startRunner,
        toggleMute,
        skipToNext,
        skipToPrevious,
        getTotalDuration,
        getElapsedDuration,
        tick,
    } = useTimerStore();

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (runnerStatus === 'idle') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePause();
                break;
            case 'Escape':
                exitRunner();
                break;
            case 'ArrowRight':
                e.preventDefault();
                skipToNext();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                skipToPrevious();
                break;
            case 'KeyM':
                toggleMute();
                break;
        }
    }, [runnerStatus, togglePause, exitRunner, skipToNext, skipToPrevious, toggleMute]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // RUNNER ENGINE: interval tick, wake lock, and audio
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        let wakeLock: WakeLockSentinel | null = null;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            } catch (err) {
                console.warn('Wake Lock error:', err);
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLock) {
                try {
                    await wakeLock.release();
                    wakeLock = null;
                } catch (err) {
                    console.warn('Wake Lock release error:', err);
                }
            }
        };

        const isActive = runnerStatus === 'running' || runnerStatus === 'countdown';

        if (isActive) {
            // 1. Wake Lock
            requestWakeLock();

            // 2. Audio Context Init (User Gesture Proxy)
            AudioEngine.init();

            // 3. Tick Loop
            interval = setInterval(() => {
                // Check state directly to avoid stale closures
                const state = useTimerStore.getState();
                const { timeLeft: currentTimeLeft, isMuted: currentMuted, runnerStatus: currentStatus } = state;

                // Double-check we're still active (prevents race conditions)
                if (currentStatus !== 'running' && currentStatus !== 'countdown') {
                    return;
                }

                // Play sound based on status and time
                if (!currentMuted) {
                    const sound = getRunnerSound(currentStatus, currentTimeLeft);
                    switch (sound) {
                        case 'countdown':
                            AudioEngine.playCountdown();
                            break;
                        case 'go':
                            AudioEngine.playGo();
                            break;
                        case 'tick':
                            AudioEngine.playTick();
                            break;
                        case 'switch':
                            AudioEngine.playSwitch();
                            break;
                    }
                }

                tick();
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
            releaseWakeLock();
        };
    }, [runnerStatus, tick]);

    if (runnerStatus === 'idle') return null;

    const currentEvent = runnerQueue[runnerIndex];
    const nextEvent = runnerQueue[runnerIndex + 1];
    const isCompleted = runnerStatus === 'completed';
    const isCountdown = runnerStatus === 'countdown';
    const isPaused = runnerStatus === 'paused';

    // Progress calculation
    const totalDuration = getTotalDuration();
    const elapsedDuration = getElapsedDuration();
    const progressPercent = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;

    // Background Color Logic
    let bgClass = 'bg-slate-900'; // Default/Completed/Countdown
    if (isCountdown) {
        bgClass = 'bg-indigo-600';
    } else if (!isCompleted && currentEvent) {
        if (currentEvent.type === 'work') {
            bgClass = 'bg-emerald-600';
        } else if (currentEvent.type === 'rest') {
            bgClass = 'bg-rose-600';
        } else {
            bgClass = 'bg-blue-600';
        }
    }

    return (
        <div className={clsx(
            "fixed inset-0 z-50 text-white transition-colors duration-500 flex flex-col",
            bgClass
        )}>
            {/* Progress Bar */}
            {!isCompleted && !isCountdown && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
                    <div
                        className="h-full bg-white/80 transition-all duration-300 ease-linear"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 sm:p-6">
                {/* Left: Interval counter */}
                <div className="text-sm sm:text-base opacity-80 font-medium">
                    {!isCompleted && !isCountdown && (
                        <span>{runnerIndex + 1} / {runnerQueue.length}</span>
                    )}
                </div>

                {/* Right: Mute & Close */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full transition-colors cursor-pointer active:scale-95"
                        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                    >
                        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    </button>
                    <button
                        onClick={exitRunner}
                        className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full transition-colors cursor-pointer active:scale-95"
                        title="Exit (Esc)"
                    >
                        <X size={22} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {isCompleted ? (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500 text-center">
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold">Done!</h1>
                        <p className="text-xl sm:text-2xl opacity-80">
                            {formatTime(totalDuration)} completed
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <button
                                onClick={startRunner}
                                className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 rounded-full text-lg sm:text-xl font-bold hover:scale-105 transition-transform cursor-pointer"
                            >
                                <RotateCcw size={24} />
                                Restart
                            </button>
                            <button
                                onClick={exitRunner}
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 hover:bg-white/30 rounded-full text-lg sm:text-xl font-bold transition-colors cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : isCountdown ? (
                    <div className="text-center animate-in fade-in duration-300">
                        {/* Get Ready Label */}
                        <div className="text-2xl sm:text-3xl md:text-4xl font-medium opacity-90 mb-4 uppercase tracking-widest">
                            Get Ready
                        </div>

                        {/* Big Countdown Number */}
                        <div className="text-[30vw] sm:text-[25vw] md:text-[15rem] font-bold leading-none tabular-nums">
                            {timeLeft}
                        </div>

                        {/* First exercise preview */}
                        {currentEvent && (
                            <div className="mt-8 opacity-70">
                                <div className="text-sm uppercase tracking-wider mb-1">First Up</div>
                                <div className="text-xl sm:text-2xl font-semibold flex items-center justify-center gap-2">
                                    {currentEvent.label}
                                    <ChevronRight size={20} />
                                    {formatTime(currentEvent.duration)}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Label */}
                        <div className="text-2xl sm:text-3xl md:text-5xl font-medium opacity-90 mb-2 sm:mb-4 uppercase tracking-widest text-center">
                            {currentEvent?.label || 'Work'}
                        </div>

                        {/* Big Countdown */}
                        <div className="text-[20vw] sm:text-[18vw] md:text-[12rem] font-bold leading-none tabular-nums tracking-tighter">
                            {formatTime(timeLeft)}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4 sm:gap-6 my-8 sm:my-12">
                            {/* Previous */}
                            <button
                                onClick={skipToPrevious}
                                className="p-4 sm:p-5 min-h-[56px] min-w-[56px] flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                title="Previous (Left Arrow)"
                            >
                                <SkipBack size={28} className="fill-current" />
                            </button>

                            {/* Play/Pause */}
                            <button
                                onClick={togglePause}
                                className="p-6 sm:p-8 min-h-[80px] min-w-[80px] flex items-center justify-center bg-white text-slate-900 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                title={isPaused ? 'Play (Space)' : 'Pause (Space)'}
                            >
                                {isPaused ? (
                                    <Play size={40} className="fill-current ml-1" />
                                ) : (
                                    <Pause size={40} className="fill-current" />
                                )}
                            </button>

                            {/* Next */}
                            <button
                                onClick={skipToNext}
                                className="p-4 sm:p-5 min-h-[56px] min-w-[56px] flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                title="Next (Right Arrow)"
                            >
                                <SkipForward size={28} className="fill-current" />
                            </button>
                        </div>

                        {/* Paused indicator */}
                        {isPaused && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="text-6xl sm:text-8xl font-bold opacity-20 animate-pulse">
                                    PAUSED
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer: Next Up / Keyboard hints */}
            {!isCompleted && !isCountdown && (
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        {/* Next Up */}
                        <div className="opacity-60">
                            {nextEvent ? (
                                <>
                                    <div className="text-xs uppercase tracking-wider mb-1">Next</div>
                                    <div className="text-base sm:text-lg font-semibold">
                                        {nextEvent.label} ({formatTime(nextEvent.duration)})
                                    </div>
                                </>
                            ) : (
                                <div className="text-base sm:text-lg font-semibold">Last interval!</div>
                            )}
                        </div>

                        {/* Keyboard hints - hide on mobile */}
                        <div className="hidden sm:flex items-center gap-4 text-xs opacity-40">
                            <span><kbd className="px-1.5 py-0.5 bg-black/20 rounded">Space</kbd> Pause</span>
                            <span><kbd className="px-1.5 py-0.5 bg-black/20 rounded">←</kbd><kbd className="px-1.5 py-0.5 bg-black/20 rounded ml-0.5">→</kbd> Skip</span>
                            <span><kbd className="px-1.5 py-0.5 bg-black/20 rounded">Esc</kbd> Exit</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
