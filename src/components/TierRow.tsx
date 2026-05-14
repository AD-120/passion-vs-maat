import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableItem } from './DraggableItem';
import { TierItem, TierLevel } from '../types';
import { cn } from '../lib/utils';

interface TierRowProps {
  level: TierLevel;
  items: TierItem[];
  key?: string;
}

export function TierRow({ level, items }: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: level.id,
  });

  return (
    <div className="flex mb-1 md:mb-2 min-h-[60px] md:min-h-[90px] bg-bg-subtle border border-border-light rounded-sm overflow-hidden text-right">
      <div 
        className="w-10 md:w-20 shrink-0 flex items-center justify-center text-lg md:text-2xl font-black text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: level.color }}
      >
        {level.name}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-1 flex flex-wrap gap-1 transition-colors min-w-0 overflow-hidden",
          isOver ? "bg-gold/10" : "bg-transparent"
        )}
      >
        <SortableContext items={level.itemIds} strategy={horizontalListSortingStrategy}>
          {items.map((item) => (
            <DraggableItem key={item.id} id={item.id} name={item.name} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
