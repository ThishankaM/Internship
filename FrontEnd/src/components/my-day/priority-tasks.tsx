import { Flag } from "lucide-react";
import type { Todo } from "@/types/todo";

interface PriorityTasksProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
}

export function PriorityTasks({ todos, onEdit }: PriorityTasksProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-medium text-card-foreground">Priority</h3>

      {todos.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No high-priority tasks right now.
        </p>
      ) : (
        <ul className="space-y-2">
          {todos.slice(0, 4).map((todo) => (
            <li key={todo.id}>
              <button
                type="button"
                onClick={() => onEdit(todo)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-left transition-colors hover:bg-accent"
              >
                <Flag className="size-4 shrink-0 text-secondary-accent" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {todo.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {todo.progress}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
