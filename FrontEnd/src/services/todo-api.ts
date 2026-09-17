import { apiClient } from "./api-client";
import type {
  CreateTodoRequest,
  Todo,
  UpdateTodoRequest,
} from "@/types/todo";

export const todoApi = {
  getAll(signal?: AbortSignal): Promise<Todo[]> {
    return apiClient.get<Todo[]>("/todos", { signal });
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