import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStart,
  DragOver,
  DragEnd,
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
import { TierRow } from './TierRow';
import { DraggableItem } from './DraggableItem';
import { TierItem, TierListData } from '../types';

interface TierListProps {
  title: string;
  allItems: TierItem[];
  data: TierListData;
  onChange: (newData: TierListData) => void;
}

export function TierList({ title, allItems, data, onChange }: TierListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

  const handleDragStart = (event: DragStart) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOver) => {
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

  const handleDragEnd = (event: DragEnd) => {
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
      <div className="w-full bg-card-dark border border-[#333] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px] md:min-h-[500px]">
        <div className="flex-1 p-2 md:p-3">
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

        <div className="w-full md:w-72 bg-card-dark border-t md:border-t-0 md:border-r border-[#333] flex flex-col p-3 md:p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-[10px] font-bold text-gold uppercase tracking-[2px] mb-3 md:mb-4 border-b border-[#333] pb-2 text-center">
            {title === 'הצהרות המעת' ? 'מאזני המשפט' : 'קוד הבושידו'}
          </h3>
          <div className="max-h-[250px] md:max-h-none flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 min-h-[80px]">
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
          <p className="mt-3 md:mt-4 text-[9px] md:text-[10px] text-ink/40 italic leading-relaxed text-center">
            גרור את המידות לדרגת הדירוג המתאימה לפי הקושי האישי שלך
          </p>
        </div>
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
