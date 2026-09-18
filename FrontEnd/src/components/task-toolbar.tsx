import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  Tags,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import type { TodoQueryParams } from "@/types/api";
import type { User } from "@/types/auth";
import type { Category, Tag } from "@/types/todo";
import type { Project } from "@/types/project";

interface TaskToolbarProps {
  user: User | null;
  params: TodoQueryParams;
  onUpdateParams: (params: Partial<TodoQueryParams>) => void;
  onCreate: () => void;
  categories: Category[];
  tags: Tag[];
  projects: Project[];
  onManageTaxonomy: () => void;
  onToggleSidebar: () => void;
}

export function TaskToolbar({
  user,
  params,
  onUpdateParams,
  onCreate,
  categories,
  tags,
  projects,
  onManageTaxonomy,
  onToggleSidebar,
}: TaskToolbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState(params.search || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (searchTerm === (params.search ?? "")) return;

    const delay = setTimeout(() => {
      onUpdateParams({ search: searchTerm });
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm, params.search, onUpdateParams]);

  const activeFilterCount = [
    params.filter && params.filter !== "all",
    params.categoryId,
    params.tagId,
    params.projectId,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onUpdateParams({
      filter: "all",
      categoryId: undefined,
      tagId: undefined,
      projectId: undefined,
      search: undefined,
    });
    setSearchTerm("");
  };

  return (
    <header className="flex flex-col gap-3 border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
          className="md:hidden"
        >
          <Menu />
        </Button>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="rounded-full pl-9"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter size={14} className="mr-1.5" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </Button>
          {user && (
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <span className="hidden font-medium text-foreground sm:inline">
                {user.name}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium">Filter Tasks</h4>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X size={14} className="mr-1" /> Clear
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                Close
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={params.filter ?? "all"}
                items={{ all: "All", active: "Active", completed: "Completed" }}
                onValueChange={(value) =>
                  onUpdateParams({ filter: value as TodoQueryParams["filter"] })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Project</label>
              <Select
                value={params.projectId ?? "all"}
                items={{
                  all: "All Projects",
                  ...Object.fromEntries(
                    projects.map((p) => [p.id, p.name])
                  ),
                }}
                onValueChange={(value) =>
                  onUpdateParams({
                    projectId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select
                value={params.categoryId ?? "all"}
                items={{
                  all: "All Categories",
                  ...Object.fromEntries(
                    categories.map((category) => [category.id, category.name])
                  ),
                }}
                onValueChange={(value) =>
                  onUpdateParams({
                    categoryId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Tag</label>
              <Select
                value={params.tagId ?? "all"}
                items={{
                  all: "All Tags",
                  ...Object.fromEntries(tags.map((tag) => [tag.id, tag.name])),
                }}
                onValueChange={(value) =>
                  onUpdateParams({ tagId: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Select
              value={params.sortBy ?? "created_at"}
              items={{
                created_at: "Created Date",
                dueDate: "Due Date",
                scheduledStart: "Scheduled",
                title: "Title",
                priority: "Priority",
              }}
              onValueChange={(value) => onUpdateParams({ sortBy: value })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="scheduledStart">Scheduled</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdateParams({
                  sortOrder: params.sortOrder === "asc" ? "desc" : "asc",
                })
              }
            >
              {params.sortOrder === "asc" ? (
                <ArrowUp className="mr-1.5 size-4" />
              ) : (
                <ArrowDown className="mr-1.5 size-4" />
              )}
              {params.sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!showFilters && (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {params.projectId && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                  Project: {projects.find((p) => p.id === params.projectId)?.name}
                  <button onClick={() => onUpdateParams({ projectId: undefined })}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {params.categoryId && (
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                  {categories.find((c) => c.id === params.categoryId)?.name}
                  <button onClick={() => onUpdateParams({ categoryId: undefined })}>
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={onManageTaxonomy}>
            <Tags size={16} className="mr-2" />
            Manage
          </Button>
          <Button onClick={onCreate}>
            <Plus size={16} className="mr-2" />
            New Task
          </Button>
        </div>
      </div>
    </header>
  );
}
