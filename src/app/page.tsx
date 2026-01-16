'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { flattenTree } from '@/lib/flattenTree';
import { LoopItem } from '@/components/LoopItem';
import { TimerItem } from '@/components/TimerItem';
import { Dashboard } from '@/components/Dashboard';
import { RunnerOverlay } from '@/components/RunnerOverlay';
import { ArrowLeft, Play, Clock } from 'lucide-react';
import { AudioEngine } from '@/lib/audio';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

export default function Home() {
  const {
    activeWorkoutId,
    setActiveWorkout,
    workouts,
    updateWorkoutName,
    moveNode,
    getNode,
    startRunner,
    runnerStatus,
    tick
  } = useTimerStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Computed from store
  const activeWorkout = workouts.find(w => w.id === activeWorkoutId);
  const rootNode = activeWorkout?.rootNode || null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync sound preset with AudioEngine
  const soundPreset = useTimerStore((state) => state.soundPreset);
  useEffect(() => {
    AudioEngine.setPreset(soundPreset);
  }, [soundPreset]);

  // RUNNER ENGINE
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
        const { timeLeft, isMuted, runnerStatus: currentStatus } = state;

        // Double-check we're still active (prevents race conditions)
        if (currentStatus !== 'running' && currentStatus !== 'countdown') {
          return;
        }

        if (!isMuted) {
          if (currentStatus === 'countdown') {
            // "Get Ready" countdown sounds
            if (timeLeft >= 1 && timeLeft <= 5) {
              AudioEngine.playCountdown();
            }
            // "GO!" sound when countdown ends
            if (timeLeft === 1) {
              AudioEngine.playGo();
            }
          } else {
            // Regular workout sounds
            // Countdown beeps at 3, 2, 1 seconds remaining
            if (timeLeft >= 1 && timeLeft <= 3) {
              AudioEngine.playTick();
            }
            // Switch sound when transitioning to next event
            if (timeLeft === 1) {
              AudioEngine.playSwitch();
            }
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Calculate total workout duration for display
  const totalDuration = rootNode ? flattenTree(rootNode).reduce((sum, e) => sum + e.duration, 0) : 0;
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      moveNode(active.id as string, over.id as string);
    }
    setActiveId(null);
  }

  // Helper to render the overlay item
  const renderOverlay = () => {
    if (!activeId) return null;
    const node = getNode(activeId);
    if (!node) return null;

    if (node.type === 'atomic') {
      return <TimerItem node={node} parentId="overlay" />;
    } else {
      return <LoopItem node={node} parentId="overlay" />;
    }
  };

  if (!isMounted) return null;

  // VIEW: DASHBOARD
  if (!activeWorkoutId || !rootNode) {
    return <Dashboard />;
  }

  // VIEW: EDITOR
  return (
    <main className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)] max-w-3xl mx-auto">
      <RunnerOverlay />

      {/* HEADER WITH BACK BUTTON & NAME EDIT */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => setActiveWorkout(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex-1">
            <input
              type="text"
              value={activeWorkout?.name || 'Workout'}
              onChange={(e) => activeWorkout && updateWorkoutName(activeWorkout.id, e.target.value)}
              className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-all px-2 py-1"
            />
            <div className="text-xs text-gray-400 px-2 mt-1 flex items-center gap-2">
              <Clock size={12} />
              <span>Total: {formatDuration(totalDuration)}</span>
            </div>
          </div>

          <button
            onClick={startRunner}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Play size={20} className="fill-current" />
            Start Workout
          </button>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Workout Structure
          </h2>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <LoopItem node={rootNode} parentId="root" />

          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 rotate-2 shadow-2xl cursor-grabbing">
                {renderOverlay()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>
    </main>
  );
}
