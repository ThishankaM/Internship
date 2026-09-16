import { TaskCard } from "@/components/TaskCard";
import type { Todo } from "@/types/todo";

interface KanbanColumnProps {
  title: string;
  count: number;
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function KanbanColumn({
  title,
  count,
  todos,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl bg-muted/30 p-2">
        {todos.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-12 text-center text-sm text-muted-foreground">
            No tasks yet
          </div>
        ) : (
          todos.map((todo) => (
            <TaskCard
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
