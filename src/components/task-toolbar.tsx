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
}

export function TaskToolbar({ onRefresh, onCreate }: TaskToolbarProps) {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-border px-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks..." className="pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-1">
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
