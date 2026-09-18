export type ProjectStatus = "active" | "completed" | "archived";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  status: ProjectStatus;
  dueDate: string | null;
  userId: string;
  created_at: string;
  updated_at: string;
  _count?: { todos: number };
  stats?: {
    total: number;
    completed: number;
    progress: number;
    active: number;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export type UpdateProjectRequest = Partial<CreateProjectRequest>;
