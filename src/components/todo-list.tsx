import TodoItem from "@/components/todo-item";
import type { Todo } from "@/types/todo";

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, data: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdate, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No todos yet. Add one above to get started!
        </p>
      </div>
    );
  }

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Your Todos ({totalCount})
        </h2>
        <p className="text-sm text-muted-foreground">
          {completedCount} of {totalCount} completed
        </p>
      </div>

      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TodoList;
