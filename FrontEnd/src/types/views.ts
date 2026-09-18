import type { Todo, TodoStatus, Category, Tag } from "@/types/todo";
import type { Project } from "@/types/project";
import type { TodoQueryParams } from "@/types/api";

/** Data + handlers the Dashboard shell shares with its routed views. */
export interface WorkspaceViewContext {
  todos: Todo[];
  projects: Project[];
  categories: Category[];
  tags: Tag[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  deletingId: string | null;
  params: TodoQueryParams;
  onUpdateParams: (p: Partial<TodoQueryParams>) => void;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TodoStatus) => void;
  onQuickAdd: (title: string) => Promise<boolean>;
  onToggleComplete: (todo: Todo) => void;
  onCreateProject: () => void;
}
