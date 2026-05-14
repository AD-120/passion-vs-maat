import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';

interface DraggableItemProps {
  id: string;
  name: string;
  className?: string;
  key?: string;
}

export function DraggableItem({ id, name, className }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white border border-border-light text-ink rounded-sm px-2.5 md:px-3 py-1.5 md:py-2 text-[11px] md:text-xs shadow-sm cursor-grab active:cursor-grabbing hover:border-gold/50 transition-colors select-none",
        "border-r-4 border-r-crimson max-w-full break-words font-medium",
        isDragging && "opacity-50 z-50",
        className
      )}
    >
      {name}
    </div>
  );
}
