import { useCallback, useEffect, useRef, useState } from "react";
import { todoApi } from "@/services/todo-api";
import { ApiError } from "@/services/api-client";
import type {
  PaginatedResponse,
  RequestStatus,
  TodoQueryParams,
} from "@/types/api";
import type { CreateTodoRequest, Todo, UpdateTodoRequest } from "@/types/todo";

export function useTodos(enabled: boolean = true) {
  const [data, setData] = useState<PaginatedResponse<Todo>>({
    data: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
  });
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [params, setParams] = useState<TodoQueryParams>({
    page: 1,
    limit: 100,
    sortBy: "created_at",
    sortOrder: "desc",
    filter: "all",
  });
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Submission / mutation states
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const fetchTodos = useCallback(
    async (currentParams: TodoQueryParams, signal?: AbortSignal) => {
      setStatus("loading");
      setError(null);

      try {
        const result = await todoApi.getAll(currentParams, signal);
        setData(result);
        setStatus("success");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setError(
          err instanceof ApiError ? err.message : "Failed to load todos",
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();

    todoApi
      .getAll(params, controller.signal)
      .then((result) => {
        setData(result);
        setStatus("success");
        setError(null);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setError(
          err instanceof ApiError ? err.message : "Failed to load todos",
        );
      });

    return () => controller.abort();
  }, [enabled, params]);

  const updateParams = useCallback((newParams: Partial<TodoQueryParams>) => {
    setStatus("loading");
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: newParams.page ?? 1,
    }));
  }, []);

  const createTodo = useCallback(
    async (payload: CreateTodoRequest) => {
      setIsSaving(true);
      setMutationError(null);
      try {
        const created = await todoApi.create(payload);
        await fetchTodos(params);
        return { ok: true as const, data: created };
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to create todo";
        setMutationError(message);
        return { ok: false as const, error: message };
      } finally {
        setIsSaving(false);
      }
    },
    [fetchTodos, params],
  );

  const updateTodo = useCallback(
    async (id: string, payload: UpdateTodoRequest) => {
      setIsSaving(true);
      setMutationError(null);

      // Optimistic update so drag-and-drop (and edits) feel instant.
      const snapshot = dataRef.current;
      setData((current) => ({
        ...current,
        data: current.data.map((todo) =>
          todo.id === id ? { ...todo, ...payload } : todo,
        ),
      }));

      try {
        const updated = await todoApi.update(id, payload);
        setData((current) => ({
          ...current,
          data: current.data.map((todo) => (todo.id === id ? updated : todo)),
        }));
        return { ok: true as const, data: updated };
      } catch (err) {
        setData(snapshot);
        const message =
          err instanceof ApiError ? err.message : "Failed to update todo";
        setMutationError(message);
        return { ok: false as const, error: message };
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setMutationError(null);

      try {
        await todoApi.remove(id);
        await fetchTodos(params);
        return { ok: true as const };
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to delete todo";
        setMutationError(message);
        return { ok: false as const, error: message };
      } finally {
        setDeletingId(null);
      }
    },
    [fetchTodos, params],
  );

  return {
    todos: data.data,
    meta: data.meta,
    params,
    updateParams,
    isLoading: status === "loading" || status === "idle",
    isError: status === "error",
    isEmpty: status === "success" && data.data.length === 0,
    error,
    refetch: () => fetchTodos(params),

    createTodo,
    updateTodo,
    deleteTodo,
    isSaving,
    deletingId,
    mutationError,
    clearMutationError: () => setMutationError(null),
  };
}
