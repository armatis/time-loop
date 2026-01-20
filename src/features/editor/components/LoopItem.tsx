import { LoopNode } from "@/types/timer";
import { TimerItem } from "./TimerItem";
import { ChevronDown, ChevronRight, Plus, Repeat, Trash2 } from "lucide-react";
import { useTimerStore } from "@/store/useTimerStore";
import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem, DragHandle } from "./SortableItem";

interface LoopItemProps {
    node: LoopNode;
    parentId: string;
}

export function LoopItem({ node, parentId }: LoopItemProps) {
    const { addNode, updateNode, deleteNode } = useTimerStore();
    const [isFocused, setIsFocused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const canCollapse = parentId !== 'root';

    return (
        <div className="border-2 border-blue-500/20 rounded-xl p-4 space-y-4 bg-white dark:bg-zinc-900/50">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                {parentId !== 'root' && <DragHandle />}

                {canCollapse && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                )}

                <div className="p-2 sm:p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Repeat size={20} />
                </div>

                <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                        Iterations
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400">x</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={isFocused && node.iterations === 0 ? '' : node.iterations}
                            min={1}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => {
                                const val = e.target.value;
                                const num = val === '' ? 0 : parseInt(val);
                                if (!isNaN(num)) {
                                    updateNode(node.id, { iterations: num });
                                }
                            }}
                            className="w-20 bg-transparent text-lg font-bold focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors min-h-[44px]"
                        />
                    </div>
                </div>

                {parentId !== 'root' && (
                    <button
                        onClick={() => deleteNode(node.id)}
                        className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer"
                        title="Delete Loop"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            {isExpanded ? (
                <>
                    {/* Children */}
                    <div className="space-y-3 pl-3 sm:pl-4 pr-1 border-l-2 border-gray-100 dark:border-zinc-800">
                        <SortableContext
                            items={node.children.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {node.children.map((child) => (
                                <SortableItem key={child.id} id={child.id}>
                                    {child.type === 'atomic' ? (
                                        <TimerItem node={child} parentId={node.id} />
                                    ) : (
                                        <LoopItem node={child} parentId={node.id} />
                                    )}
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => addNode(node.id, 'atomic')}
                            className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer active:scale-95"
                        >
                            <Plus size={16} />
                            Add Timer
                        </button>
                        <button
                            onClick={() => addNode(node.id, 'loop')}
                            className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors cursor-pointer active:scale-95"
                        >
                            <Plus size={16} />
                            Add Loop
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 pl-4 py-2">
                    {node.children.length} item{node.children.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
