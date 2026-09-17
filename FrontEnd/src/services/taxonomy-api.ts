import { apiClient } from "./api-client";
import type { Category, Tag } from "@/types/todo";

export const categoryApi = {
  getAll(signal?: AbortSignal): Promise<Category[]> {
    return apiClient.get<Category[]>("/categories", { signal });
  },

  create(name: string): Promise<Category> {
    return apiClient.post<Category>("/categories", { name });
  },

  update(id: string, name: string): Promise<Category> {
    return apiClient.patch<Category>(`/categories/${id}`, { name });
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/categories/${id}`);
  },
};

export const tagApi = {
  getAll(signal?: AbortSignal): Promise<Tag[]> {
    return apiClient.get<Tag[]>("/tags", { signal });
  },

  create(name: string): Promise<Tag> {
    return apiClient.post<Tag>("/tags", { name });
  },

  update(id: string, name: string): Promise<Tag> {
    return apiClient.patch<Tag>(`/tags/${id}`, { name });
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/tags/${id}`);
  },
};
