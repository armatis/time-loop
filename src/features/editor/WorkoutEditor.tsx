'use client';

import { useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { flattenTree } from '@/lib/flattenTree';
import { formatDuration } from '@/lib/format';
import { ArrowLeft, Play, Clock, Save, X } from 'lucide-react';
import { EditorDndProvider } from './context/EditorDndContext';
import { LoopItem } from './components/LoopItem';
import { DiscardModal } from './components/DiscardModal';

export function WorkoutEditor() {
    const {
        activeWorkoutId,
        setActiveWorkout,
        workouts,
        updateWorkoutName,
        startRunner,
        draftWorkout,
        saveDraft,
        discardDraft,
    } = useTimerStore();

    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    // Computed from store - check draft first, then saved workouts
    const isDraft = draftWorkout && draftWorkout.id === activeWorkoutId;
    const activeWorkout = isDraft ? draftWorkout : workouts.find(w => w.id === activeWorkoutId);
    const rootNode = activeWorkout?.rootNode || null;

    // Calculate total workout duration for display
    const totalDuration = rootNode ? flattenTree(rootNode).reduce((sum, e) => sum + e.duration, 0) : 0;

    // Handle back navigation - show confirm if draft
    const handleBack = () => {
        if (isDraft) {
            setShowDiscardConfirm(true);
        } else {
            setActiveWorkout(null);
        }
    };

    const handleConfirmDiscard = () => {
        discardDraft();
        setShowDiscardConfirm(false);
    };

    const handleCancelDiscard = () => {
        setShowDiscardConfirm(false);
    };

    const handleSave = () => {
        saveDraft();
    };

    if (!rootNode) {
        return null;
    }

    return (
        <>
            {/* Discard Confirmation Modal */}
            {showDiscardConfirm && (
                <DiscardModal
                    onConfirm={handleConfirmDiscard}
                    onCancel={handleCancelDiscard}
                />
            )}

            {/* HEADER WITH BACK BUTTON & NAME EDIT */}
            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                {/* Row 1: Back button + Name */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer active:scale-95"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={activeWorkout?.name || 'Workout'}
                                onChange={(e) => activeWorkout && updateWorkoutName(activeWorkout.id, e.target.value)}
                                className="text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-all px-1 py-1 min-h-[44px]"
                            />
                            {isDraft && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded whitespace-nowrap">
                                    Unsaved
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-400 px-1 mt-1 flex items-center gap-2">
                            <Clock size={12} />
                            <span>Total: {formatDuration(totalDuration)}</span>
                        </div>
                    </div>
                </div>

                {/* Row 2: Action buttons */}
                <div className="flex items-center justify-between gap-3">
                    {/* Save/Discard buttons for drafts */}
                    {isDraft ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer active:scale-95"
                                title="Discard"
                            >
                                <X size={18} />
                                <span className="hidden sm:inline">Discard</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-3 min-h-[44px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer active:scale-95"
                                title="Save Workout"
                            >
                                <Save size={18} />
                                <span className="hidden sm:inline">Save</span>
                            </button>
                        </div>
                    ) : (
                        <div />
                    )}

                    <button
                        onClick={startRunner}
                        className="flex items-center gap-2 px-6 py-3 min-h-[48px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <Play size={20} className="fill-current" />
                        Start
                    </button>
                </div>
            </div>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Workout Structure
                    </h2>
                </div>

                <EditorDndProvider>
                    <LoopItem node={rootNode} parentId="root" />
                </EditorDndProvider>
            </section>
        </>
    );
}
