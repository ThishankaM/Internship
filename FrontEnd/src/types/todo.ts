import type { Project } from "./project";

export type TodoStatus = "todo" | "in-progress" | "done";
export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Category {
  id: string;
  name: string;
  userId: string;
  created_at: string;
  _count?: {
    todos: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  userId: string;
  created_at: string;
  _count?: {
    todos: number;
  };
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  status: TodoStatus;
  priority: TodoPriority;
  progress: number;
  dueDate: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  comments: number;
  attachments: number;
  userId: string;
  projectId?: string | null;
  project?: Project | null;
  category?: Category | null;
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  completed?: boolean;
  status?: TodoStatus;
  priority?: TodoPriority;
  progress?: number;
  dueDate?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  comments?: number;
  attachments?: number;
  categoryId?: string | null;
  projectId?: string | null;
  tagIds?: string[];
}

export type UpdateTodoRequest = Partial<CreateTodoRequest>;
