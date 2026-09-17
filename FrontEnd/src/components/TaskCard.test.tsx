import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "./TaskCard";
import type { Todo } from "@/types/todo";

const todo: Todo = {
  id: "todo-1",
  title: "Ship backend",
  description: "Finish API",
  completed: false,
  status: "todo",
  priority: "HIGH",
  progress: 30,
  dueDate: "2026-09-20",
  comments: 2,
  attachments: 1,
  userId: "user-1",
  category: {
    id: "category-1",
    name: "Work",
    userId: "user-1",
    created_at: "2026-09-17T00:00:00.000Z",
  },
  tags: [
    {
      id: "tag-1",
      name: "backend",
      userId: "user-1",
      created_at: "2026-09-17T00:00:00.000Z",
    },
  ],
  created_at: "2026-09-17T00:00:00.000Z",
  updated_at: "2026-09-17T00:00:00.000Z",
};

describe("TaskCard", () => {
  it("shows category and tags", () => {
    render(<TaskCard todo={todo} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("#backend")).toBeInTheDocument();
  });

  it("calls delete when Delete Task is clicked", () => {
    const onDelete = vi.fn();

    render(<TaskCard todo={todo} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByText("Delete Task"));

    expect(onDelete).toHaveBeenCalledWith("todo-1");
  });

  it("calls edit when Edit Task is clicked", () => {
    const onEdit = vi.fn();

    render(<TaskCard todo={todo} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByText("Edit Task"));

    expect(onEdit).toHaveBeenCalledWith(todo);
  });
});
