import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Todo, TodoStatus } from "@/types/todo";

const STATUS_OPTIONS: TodoStatus[] = ["todo", "in-progress", "done"];

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todoData: Partial<Todo>) => void;
  editingTodo: Todo | null;
}

export function TodoModal({
  isOpen,
  onClose,
  onSave,
  editingTodo,
}: TodoModalProps) {
  const [title, setTitle] = useState(editingTodo?.title ?? "");
  const [description, setDescription] = useState(
    editingTodo?.description ?? ""
  );
  const [status, setStatus] = useState<TodoStatus>(
    editingTodo?.status ?? "todo"
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      status,
    });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTodo ? "Edit todo" : "Create todo"}</DialogTitle>
          <DialogDescription>
            {editingTodo
              ? "Update the task details below."
              : "Add a new task to your board."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="todo-title">Title</Label>
            <Input
              id="todo-title"
              placeholder="Task title"
              value={title}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setTitle(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="todo-description">Description</Label>
            <Textarea
              id="todo-description"
              placeholder="Optional description"
              rows={3}
              value={description}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="todo-status">Status</Label>
            <select
              id="todo-status"
              value={status}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setStatus(event.target.value as TodoStatus)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option}
                  value={option}
                  className="bg-popover text-popover-foreground"
                >
                  {option}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTodo ? "Save changes" : "Create todo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
