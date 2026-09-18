import type { Todo, TodoStatus } from "@/types/todo";

/** Data + handlers the Dashboard shell shares with its routed views. */
export interface WorkspaceViewContext {
  todos: Todo[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  deletingId: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TodoStatus) => void;
  onQuickAdd: (title: string) => Promise<boolean>;
  onToggleComplete: (todo: Todo) => void;
}
