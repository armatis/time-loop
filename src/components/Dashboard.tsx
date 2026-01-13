import { useTimerStore } from '@/store/useTimerStore';
import { Plus, Trash2, ChevronRight, Timer, Zap, X, Check } from 'lucide-react';
import { PRESETS } from '@/lib/presets';
import { useState } from 'react';

export function Dashboard() {
    const { workouts, createWorkout, deleteWorkout, setActiveWorkout } = useTimerStore();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Timer className="w-8 h-8" />
                    My Workouts
                </h1>
            </div>

            {/* Quick Start Section */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-semibold">Quick Start</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => {
                                const tree = preset.generateTree();
                                createWorkout(tree, preset.name);
                            }}
                            className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <div className="text-3xl">{preset.icon}</div>
                            <div className="text-sm font-bold text-center">{preset.name}</div>
                            <div className="text-xs text-gray-500 text-center leading-tight">{preset.description}</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* My Workouts Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Custom Workouts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Create New Card */}
                    <button
                        onClick={() => createWorkout()}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-900 transition-all group min-h-[160px]"
                    >
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform mb-3">
                            <Plus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Create New Workout</span>
                    </button>

                    {/* Workout Cards */}
                    {workouts.map((workout) => (
                        <div
                            key={workout.id}
                            className="group relative p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
                            onClick={() => setActiveWorkout(workout.id)}
                        >
                            <div>
                                <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {workout.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {workout.rootNode.children.length} items
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="text-xs text-gray-400 font-mono">
                                    ID: {workout.id.slice(0, 4)}...
                                </div>
                                <div className="flex items-center gap-2">
                                    {deletingId === workout.id ? (
                                        <div className="flex items-center gap-1 animate-in slide-in-from-right-2 fade-in duration-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteWorkout(workout.id);
                                                    setDeletingId(null);
                                                }}
                                                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors font-bold text-xs"
                                                title="Confirm Delete"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingId(null);
                                                }}
                                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Cancel"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingId(workout.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete Workout"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <div className="p-2 text-gray-300 group-hover:text-blue-500 transition-colors">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {workouts.length === 0 && (
                    <div className="mt-8 text-center text-gray-400">
                        <p>No custom workouts yet. Start from a preset or create one from scratch!</p>
                    </div>
                )}
            </section>
        </div>
    );
}
