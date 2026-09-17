import { useEffect, useState } from "react";
import { Moon, Plus, RefreshCw, Search, Sun } from "lucide-react";
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

interface TaskToolbarProps {
  user: User | null;
  params: TodoQueryParams;
  onUpdateParams: (params: Partial<TodoQueryParams>) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

export function TaskToolbar({
  user,
  params,
  onUpdateParams,
  isRefreshing,
  onRefresh,
  onCreate,
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
    <header className="flex flex-col gap-4 border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Tasks..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="rounded-full pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </Button>
          <Select
            value={params.filter}
            items={{ all: "All", active: "Active", completed: "Completed" }}
            onValueChange={(value) =>
              onUpdateParams({ filter: value as TodoQueryParams["filter"] })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
            <SelectTrigger className="w-36">
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
            {params.sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </Button>
          <Button variant="outline" disabled={isRefreshing} onClick={onRefresh}>
            <RefreshCw
              size={16}
              className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={onCreate}>
            <Plus size={16} className="mr-2" />
            New Task
          </Button>
          {user && (
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <span className="font-medium text-foreground">{user.name}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
