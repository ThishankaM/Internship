export type TodoStatus = "todo" | "in-progress" | "done";

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  status: TodoStatus;
  progress: number;
  dueDate: string | null;
  comments: number;
  attachments: number;
  userId: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  completed?: boolean;
  status?: TodoStatus;
  progress?: number;
  dueDate?: string;
  comments?: number;
  attachments?: number;
}

export type UpdateTodoRequest = Partial<CreateTodoRequest>;

export interface TodoFormData {
  title: string;
  description?: string;
}
