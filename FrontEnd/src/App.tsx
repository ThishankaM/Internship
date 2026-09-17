import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthPage } from "@/pages/AuthPage";
import { KanbanColumn } from "@/components/kanban-column";
import { ProjectPanel } from "@/components/project-panel";
import { TaskSidebar } from "@/components/task-sidebar";
import { TaskToolbar } from "@/components/task-toolbar";
import { TodoModal } from "@/components/TodoModal";
import type { Todo } from "@/types/todo";

const BASE_URL = "http://localhost:3000";

// --- DASHBOARD COMPONENT (Your layout with Auth attached) ---
function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const navigate = useNavigate();

  // Helper for authenticated fetch requests
  const authFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return null;
      }

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Handle expired or invalid tokens
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return null;
      }

      return res;
    },
    [navigate]
  );

  // Load User & Todos
  const refreshTodos = useCallback(async () => {
    try {
      const response = await authFetch("/todos");
      if (response && response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  }, [authFetch]);

  useEffect(() => {
    let isMounted = true;

    const initDashboard = async () => {
      // 1. Fetch current authenticated user
      const userRes = await authFetch("/auth/me");
      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        if (isMounted) setUser(userData);

        // 2. Fetch user's todos
        const todoRes = await authFetch("/todos");
        if (todoRes && todoRes.ok && isMounted) {
          const todoData = await todoRes.json();
          setTodos(todoData);
        }
      }
    };

    initDashboard();

    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveTodo = async (todoData: Partial<Todo>) => {
    try {
      if (editingTodo) {
        const response = await authFetch(`/todos/${editingTodo.id}`, {
          method: "PATCH",
          body: JSON.stringify(todoData),
        });
        if (!response || !response.ok) {
          throw new Error("Failed to update todo");
        }
        const updatedTodo = await response.json();
        setTodos((current) =>
          current.map((todo) => (todo.id === editingTodo.id ? updatedTodo : todo))
        );
      } else {
        const response = await authFetch("/todos", {
          method: "POST",
          body: JSON.stringify(todoData),
        });
        if (!response || !response.ok) {
          throw new Error("Failed to create todo");
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
      const response = await authFetch(`/todos/${id}`, {
        method: "DELETE",
      });
      if (!response || !response.ok) {
        throw new Error("Failed to delete todo");
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

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-sm">
      {/* TaskSidebar with Logout Handler */}
      <TaskSidebar onLogout={handleLogout} user={user} />

      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <TaskToolbar onRefresh={refreshTodos} onCreate={openCreateModal} user={user} />

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

// --- MAIN APP ROUTER ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}