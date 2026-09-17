import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/** Skeleton placeholder cards for the Kanban columns. */
export function TaskCardSkeleton() {
  return (
    <div className="mb-4 animate-pulse rounded-xl border border-border bg-card p-4">
      <div className="mb-3 h-4 w-2/3 rounded bg-muted" />
      <div className="mb-5 h-3 w-1/2 rounded bg-muted" />
      <div className="mb-4 h-1.5 w-full rounded-full bg-muted" />
      <div className="flex justify-between">
        <div className="h-6 w-24 rounded-full bg-muted" />
        <div className="h-6 w-16 rounded bg-muted" />
      </div>
    </div>
  );
}
