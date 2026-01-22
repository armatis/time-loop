import { LoopNode } from "@/types/timer";
import { TimerItem } from "./TimerItem";
import { ChevronDown, ChevronRight, Minus, Plus, Repeat, Trash2 } from "lucide-react";
import { useTimerStore } from "@/store/useTimerStore";
import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem, DragHandle } from "./SortableItem";

interface LoopItemProps {
    node: LoopNode;
    parentId: string;
    depth?: number;
}

export function LoopItem({ node, parentId, depth = 0 }: LoopItemProps) {
    const { addNode, updateNode, deleteNode } = useTimerStore();
    const [isFocused, setIsFocused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const canCollapse = parentId !== 'root';

    return (
        <div className="border-2 border-blue-500/20 rounded-xl p-4 space-y-4 bg-white dark:bg-zinc-900/50">
            {/* Header - stacked on mobile, horizontal on sm+ */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pb-2 border-b border-gray-100 dark:border-zinc-800">
                {/* Row 1 (mobile) / Left side (desktop): Drag, collapse, loop icon */}
                <div className="flex items-center gap-2">
                    {parentId !== 'root' && <DragHandle />}

                    {canCollapse && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    )}

                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Repeat size={16} />
                    </div>

                    {/* Delete button - mobile only, at end of row */}
                    <div className="flex-1 sm:hidden" />
                    {parentId !== 'root' && (
                        <button
                            onClick={() => deleteNode(node.id)}
                            className="sm:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer"
                            title="Delete Loop"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                {/* Row 2 (mobile) / Middle (desktop): Iterations control */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => updateNode(node.id, { iterations: Math.max(1, node.iterations - 1) })}
                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                    >
                        <Minus size={14} />
                    </button>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={isFocused && node.iterations === 0 ? '' : node.iterations}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const num = val === '' ? 0 : parseInt(val);
                            if (!isNaN(num)) {
                                updateNode(node.id, { iterations: num });
                            }
                        }}
                        className="w-12 text-center text-lg font-bold bg-transparent focus:outline-none min-h-[44px]"
                    />
                    <button
                        onClick={() => updateNode(node.id, { iterations: node.iterations + 1 })}
                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {/* Spacer + Delete button - desktop only */}
                <div className="hidden sm:block flex-1" />
                {parentId !== 'root' && (
                    <button
                        onClick={() => deleteNode(node.id)}
                        className="hidden sm:flex p-2 min-h-[44px] min-w-[44px] items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer"
                        title="Delete Loop"
                    >
                        <Trash2 size={14} />
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
                                        <LoopItem node={child} parentId={node.id} depth={depth + 1} />
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
                        {depth < 2 && (
                            <button
                                onClick={() => addNode(node.id, 'loop')}
                                className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors cursor-pointer active:scale-95"
                            >
                                <Plus size={16} />
                                Add Loop
                            </button>
                        )}
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
