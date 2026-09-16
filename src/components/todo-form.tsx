import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TodoFormData } from "@/types/todo";

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => void;
  initialData?: TodoFormData;
  isEditing?: boolean;
  onCancel?: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
  onCancel,
}) => {
  const [title, setTitle] = useState<string>(initialData?.title ?? "");
  const [description, setDescription] = useState<string>(
    initialData?.description ?? ""
  );
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation: prevent empty title
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Todo title is required.");
      return;
    }

    setError("");
    onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
    });

    // Reset form if not editing
    if (!isEditing) {
      setTitle("");
      setDescription("");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Todo" : "Add New Todo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter todo title..."
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter description..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {isEditing ? "Update Todo" : "Add Todo"}
            </Button>
            {isEditing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TodoForm;
