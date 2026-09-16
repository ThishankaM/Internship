import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import TodoForm from "@/components/todo-form";
import type { Todo, TodoFormData } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, data: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  const handleEdit = (data: TodoFormData) => {
    onUpdate(todo.id, {
      title: data.title,
      description: data.description ?? "",
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  // If in editing mode, show the edit form
  if (isEditing) {
    return (
      <TodoForm
        onSubmit={handleEdit}
        initialData={{
          title: todo.title,
          description: todo.description,
        }}
        isEditing={true}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card className={`w-full ${todo.completed ? "opacity-60" : ""}`}>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="pt-1">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            aria-label={`Mark "${todo.title}" as ${
              todo.completed ? "incomplete" : "complete"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle
            className={`text-lg ${
              todo.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {todo.title}
          </CardTitle>
          {todo.description && (
            <CardDescription
              className={`mt-1 ${
                todo.completed ? "line-through" : ""
              }`}
            >
              {todo.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoItem;
