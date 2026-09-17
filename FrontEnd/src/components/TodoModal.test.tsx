import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodoModal } from "./TodoModal";
import type { Todo } from "@/types/todo";

const baseTodo: Todo = {
  id: "todo-1",
  title: "Ship backend",
  description: "Finish API",
  completed: false,
  status: "todo",
  priority: "MEDIUM",
  progress: 20,
  dueDate: "2026-09-20",
  comments: 0,
  attachments: 0,
  userId: "user-1",
  created_at: "2026-09-17T00:00:00.000Z",
  updated_at: "2026-09-17T00:00:00.000Z",
};

describe("TodoModal", () => {
  it("validates that title is required", async () => {
    const onSave = vi.fn();

    render(
      <TodoModal
        isOpen
        isSaving={false}
        serverError={null}
        editingTodo={null}
        categories={[]}
        tags={[]}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: /create task/i }).closest("form")!);

    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("creates a todo with the entered data", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();

    render(
      <TodoModal
        isOpen
        isSaving={false}
        serverError={null}
        editingTodo={null}
        categories={[
          {
            id: "category-1",
            name: "Work",
            userId: "user-1",
            created_at: "2026-09-17T00:00:00.000Z",
          },
        ]}
        tags={[
          {
            id: "tag-1",
            name: "backend",
            userId: "user-1",
            created_at: "2026-09-17T00:00:00.000Z",
          },
        ]}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "New Task" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Do it" },
    });
    fireEvent.change(screen.getByLabelText("Tags"), {
      target: { value: "tag-1" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /create task/i }).closest("form")!);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          description: "Do it",
          categoryId: null,
          tagIds: ["tag-1"],
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("edits an existing todo", async () => {
    const onSave = vi.fn().mockResolvedValue(true);

    render(
      <TodoModal
        isOpen
        isSaving={false}
        serverError={null}
        editingTodo={baseTodo}
        categories={[]}
        tags={[]}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    expect(screen.getByLabelText("Title *")).toHaveValue("Ship backend");

    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "Updated Task" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /update task/i }).closest("form")!);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Updated Task" }),
      );
    });
  });
});
