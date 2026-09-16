import { useState } from "react";
import AppSidebar from "@/components/app-sidebar";
import TodoForm from "@/components/todo-form";
import TodoList from "@/components/todo-list";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="font-semibold">Todos</h1>
        </header>
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <header className="mb-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight">Todo App</h2>
            <p className="mt-2 text-muted-foreground">
              Manage your tasks efficiently
            </p>
          </header>

          <div className="mb-8">
            <TodoForm onSubmit={handleAddTodo} />
          </div>

          <TodoList
            todos={todos}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default App;
