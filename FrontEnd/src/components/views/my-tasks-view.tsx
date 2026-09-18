import { useMemo, useState } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useOutletContext } from "react-router-dom";
import { KanbanColumn } from "@/components/kanban-column";
import { TaskCardPreview } from "@/components/TaskCard";
import { ErrorState } from "@/components/states/error-state";
import type { WorkspaceViewContext } from "@/types/views";
import type { Todo, TodoStatus } from "@/types/todo";

function isTodoStatus(value: unknown): value is TodoStatus {
  return value === "todo" || value === "in-progress" || value === "done";
}

export default function MyTasksView() {
  const {
    todos,
    isLoading,
    isError,
    error,
    deletingId,
    onRetry,
    onCreate,
    onEdit,
    onDelete,
    onMove,
  } = useOutletContext<WorkspaceViewContext>();

  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const { todoList, inProgressList, doneList } = useMemo(
    () => ({
      todoList: todos.filter((todo) => todo.status === "todo"),
      inProgressList: todos.filter((todo) => todo.status === "in-progress"),
      doneList: todos.filter((todo) => todo.status === "done"),
    }),
    [todos]
  );

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <ErrorState
          title="Couldn't load your tasks"
          message={error ?? "Unknown error"}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <DragDropProvider
      onDragStart={(event) => {
        const draggedId = event.operation.source?.id;
        setActiveTodo(todos.find((todo) => todo.id === draggedId) ?? null);
      }}
      onDragEnd={(event) => {
        setActiveTodo(null);

        if (event.canceled) return;

        const draggedId = event.operation.source?.id;
        const draggedTodo =
          todos.find((todo) => todo.id === draggedId) ?? null;
        const target = event.operation.target?.id;

        if (
          !draggedTodo ||
          !isTodoStatus(target) ||
          draggedTodo.status === target
        ) {
          return;
        }

        onMove(draggedTodo.id, target);
      }}
    >
      <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden px-4 py-6">
        <KanbanColumn
          status="todo"
          title="To do List"
          count={todoList.length}
          todos={todoList}
          isLoading={isLoading}
          deletingId={deletingId}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
        />
        <KanbanColumn
          status="in-progress"
          title="In Progress"
          count={inProgressList.length}
          todos={inProgressList}
          isLoading={isLoading}
          deletingId={deletingId}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
        />
        <KanbanColumn
          status="done"
          title="Done"
          count={doneList.length}
          todos={doneList}
          isLoading={isLoading}
          deletingId={deletingId}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreate={onCreate}
        />
      </div>

      <DragOverlay>
        {activeTodo ? <TaskCardPreview todo={activeTodo} /> : null}
      </DragOverlay>
    </DragDropProvider>
  );
}
