import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Todo, TodoStatus } from "@/types/todo";

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

const STATUS_BADGES: Record<TodoStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  "in-progress": "bg-secondary-accent/15 text-secondary-accent",
  done: "bg-success/15 text-success",
};

interface TaskCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ todo, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="group gap-3 py-4">
      <CardHeader className="px-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{todo.title}</CardTitle>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGES[todo.status]}`}
          >
            {STATUS_LABELS[todo.status]}
          </span>
        </div>
        {todo.description && (
          <CardDescription className="line-clamp-2">
            {todo.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex justify-end gap-1 px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(todo)}
          aria-label="Edit todo"
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete todo"
        >
          <Trash2 />
        </Button>
      </CardContent>
    </Card>
  );
}
