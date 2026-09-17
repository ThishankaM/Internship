import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Category,
  CreateTodoRequest,
  Tag,
  Todo,
  TodoPriority,
  TodoStatus,
} from "@/types/todo";

interface TodoModalProps {
  isOpen: boolean;
  isSaving: boolean;
  serverError: string | null;
  editingTodo: Todo | null;
  categories: Category[];
  tags: Tag[];
  onClose: () => void;
  onSave: (payload: CreateTodoRequest) => Promise<boolean>;
}

const STATUS_OPTIONS: { value: TodoStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export function TodoModal({
  isOpen,
  isSaving,
  serverError,
  editingTodo,
  categories,
  tags,
  onClose,
  onSave,
}: TodoModalProps) {
  const [title, setTitle] = useState(editingTodo?.title ?? "");
  const [description, setDescription] = useState(
    editingTodo?.description ?? ""
  );
  const [status, setStatus] = useState<TodoStatus>(
    editingTodo?.status ?? "todo"
  );
  const [progress, setProgress] = useState(
    String(editingTodo?.progress ?? 0)
  );
  const [priority, setPriority] = useState(editingTodo?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(editingTodo?.dueDate ?? "");
  const [categoryId, setCategoryId] = useState(
    editingTodo?.category?.id ?? ""
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    editingTodo?.tags?.map((tag) => tag.id) ?? []
  );
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setValidationError("Title is required.");
      return;
    }
    setValidationError("");

    const success = await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      progress: Number(progress) || 0,
      completed: status === "done",
      priority,
      dueDate: dueDate || undefined,
      categoryId: categoryId || null,
      tagIds: selectedTagIds.length ? selectedTagIds : undefined,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isSaving && !open && onClose()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingTodo ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        {serverError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="todo-title">Title *</Label>
            <Input
              id="todo-title"
              value={title}
              disabled={isSaving}
              onChange={(event) => {
                setTitle(event.target.value);
                if (validationError) setValidationError("");
              }}
            />
            {validationError && (
              <p className="text-xs text-destructive">{validationError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="todo-description">Description</Label>
            <Textarea
              id="todo-description"
              rows={3}
              value={description}
              disabled={isSaving}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="todo-status">Status</Label>
              <select
                id="todo-status"
                value={status}
                disabled={isSaving}
                onChange={(event) =>
                  setStatus(event.target.value as TodoStatus)
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-progress">Progress (%)</Label>
              <Input
                id="todo-progress"
                type="number"
                min="0"
                max="100"
                disabled={isSaving}
                value={progress}
                onChange={(event) => setProgress(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="todo-priority">Priority</Label>
              <Select
                value={priority}
                items={{ LOW: "Low", MEDIUM: "Medium", HIGH: "High" }}
                disabled={isSaving}
                onValueChange={(value) => setPriority(value as TodoPriority)}
              >
                <SelectTrigger id="todo-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-due-date">Due Date</Label>
              <Input
                id="todo-due-date"
                type="date"
                value={dueDate}
                disabled={isSaving}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="todo-category">Category</Label>
              <select
                id="todo-category"
                value={categoryId}
                disabled={isSaving}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setCategoryId(event.target.value)
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="todo-tags">Tags</Label>
              <select
                id="todo-tags"
                multiple
                value={selectedTagIds}
                disabled={isSaving}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedTagIds(
                    Array.from(
                      event.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
                className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Hold Ctrl/Cmd to select multiple tags.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving
                ? "Saving..."
                : editingTodo
                  ? "Update Task"
                  : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
