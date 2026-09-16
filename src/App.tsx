import { useState } from "react";
import TodoForm from "@/components/todo-form";
import TodoList from "@/components/todo-list";
import type { Todo, TodoFormData } from "@/types/todo";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // CREATE
  const handleAddTodo = (data: TodoFormData): void => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description ?? "",
      completed: false,
      createdAt: new Date(),
    };
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
  };

  // UPDATE
  const handleUpdateTodo = (id: string, data: Partial<Todo>): void => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, ...data } : todo
      )
    );
  };

  // DELETE
  const handleDeleteTodo = (id: string): void => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl py-8 px-4">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Todo App
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your tasks efficiently
          </p>
        </header>

        {/* Add Todo Form */}
        <div className="mb-8">
          <TodoForm onSubmit={handleAddTodo} />
        </div>

        {/* Todo List */}
        <TodoList
          todos={todos}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
        />
      </div>
    </div>
  );
};

export default App;
