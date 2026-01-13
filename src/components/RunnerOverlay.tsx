import { useTimerStore } from '@/store/useTimerStore';
import { Pause, Play, X, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx'; // Assuming clsx is installed as per previous interactions, if not we use template literals or install it.

// Helper to format SS to MM:SS
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export function RunnerOverlay() {
    const {
        runnerStatus,
        runnerQueue,
        runnerIndex,
        timeLeft,
        togglePause,
        exitRunner,
        startRunner
    } = useTimerStore();

    if (runnerStatus === 'idle') return null;

    const currentEvent = runnerQueue[runnerIndex];
    const nextEvent = runnerQueue[runnerIndex + 1];

    const isCompleted = runnerStatus === 'completed';

    // Background Color Logic
    let bgClass = 'bg-slate-900'; // Default/Completed
    if (!isCompleted && currentEvent) {
        if (currentEvent.type === 'work' || currentEvent.label.toLowerCase().includes('work')) {
            bgClass = 'bg-emerald-600';
        } else if (currentEvent.type === 'rest' || currentEvent.label.toLowerCase().includes('rest') || currentEvent.label.toLowerCase().includes('break')) {
            bgClass = 'bg-rose-600'; // Red for Rest
        } else {
            bgClass = 'bg-blue-600'; // Neutral/Other
        }
    }

    return (
        <div className={clsx("fixed inset-0 z-50 text-white transition-colors duration-500 flex flex-col items-center justify-center", bgClass)}>

            {/* Header Controls */}
            <div className="absolute top-8 right-8">
                <button
                    onClick={exitRunner}
                    className="p-4 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                >
                    <X size={32} />
                </button>
            </div>

            {/* Main Content */}
            <div className="text-center w-full max-w-4xl px-4">

                {isCompleted ? (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <h1 className="text-6xl md:text-8xl font-bold">Workout Complete!</h1>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={startRunner} // Restart
                                className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-full text-xl font-bold hover:scale-105 transition-transform"
                            >
                                <RotateCcw size={24} />
                                Restart
                            </button>
                            <button
                                onClick={exitRunner}
                                className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-full text-xl font-bold transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Label */}
                        <div className="text-3xl md:text-5xl font-medium opacity-90 mb-4 uppercase tracking-widest">
                            {currentEvent?.label || 'Get Ready'}
                        </div>

                        {/* Big Countdown */}
                        <div className="text-[25vw] md:text-[12rem] font-bold leading-none tabular-nums tracking-tighter my-8">
                            {formatTime(timeLeft)}
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center my-12">
                            <button
                                onClick={togglePause}
                                className="p-8 bg-white text-current rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all text-slate-900"
                            >
                                {runnerStatus === 'paused' ? (
                                    <Play size={48} className="fill-current" />
                                ) : (
                                    <Pause size={48} className="fill-current" />
                                )}
                            </button>
                        </div>

                        {/* Next Up */}
                        {nextEvent && (
                            <div className="absolute bottom-12 left-0 right-0 text-center opacity-60">
                                <div className="text-sm uppercase tracking-wider mb-1">Next Up</div>
                                <div className="text-2xl font-semibold">
                                    {nextEvent.label} ({formatTime(nextEvent.duration)})
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
