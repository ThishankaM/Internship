// src/todos/entities/todo.entity.ts
export class Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  status: 'todo' | 'in-progress' | 'done';
  progress: number;
  dueDate: string;
  comments: number;
  attachments: number;
  createdAt: Date;
}