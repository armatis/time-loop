'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
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
import { LoopItem } from '../components/LoopItem';
import { TimerItem } from '../components/TimerItem';

interface EditorDndContextValue {
    activeId: string | null;
}

const EditorDndContextValue = createContext<EditorDndContextValue>({ activeId: null });

export function useEditorDnd() {
    return useContext(EditorDndContextValue);
}

interface EditorDndProviderProps {
    children: ReactNode;
}

export function EditorDndProvider({ children }: EditorDndProviderProps) {
    const { moveNode, getNode } = useTimerStore();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

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

    return (
        <EditorDndContextValue.Provider value={{ activeId }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {children}

                <DragOverlay>
                    {activeId ? (
                        <div className="opacity-90 rotate-2 shadow-2xl cursor-grabbing">
                            {renderOverlay()}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </EditorDndContextValue.Provider>
    );
}
