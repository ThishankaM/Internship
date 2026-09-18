import { useMemo, useState } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { KanbanColumn } from "@/components/kanban-column";
import { ProjectPanel } from "@/components/project-panel";
import { TaskSidebar } from "@/components/task-sidebar";
import { TaskCardPreview } from "@/components/TaskCard";
import { TaskToolbar } from "@/components/task-toolbar";
import { TodoModal } from "@/components/TodoModal";
import { OrganizerModal } from "@/components/OrganizerModal";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { useAuth } from "@/providers/auth-context";
import { useTodos } from "@/hooks/use-todos";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import type { CreateTodoRequest, Todo, TodoStatus } from "@/types/todo";

function isTodoStatus(value: unknown): value is TodoStatus {
  return value === "todo" || value === "in-progress" || value === "done";
}

export default function Dashboard() {
  const {
    user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    reloadUser,
    logout,
  } = useAuth();

  const {
    todos,
    isLoading,
    isError,
    error,
    refetch,
    createTodo,
    updateTodo,
    deleteTodo,
    isSaving,
    deletingId,
    mutationError,
    clearMutationError,
    params,
    updateParams,
  } = useTodos(Boolean(user));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    categories,
    tags,
    isLoading: isTaxonomyLoading,
    isSaving: isTaxonomySaving,
    error: taxonomyError,
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    updateTag,
    deleteTag,
  } = useTaxonomy(Boolean(user));

  const { todoList, inProgressList, doneList } = useMemo(
    () => ({
      todoList: todos.filter((t) => t.status === "todo"),
      inProgressList: todos.filter((t) => t.status === "in-progress"),
      doneList: todos.filter((t) => t.status === "done"),
    }),
    [todos],
  );

  const openCreateModal = () => {
    clearMutationError();
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const openEditModal = (todo: Todo) => {
    clearMutationError();
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: CreateTodoRequest): Promise<boolean> => {
    const result = editingTodo
      ? await updateTodo(editingTodo.id, payload)
      : await createTodo(payload);
    return result.ok;
  };

  // ---- AUTH LOADING / ERROR ----
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingState message="Authenticating..." />
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <ErrorState
          title="Session error"
          message={userError ?? "Please log in again."}
          onRetry={reloadUser}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-sm">
      <TaskSidebar
        user={user}
        onLogout={logout}
        onChangePassword={() => setIsPasswordModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <TaskToolbar
          user={user}
          onCreate={openCreateModal}
          params={params}
          onUpdateParams={updateParams}
          categories={categories}
          tags={tags}
          onManageTaxonomy={() => setIsOrganizerOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />

        {/* GLOBAL FETCH ERROR */}
        {isError ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <ErrorState
              title="Couldn't load your tasks"
              message={error ?? "Unknown error"}
              onRetry={refetch}
            />
          </div>
        ) : (
          <DragDropProvider
            onDragStart={(event) => {
              const draggedId = event.operation.source?.id;
              setActiveTodo(
                todos.find((todo) => todo.id === draggedId) ?? null,
              );
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

              const isDone = target === "done";
              void updateTodo(draggedTodo.id, {
                status: target,
                completed: isDone,
                ...(isDone ? { progress: 100 } : {}),
              });
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
                onEdit={openEditModal}
                onDelete={deleteTodo}
                onCreate={openCreateModal}
              />
              <KanbanColumn
                status="in-progress"
                title="In Progress"
                count={inProgressList.length}
                todos={inProgressList}
                isLoading={isLoading}
                deletingId={deletingId}
                onEdit={openEditModal}
                onDelete={deleteTodo}
                onCreate={openCreateModal}
              />
              <KanbanColumn
                status="done"
                title="Done"
                count={doneList.length}
                todos={doneList}
                isLoading={isLoading}
                deletingId={deletingId}
                onEdit={openEditModal}
                onDelete={deleteTodo}
                onCreate={openCreateModal}
              />
            </div>

            <DragOverlay>
              {activeTodo ? <TaskCardPreview todo={activeTodo} /> : null}
            </DragOverlay>
          </DragDropProvider>
        )}
      </main>

      <ProjectPanel todos={todos} isLoading={isLoading} />

      <TodoModal
        key={`${editingTodo?.id ?? "new"}-${isModalOpen}`}
        isOpen={isModalOpen}
        isSaving={isSaving}
        serverError={mutationError}
        editingTodo={editingTodo}
        categories={categories}
        tags={tags}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <OrganizerModal
        key={isOrganizerOpen ? "organizer-open" : "organizer-closed"}
        open={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
        categories={categories}
        tags={tags}
        isSaving={isTaxonomySaving || isTaxonomyLoading}
        error={taxonomyError}
        onCreateCategory={createCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onCreateTag={createTag}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
      />

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
