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
        <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
            <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Label
                </label>
                <input
                    type="text"
                    value={node.label}
                    onChange={(e) => updateNode(node.id, { label: e.target.value })}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    Duration
                </label>
                <DurationInput
                    value={node.duration}
                    onChange={(val) => updateNode(node.id, { duration: val })}
                />
            </div>

            <button
                onClick={() => deleteNode(node.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer"
                title="Delete Timer"
            >
                <Trash2 size={16} />
            </button>

            <DragHandle />
        </div>
    );
}
