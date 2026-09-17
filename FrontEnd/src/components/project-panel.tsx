import React from "react";
import { MoreVertical } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import type { Todo } from "@/types/todo";

interface ProjectPanelProps {
  todos: Todo[];
  isLoading: boolean;
}

function ProgressRing({ value }: { value: number }) {
  const size = 40;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex size-10 shrink-0 items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-all"
        />
      </svg>
      <span className="absolute text-[10px] font-medium text-foreground">
        {clamped}%
      </span>
    </div>
  );
}

export function ProjectPanel({ todos, isLoading }: ProjectPanelProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const topProjects = todos.slice(0, 4);

  return (
    <aside className="hidden w-72 flex-col gap-6 overflow-y-auto border-l border-border bg-sidebar p-6 lg:flex">
      <div className="flex items-center gap-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full rounded-lg border"
          captionLayout="dropdown"
        />
      </div>

      <div className="flex-1 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-card-foreground">Today's Project</h3>
          <MoreVertical size={16} className="text-muted-foreground" />
        </div>

        {isLoading && <LoadingState message="Loading projects..." />}

        {!isLoading && topProjects.length === 0 && (
          <EmptyState title="No projects" message="Your tasks will appear here." />
        )}

        {!isLoading &&
          topProjects.map((todo) => (
            <div
              key={todo.id}
              className="mb-3 flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3"
            >
              <div className="min-w-0">
                <h4 className="truncate text-sm text-foreground">{todo.title}</h4>
                <p className="truncate text-xs text-muted-foreground">
                  {todo.description || "No description"}
                </p>
              </div>
              <ProgressRing value={todo.progress} />
            </div>
          ))}
      </div>
    </aside>
  );
}
