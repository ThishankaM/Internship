import { apiClient } from "./api-client";
import type {
  CreateTodoRequest,
  Todo,
  UpdateTodoRequest,
} from "@/types/todo";
import type { TodoQueryParams, PaginatedResponse } from "@/types/api"

export const todoApi = {
  getAll(
    params: TodoQueryParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<Todo>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
    return apiClient.get<PaginatedResponse<Todo>>(`/todos?${query.toString()}`, {
      signal,
    });
  },

  getById(id: string): Promise<Todo> {
    return apiClient.get<Todo>(`/todos/${id}`);
  },

  create(payload: CreateTodoRequest): Promise<Todo> {
    return apiClient.post<Todo>("/todos", payload);
  },

  update(id: string, payload: UpdateTodoRequest): Promise<Todo> {
    return apiClient.patch<Todo>(`/todos/${id}`, payload);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/todos/${id}`);
  },

  toggleCompleted(id: string, completed: boolean): Promise<Todo> {
    return apiClient.patch<Todo>(`/todos/${id}`, { completed });
  },
};