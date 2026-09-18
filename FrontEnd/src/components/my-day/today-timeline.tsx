import type { Todo } from "@/types/todo";

interface TodayTimelineProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
}

export function TodayTimeline({ todos, onEdit }: TodayTimelineProps) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-card-foreground">
        Today&apos;s Timeline
      </h3>

      {todos.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing on the timeline for today.
        </p>
      ) : (
        <ol className="custom-scrollbar flex-1 space-y-5 overflow-y-auto border-l border-border">
          {todos.map((todo) => (
            <li key={todo.id} className="relative pl-5">
              <span
                className={`absolute left-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full ${
                  todo.completed ? "bg-success" : "bg-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => onEdit(todo)}
                className="w-full text-left"
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
                  {todo.status.replace("-", " ")} · {todo.progress}%
                </p>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
