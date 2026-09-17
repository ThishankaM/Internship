import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Moon,
  Plus,
  Search,
  Sun,
  Tags,
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

interface TaskToolbarProps {
  user: User | null;
  params: TodoQueryParams;
  onUpdateParams: (params: Partial<TodoQueryParams>) => void;
  onCreate: () => void;
  categories: Category[];
  tags: Tag[];
  onManageTaxonomy: () => void;
}

export function TaskToolbar({
  user,
  params,
  onUpdateParams,
  onCreate,
  categories,
  tags,
  onManageTaxonomy,
}: TaskToolbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState(params.search || "");

  useEffect(() => {
    if (searchTerm === (params.search ?? "")) return;

    const delay = setTimeout(() => {
      onUpdateParams({ search: searchTerm });
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm, params.search, onUpdateParams]);

  return (
    <header className="flex flex-col gap-3 border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="rounded-full pl-9"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
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

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={params.filter}
          items={{ all: "All", active: "Active", completed: "Completed" }}
          onValueChange={(value) =>
            onUpdateParams({ filter: value as TodoQueryParams["filter"] })
          }
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

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
          <SelectTrigger className="w-36">
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
          <SelectTrigger className="w-32">
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

        <Select
          value={params.sortBy}
          items={{
            created_at: "Created Date",
            dueDate: "Due Date",
            title: "Title",
          }}
          onValueChange={(value) => onUpdateParams({ sortBy: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
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

        <Button variant="outline" onClick={onManageTaxonomy}>
          <Tags size={16} className="mr-2" />
          Manage
        </Button>
        <Button onClick={onCreate}>
          <Plus size={16} className="mr-2" />
          New Task
        </Button>
      </div>
    </header>
  );
}
