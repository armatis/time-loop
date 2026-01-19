import { TimerNode } from "@/types/timer";
import { Trash2 } from "lucide-react";
import { useTimerStore } from "@/store/useTimerStore";
import { DurationInput } from "./DurationInput";
import { DragHandle } from "./SortableItem";

interface TimerItemProps {
    node: TimerNode;
    parentId: string; // Will be used later for updates
}

export function TimerItem({ node }: TimerItemProps) {
    const { updateNode, deleteNode } = useTimerStore();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
            {/* Row 1 on mobile: Label + Drag Handle */}
            <div className="flex items-center gap-3 sm:flex-1">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Label
                    </label>
                    <input
                        type="text"
                        value={node.label}
                        onChange={(e) => updateNode(node.id, { label: e.target.value })}
                        className="w-full bg-transparent text-sm font-medium focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors min-h-[44px]"
                    />
                </div>
                <div className="sm:hidden">
                    <DragHandle />
                </div>
            </div>

            {/* Row 2 on mobile: Duration + Delete */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block sm:hidden">
                        Duration
                    </label>
                    <DurationInput
                        value={node.duration}
                        onChange={(val) => updateNode(node.id, { duration: val })}
                    />
                </div>

                <button
                    onClick={() => deleteNode(node.id)}
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer"
                    title="Delete Timer"
                >
                    <Trash2 size={18} />
                </button>

                <div className="hidden sm:block">
                    <DragHandle />
                </div>
            </div>
        </div>
    );
}
