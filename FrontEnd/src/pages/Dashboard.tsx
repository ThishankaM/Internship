import { useState } from "react";
import { Outlet } from "react-router-dom";
import { format } from "date-fns";
import { ProjectPanel } from "@/components/project-panel";
import { TaskSidebar } from "@/components/task-sidebar";
import { TaskToolbar } from "@/components/task-toolbar";
import { TodoModal } from "@/components/TodoModal";
import { OrganizerModal } from "@/components/OrganizerModal";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { useAuth } from "@/providers/auth-context";
import { useTodos } from "@/hooks/use-todos";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import type { WorkspaceViewContext } from "@/types/views";
import type { CreateTodoRequest, Todo, TodoStatus } from "@/types/todo";

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

  // Dragging a card into "done" completes it and forces progress to 100%.
  const handleMoveTodo = (id: string, status: TodoStatus) => {
    const isDone = status === "done";
    void updateTodo(id, {
      status,
      completed: isDone,
      ...(isDone ? { progress: 100 } : {}),
    });
  };

  // Quick add from the My Day view: a task due today.
  const handleQuickAdd = async (title: string): Promise<boolean> => {
    const result = await createTodo({
      title,
      status: "todo",
      progress: 0,
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
    return result.ok;
  };

  // Toggling from a list: completing sets status to done (+100%).
  const handleToggleComplete = (todo: Todo) => {
    const nextCompleted = !todo.completed;
    const nextStatus: TodoStatus = nextCompleted
      ? "done"
      : todo.status === "done"
        ? "todo"
        : todo.status;

    void updateTodo(todo.id, {
      completed: nextCompleted,
      status: nextStatus,
      ...(nextCompleted ? { progress: 100 } : {}),
    });
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

  const tasksViewContext: WorkspaceViewContext = {
    todos,
    isLoading,
    isError,
    error,
    deletingId,
    onRetry: refetch,
    onCreate: openCreateModal,
    onEdit: openEditModal,
    onDelete: deleteTodo,
    onMove: handleMoveTodo,
    onQuickAdd: handleQuickAdd,
    onToggleComplete: handleToggleComplete,
  };

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

        <Outlet context={tasksViewContext} />
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
