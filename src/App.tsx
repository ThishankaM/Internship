import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  ArrowUpDown,
  Bell,
  Briefcase,
  Calendar,
  Clock,
  Filter,
  HelpCircle,
  Info,
  MoreVertical,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { TodoModal } from "@/components/TodoModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/types/todo";

const API_URL = "http://localhost:3000/todos";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

function NavItem({ icon: Icon, label, active = false }: NavItemProps) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </button>
  );
}

interface KanbanColumnProps {
  title: string;
  count: number;
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

function KanbanColumn({
  title,
  count,
  todos,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl bg-muted/30 p-2">
        {todos.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-12 text-center text-sm text-muted-foreground">
            No tasks yet
          </div>
        ) : (
          todos.map((todo) => (
            <TaskCard
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface MiniProjectCardProps {
  title: string;
  tasks: number;
  progress: number;
  color: string;
}

function MiniProjectCard({
  title,
  tasks,
  progress,
  color,
}: MiniProjectCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{title}</span>
        <span className={`size-2.5 rounded-full ${color}`} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{tasks} tasks</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

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
      <aside className="hidden w-64 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 px-6 font-semibold text-foreground">
          <AlignLeft className="size-5 text-primary" />
          TaskFlow
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <NavItem icon={Calendar} label="My Tasks" active />
          <NavItem icon={Briefcase} label="Projects" />
          <NavItem icon={Clock} label="Schedule" />
          <NavItem icon={Sun} label="My Day" />
        </nav>
        <div className="space-y-1 border-t border-border p-3">
          <NavItem icon={Settings} label="Settings" />
          <NavItem icon={Bell} label="Notifications" />
          <NavItem icon={User} label="Profile" />
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <header className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Filter">
              <Filter />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Sort">
              <ArrowUpDown />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh"
              onClick={() => refreshTodos()}
            >
              <RefreshCw />
            </Button>
            <Button variant="ghost" size="icon" aria-label="More">
              <MoreVertical />
            </Button>
            <Button onClick={openCreateModal}>
              <Plus /> New Task
            </Button>
          </div>
        </header>

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

      <aside className="hidden w-80 flex-col gap-6 overflow-y-auto border-l border-border bg-sidebar p-6 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <User className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">Alex Doe</p>
            <p className="truncate text-xs text-muted-foreground">
              alex@example.com
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            aria-label="Settings"
          >
            <Settings />
          </Button>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Projects</p>
          <div className="space-y-3">
            <MiniProjectCard
              title="Website Redesign"
              tasks={12}
              progress={72}
              color="bg-primary"
            />
            <MiniProjectCard
              title="Mobile App"
              tasks={8}
              progress={45}
              color="bg-secondary-accent"
            />
            <MiniProjectCard
              title="Marketing Site"
              tasks={5}
              progress={20}
              color="bg-success"
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-muted-foreground">
          <button type="button" className="flex items-center gap-1.5" aria-label="Theme">
            <Sun className="size-4" /> Theme
          </button>
          <button type="button" className="flex items-center gap-1.5" aria-label="Help">
            <HelpCircle className="size-4" /> Help
          </button>
          <button type="button" className="flex items-center gap-1.5" aria-label="Info">
            <Info className="size-4" /> Info
          </button>
          <button type="button" className="flex items-center gap-1.5" aria-label="Live">
            <Radio className="size-4" /> Live
          </button>
        </div>
      </aside>

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
