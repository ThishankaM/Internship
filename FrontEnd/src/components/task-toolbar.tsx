import {
  Moon,
  Plus,
  RefreshCw,
  Search,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import type { User } from "@/types/auth";

interface TaskToolbarProps {
  user: User | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

export function TaskToolbar({
  user,
  isRefreshing,
  onRefresh,
  onCreate,
}: TaskToolbarProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks..." className="pl-9" />
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
        <Button
          variant="outline"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          <RefreshCw
            size={16}
            className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
        <Button onClick={onCreate}>
          <Plus size={16} className="mr-2" />
          Create Task
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
    </header>
  );
}
