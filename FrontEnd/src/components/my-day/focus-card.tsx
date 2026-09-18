import { Sparkles } from "lucide-react";
import type { Todo } from "@/types/todo";

interface FocusCardProps {
  task: Todo | null;
  onEdit: (todo: Todo) => void;
}

export function FocusCard({ task, onEdit }: FocusCardProps) {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-medium text-card-foreground">
        <Sparkles className="size-4 text-primary" />
        Today&apos;s Focus
      </h3>

      {task ? (
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="mt-3 w-full flex-1 text-left"
        >
          <p className="text-base font-semibold text-foreground">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </button>
      ) : (
        <p className="mt-3 flex-1 text-xs text-muted-foreground">
          Nothing critical — pick something from today&apos;s list.
        </p>
      )}

      <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground italic">
        &ldquo;Small steps every day lead to big results.&rdquo;
      </p>
    </section>
  );
}
