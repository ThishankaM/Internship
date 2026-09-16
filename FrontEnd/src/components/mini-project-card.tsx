interface MiniProjectCardProps {
  title: string;
  tasks: number;
  progress: number;
  color: string;
}

export function MiniProjectCard({
  title,
  tasks,
  progress,
  color,
}: MiniProjectCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{title}</span>
        <span className={`size-2.5 rounded-full ${color}`} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{tasks} tasks</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
