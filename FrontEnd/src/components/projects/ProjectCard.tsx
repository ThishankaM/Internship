import { MoreHorizontal, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
  onSelect: (p: Project) => void;
  isDeleting?: boolean;
}

export function ProjectCard({ project, onEdit, onDelete, onSelect, isDeleting }: ProjectCardProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const menu = menuRef.current;
      if (menu && e.target instanceof Node && !menu.contains(e.target)) {
        menu.open = false;
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isMenuOpen]);

  const progress = project.stats?.progress ?? 0;
  const total = project.stats?.total ?? project._count?.todos ?? 0;
  const completed = project.stats?.completed ?? 0;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20 ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: project.color || "#8A73FF" }}
          >
            <Briefcase className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-card-foreground">{project.name}</h3>
            <p className="truncate text-xs text-muted-foreground">
              {project.description || "No description"}
            </p>
          </div>
        </div>

        <details
          ref={menuRef}
          onToggle={(e) => setIsMenuOpen(e.currentTarget.open)}
          className="relative"
        >
          <summary className="list-none cursor-pointer text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            <MoreHorizontal size={16} />
          </summary>
          <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-border bg-popover p-1 text-sm shadow-md">
            <button
              onClick={() => {
                if (menuRef.current) menuRef.current.open = false;
                setIsMenuOpen(false);
                onEdit(project);
              }}
              className="block w-full rounded px-2 py-1.5 text-left hover:bg-accent"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (menuRef.current) menuRef.current.open = false;
                setIsMenuOpen(false);
                onDelete(project.id);
              }}
              className="block w-full rounded px-2 py-1.5 text-left text-destructive hover:bg-accent"
            >
              Delete
            </button>
          </div>
        </details>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} /> {completed}/{total} done
          </span>
          {project.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {project.dueDate}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onSelect(project)}
          className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          View Tasks
        </button>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
            project.status === "active"
              ? "bg-primary/10 text-primary"
              : project.status === "completed"
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {project.status}
        </span>
      </div>
    </div>
  );
}
