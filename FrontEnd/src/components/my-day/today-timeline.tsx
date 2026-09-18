import { format, parseISO } from "date-fns";
import type { Todo } from "@/types/todo";

interface TodayTimelineProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
}

function getDisplayTime(todo: Todo): string {
  if (todo.scheduledStart) {
    try {
      const start = parseISO(todo.scheduledStart);
      const end = todo.scheduledEnd ? parseISO(todo.scheduledEnd) : null;
      if (end) {
        return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
      }
      return format(start, "HH:mm");
    } catch {
      return todo.status;
    }
  }
  if (todo.dueDate) {
    return `Due ${todo.dueDate}`;
  }
  return todo.status.replace("-", " ");
}

export function TodayTimeline({ todos, onEdit }: TodayTimelineProps) {
  // sort by scheduledStart if available
  const sorted = [...todos].sort((a, b) => {
    const aTime = a.scheduledStart ? parseISO(a.scheduledStart).getTime() : 0;
    const bTime = b.scheduledStart ? parseISO(b.scheduledStart).getTime() : 0;
    if (aTime && bTime) return aTime - bTime;
    if (aTime) return -1;
    if (bTime) return 1;
    return 0;
  });

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-card-foreground">
        Today's Timeline
      </h3>

      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing on the timeline for today. Schedule tasks with start/end times to see them here.
        </p>
      ) : (
        <ol className="custom-scrollbar flex-1 space-y-5 overflow-y-auto border-l border-border">
          {sorted.map((todo) => (
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
                  {getDisplayTime(todo)} · {todo.progress}%
                  {todo.project && ` · ${todo.project.name}`}
                </p>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
