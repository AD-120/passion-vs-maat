import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { TierRow } from './TierRow';
import { DraggableItem } from './DraggableItem';
import { TierItem, TierListData } from '../types';

interface TierListProps {
  title: string;
  allItems: TierItem[];
  data: TierListData;
  onChange: (newData: TierListData) => void;
  isExporting?: boolean;
}

export function TierList({ title, allItems, data, onChange, isExporting }: TierListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = useCallback((id: string) => {
    if (data.unassignedItems.includes(id)) return 'unassigned';
    return data.levels.find((l) => l.itemIds.includes(id))?.id;
  }, [data]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = data.levels.find(l => l.id === overId) ? overId : findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const newData = { ...data };
    
    // Remove from old container
    if (activeContainer === 'unassigned') {
      newData.unassignedItems = newData.unassignedItems.filter(id => id !== activeId);
    } else {
      const level = newData.levels.find(l => l.id === activeContainer);
      if (level) level.itemIds = level.itemIds.filter(id => id !== activeId);
    }

    // Add to new container
    if (overContainer === 'unassigned') {
      newData.unassignedItems = [...newData.unassignedItems, activeId];
    } else if (overContainer) {
      const level = newData.levels.find(l => l.id === overContainer);
      if (level) {
        const overIndex = level.itemIds.indexOf(overId);
        if (overIndex !== -1) {
          level.itemIds.splice(overIndex, 0, activeId);
        } else {
          level.itemIds.push(activeId);
        }
      }
    }

    onChange(newData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = data.levels.find(l => l.id === overId) ? overId : findContainer(overId);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const newData = { ...data };
      if (activeContainer === 'unassigned') {
        const oldIndex = newData.unassignedItems.indexOf(activeId);
        const newIndex = newData.unassignedItems.indexOf(overId);
        newData.unassignedItems = arrayMove(newData.unassignedItems, oldIndex, newIndex);
      } else {
        const level = newData.levels.find(l => l.id === activeContainer);
        if (level) {
          const oldIndex = level.itemIds.indexOf(activeId);
          const newIndex = level.itemIds.indexOf(overId);
          level.itemIds = arrayMove(level.itemIds, oldIndex, newIndex);
        }
      }
      onChange(newData);
    }

    setActiveId(null);
  };

  const getActiveItem = () => {
    if (!activeId) return null;
    return allItems.find(i => i.id === activeId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn(
        "w-full bg-white border border-border-light overflow-hidden shadow-sm flex flex-row",
        isExporting ? "h-auto" : "h-[500px] md:h-[700px]"
      )}>
        <div className={cn(
          "flex-1 p-1 md:p-3 bg-white",
          !isExporting && "overflow-y-auto"
        )}>
          <div className="flex flex-col gap-1">
            {data.levels.map((level) => (
              <TierRow
                key={level.id}
                level={level}
                items={level.itemIds.map(id => allItems.find(i => i.id === id)!).filter(Boolean)}
              />
            ))}
          </div>
        </div>

        {!isExporting && (
          <div className="w-24 md:w-72 bg-bg-subtle border-r border-border-light flex flex-col p-2 md:p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] shrink-0">
            <h3 className="text-[9px] md:text-[10px] font-bold text-gold uppercase tracking-[1px] md:tracking-[2px] mb-2 md:mb-4 border-b border-border-light pb-2 text-center leading-tight">
              {title === 'הצהרות המעת' ? 'מאזני המשפט' : 'קוד הבושידו'}
            </h3>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="flex flex-col gap-1.5 md:gap-2 min-h-[80px] p-1">
                <SortableContext items={data.unassignedItems} strategy={verticalListSortingStrategy}>
                  {data.unassignedItems.map((id) => (
                    <DraggableItem
                      key={id}
                      id={id}
                      name={allItems.find(i => i.id === id)?.name || ''}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>
            <p className="mt-2 md:mt-4 text-[8px] md:text-[10px] text-ink/40 italic leading-tight text-center">
              גרור את המידות
            </p>
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeId ? (
          <DraggableItem 
            id={activeId} 
            name={getActiveItem()?.name || ''} 
            className="rotate-2 shadow-2xl scale-105 border-gold border-r-4 border-r-crimson"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
