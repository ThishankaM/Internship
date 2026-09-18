import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/states/empty-state";
import type { Todo } from "@/types/todo";

interface TodayTaskListProps {
  todos: Todo[];
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onAdd: () => void;
}

export function TodayTaskList({
  todos,
  onToggle,
  onEdit,
  onAdd,
}: TodayTaskListProps) {
  return (
    <section className="flex-1 rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-card-foreground">
          All Today&apos;s Tasks
        </h3>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {todos.length === 0 ? (
        <EmptyState
          title="Nothing for today"
          message="Add a task to start filling your day."
          actionLabel="Add task"
          onAction={onAdd}
        />
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => onToggle(todo)}
                aria-label={`Mark "${todo.title}" as ${
                  todo.completed ? "incomplete" : "complete"
                }`}
              />
              <button
                type="button"
                onClick={() => onEdit(todo)}
                className="min-w-0 flex-1 text-left"
              >
                <p
                  className={`truncate text-sm ${
                    todo.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {todo.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {todo.priority} priority
                </p>
              </button>
              <span className="shrink-0 text-xs text-muted-foreground">
                {todo.progress}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
