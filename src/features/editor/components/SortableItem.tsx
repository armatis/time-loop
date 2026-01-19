import React, { createContext, useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableContextType {
    attributes: any;
    listeners: any;
}

const SortableContext = createContext<SortableContextType>({
    attributes: {},
    listeners: {},
});

export function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <SortableContext.Provider value={{ attributes, listeners }}>
            <div
                ref={setNodeRef}
                style={style}
                className={`h-full transition-opacity ${isDragging ? 'opacity-30 grayscale' : 'opacity-100'}`}
            >
                {children}
            </div>
        </SortableContext.Provider>
    );
}

export function DragHandle() {
    const { attributes, listeners } = useContext(SortableContext);

    return (
        <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center touch-none active:cursor-grabbing"
            aria-label="Drag to reorder"
        >
            <GripVertical size={22} />
        </button>
    );
}
