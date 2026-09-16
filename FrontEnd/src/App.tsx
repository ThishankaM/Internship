import { useEffect, useState } from "react";
import { KanbanColumn } from "@/components/kanban-column";
import { ProjectPanel } from "@/components/project-panel";
import { TaskSidebar } from "@/components/task-sidebar";
import { TaskToolbar } from "@/components/task-toolbar";
import { TodoModal } from "@/components/TodoModal";
import type { Todo } from "@/types/todo";

const API_URL = "http://localhost:3000/todos";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const fetchTodos = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }
    return response.json();
  };

  const refreshTodos = async () => {
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchTodos()
      .then((data) => {
        if (!cancelled) {
          setTodos(data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch todos:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveTodo = async (todoData: Partial<Todo>) => {
    try {
      if (editingTodo) {
        const response = await fetch(`${API_URL}/${editingTodo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(todoData),
        });
        if (!response.ok) {
          throw new Error(
            `Failed to update todo: ${response.status} ${response.statusText}`
          );
        }
        const updatedTodo = await response.json();
        setTodos((current) =>
          current.map((todo) =>
            todo.id === editingTodo.id ? updatedTodo : todo
          )
        );
      } else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(todoData),
        });
        if (!response.ok) {
          throw new Error(
            `Failed to create todo: ${response.status} ${response.statusText}`
          );
        }
        const newTodo = await response.json();
        setTodos((current) => [...current, newTodo]);
      }
    } catch (error) {
      console.error("Failed to save todo:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to delete todo: ${response.status} ${response.statusText}`
        );
      }
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const openCreateModal = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const todoList = todos.filter((todo) => todo.status === "todo");
  const inProgressList = todos.filter((todo) => todo.status === "in-progress");
  const doneList = todos.filter((todo) => todo.status === "done");

  return (
    <div className="flex h-screen overflow-hidden bg-background text-sm">
      <TaskSidebar />

      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <TaskToolbar onRefresh={refreshTodos} onCreate={openCreateModal} />

        <div className="flex flex-1 gap-6 overflow-x-auto overflow-y-hidden px-6 py-6">
          <KanbanColumn
            title="To do List"
            count={todoList.length}
            todos={todoList}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
          <KanbanColumn
            title="In Progress"
            count={inProgressList.length}
            todos={inProgressList}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
          <KanbanColumn
            title="Done"
            count={doneList.length}
            todos={doneList}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <ProjectPanel />

      <TodoModal
        key={`${editingTodo?.id ?? "new"}-${isModalOpen}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTodo}
        editingTodo={editingTodo}
      />
    </div>
  );
}
