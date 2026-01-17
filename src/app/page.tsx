'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { Dashboard } from '@/features/dashboard';
import { RunnerOverlay } from '@/features/runner';
import { WorkoutEditor } from '@/features/editor';
import { useThemeSync } from '@/hooks/useThemeSync';
import { useSoundPresetSync } from '@/hooks/useSoundPresetSync';

export default function Home() {
  const { activeWorkoutId, workouts, draftWorkout } = useTimerStore();

  const [isMounted, setIsMounted] = useState(false);

  // Computed from store - check draft first, then saved workouts
  const isDraft = draftWorkout && draftWorkout.id === activeWorkoutId;
  const activeWorkout = isDraft ? draftWorkout : workouts.find(w => w.id === activeWorkoutId);
  const rootNode = activeWorkout?.rootNode || null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Apply theme and sound preset settings
  useThemeSync();
  useSoundPresetSync();

  if (!isMounted) return null;

  // VIEW: DASHBOARD
  if (!activeWorkoutId || !rootNode) {
    return <Dashboard />;
  }

  // VIEW: EDITOR
  return (
    <main className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)] max-w-3xl mx-auto">
      <RunnerOverlay />
      <WorkoutEditor />
    </main>
  );
}
