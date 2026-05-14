import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableItem } from './DraggableItem';
import { TierItem, TierLevel } from '../types';
import { cn } from '../lib/utils';

interface TierRowProps {
  level: TierLevel;
  items: TierItem[];
}

export function TierRow({ level, items }: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: level.id,
  });

  return (
    <div className="flex mb-1 md:mb-2 min-h-[70px] md:min-h-[90px] bg-white/5 border border-white/5 rounded-sm overflow-hidden text-right">
      <div 
        className="w-12 md:w-20 shrink-0 flex items-center justify-center text-xl md:text-2xl font-black text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"
        style={{ backgroundColor: level.color }}
      >
        {level.name}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-1.5 md:p-2 flex flex-wrap gap-1 md:gap-1.5 transition-colors",
          isOver ? "bg-white/10" : "bg-transparent"
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
