import { apiClient } from "./api-client";
import type { Project, CreateProjectRequest, UpdateProjectRequest } from "@/types/project";
import type { Todo } from "@/types/todo";

export const projectApi = {
  getAll(signal?: AbortSignal): Promise<Project[]> {
    return apiClient.get<Project[]>("/projects", { signal });
  },

  getById(id: string, signal?: AbortSignal): Promise<Project & { todos: Todo[] }> {
    return apiClient.get<Project & { todos: Todo[] }>(`/projects/${id}`, { signal });
  },

  getTasks(id: string, signal?: AbortSignal): Promise<Todo[]> {
    return apiClient.get<Todo[]>(`/projects/${id}/tasks`, { signal });
  },

  create(payload: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>("/projects", payload);
  },

  update(id: string, payload: UpdateProjectRequest): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, payload);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  },
};
