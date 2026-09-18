import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface TodayProgressProps {
  completed: number;
  total: number;
  overdue: number;
}

export function TodayProgress({
  completed,
  total,
  overdue,
}: TodayProgressProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-card-foreground">
          Today&apos;s Progress
        </h3>
        <span className="text-xs text-muted-foreground">
          {completed}/{total} tasks completed
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-success" />
          {percent}% complete
        </span>
        {overdue > 0 && (
          <span className="flex items-center gap-1.5 text-destructive">
            <AlertTriangle className="size-3.5" />
            {overdue} overdue
          </span>
        )}
      </div>
    </section>
  );
}
