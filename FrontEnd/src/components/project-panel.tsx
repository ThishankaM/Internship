import React from "react";
import { MoreVertical, Briefcase } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import type { Project } from "@/types/project";

interface ProjectPanelProps {
  projects: Project[];
  isLoading: boolean;
  onSelectProject?: (project: Project) => void;
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

export function ProjectPanel({ projects, isLoading, onSelectProject }: ProjectPanelProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const topProjects = projects.slice(0, 4);

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
          <h3 className="font-medium text-card-foreground">Today's Projects</h3>
          <MoreVertical size={16} className="text-muted-foreground" />
        </div>

        {isLoading && <LoadingState message="Loading projects..." />}

        {!isLoading && topProjects.length === 0 && (
          <EmptyState
            title="No projects"
            message="Create a project to organize your tasks."
          />
        )}

        {!isLoading &&
          topProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject?.(project)}
              className="mb-3 flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: project.color || "#8A73FF" }}
                >
                  <Briefcase size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm text-foreground">
                    {project.name}
                  </h4>
                  <p className="truncate text-xs text-muted-foreground">
                    {project.stats ? `${project.stats.completed}/${project.stats.total} tasks` : project.description || "No description"}
                  </p>
                </div>
              </div>
              <ProgressRing value={project.stats?.progress ?? 0} />
            </button>
          ))}

        {projects.length > 4 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            +{projects.length - 4} more projects
          </p>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card/50 p-4">
        <h4 className="text-xs font-medium text-foreground">Tip</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Due date = deadline. Scheduled time = when you work on it. Use both for better planning.
        </p>
      </div>
    </aside>
  );
}
