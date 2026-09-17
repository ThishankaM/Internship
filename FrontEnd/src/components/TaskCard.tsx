import { format, isBefore, parseISO, startOfToday } from "date-fns";
import { Loader2, MessageSquare, MoreHorizontal, Paperclip } from "lucide-react";
import type { Todo, TodoPriority, TodoStatus } from "@/types/todo";

interface TaskCardProps {
  todo: Todo;
  isDeleting?: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const PROGRESS_COLORS: Record<TodoStatus, string> = {
  todo: "bg-muted-foreground/60",
  "in-progress": "bg-primary",
  done: "bg-success",
};

export function TaskCard({
  todo,
  isDeleting = false,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const dueDate = todo.dueDate ? parseISO(todo.dueDate) : null;
  const isOverdue = dueDate
    ? isBefore(dueDate, startOfToday()) && !todo.completed
    : false;
  const formattedDate = dueDate ? format(dueDate, "MMM d, yyyy") : "No Due Date";

  const getPriorityColor = (priority: TodoPriority) => {
    if (priority === "HIGH") return "text-destructive bg-destructive/10";
    if (priority === "MEDIUM") {
      return "text-secondary-accent bg-secondary-accent/10";
    }
    return "text-primary bg-primary/10";
  };

  return (
    <div
      className={`mb-4 rounded-xl border border-border bg-card p-4 text-card-foreground transition-opacity ${
        isDeleting ? "pointer-events-none opacity-40" : ""
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-medium text-card-foreground">
            {todo.title}
          </h4>
          {todo.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {todo.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getPriorityColor(todo.priority)}`}
          >
            {todo.priority}
          </span>
          {isDeleting ? (
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          ) : (
            <details className="relative">
              <summary className="list-none cursor-pointer text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                <MoreHorizontal size={16} />
              </summary>
              <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-md">
                <button
                  type="button"
                  onClick={() => onEdit(todo)}
                  className="block w-full rounded px-2 py-1.5 text-left transition-colors hover:bg-accent"
                >
                  Edit Task
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(todo.id)}
                  className="block w-full rounded px-2 py-1.5 text-left text-destructive transition-colors hover:bg-accent"
                >
                  Delete Task
                </button>
              </div>
            </details>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-end text-xs text-muted-foreground">
          Progress {todo.progress}%
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${PROGRESS_COLORS[todo.status]}`}
            style={{ width: `${todo.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div
          className={`rounded-full px-3 py-1 text-xs ${
            isOverdue
              ? "border border-destructive/50 bg-destructive/20 font-bold text-destructive"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {formattedDate}
          {isOverdue && " (Overdue)"}
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare size={14} /> {todo.comments}
          </span>
          <span className="flex items-center gap-1">
            <Paperclip size={14} /> {todo.attachments}
          </span>
        </div>
      </div>

      {(todo.category || (todo.tags && todo.tags.length > 0)) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {todo.category && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              {todo.category.name}
            </span>
          )}
          {todo.tags?.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
