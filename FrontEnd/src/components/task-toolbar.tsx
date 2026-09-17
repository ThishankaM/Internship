import {
  ArrowUpDown,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskToolbarProps {
  onRefresh: () => void;
  onCreate: () => void;
  user: { id: string; name: string; email: string };
}

export function TaskToolbar({ onRefresh, onCreate, user }: TaskToolbarProps) {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-border px-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks..." className="pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <div className="mr-2 hidden items-center gap-2 border-l border-border pl-3 lg:flex">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-foreground">{user.name}</span>
        </div>
        <Button variant="ghost" size="icon" aria-label="Filter">
          <Filter />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Sort">
          <ArrowUpDown />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh"
          onClick={onRefresh}
        >
          <RefreshCw />
        </Button>
        <Button variant="ghost" size="icon" aria-label="More">
          <MoreVertical />
        </Button>
        <Button onClick={onCreate}>
          <Plus /> New Task
        </Button>
      </div>
    </header>
  );
}
