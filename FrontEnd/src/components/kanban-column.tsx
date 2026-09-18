import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/react";
import { TaskCard } from "@/components/TaskCard";
import { TaskCardSkeleton } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import type { Todo, TodoStatus } from "@/types/todo";

interface KanbanColumnProps {
  status: TodoStatus;
  title: string;
  count: number;
  todos: Todo[];
  isLoading?: boolean;
  deletingId?: string | null;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onCreate?: () => void;
}

export function KanbanColumn({
  status,
  title,
  count,
  todos,
  isLoading = false,
  deletingId = null,
  onEdit,
  onDelete,
  onCreate,
}: KanbanColumnProps) {
  const { ref, isDropTarget } = useDroppable({ id: status });

  return (
    <div
      ref={ref}
      className={`flex min-w-[220px] flex-1 flex-col rounded-xl border bg-card p-4 transition-colors ${
        isDropTarget ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-card-foreground">
          {title}
          {!isLoading && (
            <span className="ml-2 text-xs text-muted-foreground">{count}</span>
          )}
        </h3>
        {onCreate && (
          <button
            onClick={onCreate}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Add task to ${title}`}
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
        {isLoading && (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        )}

        {!isLoading && todos.length === 0 && (
          <EmptyState
            title="No tasks"
            message={`Nothing in "${title}" right now.`}
            actionLabel={onCreate ? "Add task" : undefined}
            onAction={onCreate}
          />
        )}

        {!isLoading &&
          todos.map((todo) => (
            <TaskCard
              key={todo.id}
              todo={todo}
              isDeleting={deletingId === todo.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </div>
    </div>
  );
}
