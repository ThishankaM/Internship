import { useCallback, useEffect, useState } from "react";
import { todoApi } from "@/services/todo-api";
import { ApiError } from "@/services/api-client";
import type { RequestStatus } from "@/types/api";
import type {
  CreateTodoRequest,
  Todo,
  UpdateTodoRequest,
} from "@/types/todo";

export function useTodos(enabled: boolean = true) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Submission / mutation states
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const fetchTodos = useCallback(async (signal?: AbortSignal) => {
    setStatus("loading");
    setError(null);

    try {
      const data = await todoApi.getAll(signal);
      setTodos(data);
      setStatus("success");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Failed to load todos");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();

    todoApi
      .getAll(controller.signal)
      .then((data) => {
        setTodos(data);
        setStatus("success");
        setError(null);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setError(
          err instanceof ApiError ? err.message : "Failed to load todos"
        );
      });

    return () => controller.abort();
  }, [enabled]);

  const createTodo = useCallback(async (payload: CreateTodoRequest) => {
    setIsSaving(true);
    setMutationError(null);
    try {
      const created = await todoApi.create(payload);
      setTodos((prev) => [...prev, created]);
      return { ok: true as const, data: created };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to create todo";
      setMutationError(message);
      return { ok: false as const, error: message };
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateTodo = useCallback(
    async (id: string, payload: UpdateTodoRequest) => {
      setIsSaving(true);
      setMutationError(null);
      try {
        const updated = await todoApi.update(id, payload);
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return { ok: true as const, data: updated };
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to update todo";
        setMutationError(message);
        return { ok: false as const, error: message };
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const deleteTodo = useCallback(async (id: string) => {
    setDeletingId(id);
    setMutationError(null);

    // Optimistic update with rollback
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await todoApi.remove(id);
      return { ok: true as const };
    } catch (err) {
      setTodos(snapshot); // rollback
      const message =
        err instanceof ApiError ? err.message : "Failed to delete todo";
      setMutationError(message);
      return { ok: false as const, error: message };
    } finally {
      setDeletingId(null);
    }
  }, [todos]);

  return {
    todos,
    isLoading: status === "loading" || status === "idle",
    isError: status === "error",
    isEmpty: status === "success" && todos.length === 0,
    error,
    refetch: () => fetchTodos(),

    createTodo,
    updateTodo,
    deleteTodo,
    isSaving,
    deletingId,
    mutationError,
    clearMutationError: () => setMutationError(null),
  };
}
