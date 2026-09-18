import { useState } from "react";
import { Outlet } from "react-router-dom";
import { format } from "date-fns";
import { ProjectPanel } from "@/components/project-panel";
import { TaskSidebar } from "@/components/task-sidebar";
import { TaskToolbar } from "@/components/task-toolbar";
import { TodoModal } from "@/components/TodoModal";
import { OrganizerModal } from "@/components/OrganizerModal";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { useAuth } from "@/providers/auth-context";
import { useTodosQuery } from "@/hooks/use-todos-query";
import { useTaxonomyQuery } from "@/hooks/use-taxonomy-query";
import { useProjects } from "@/hooks/use-projects";
import type { WorkspaceViewContext } from "@/types/views";
import type { CreateTodoRequest, Todo, TodoStatus } from "@/types/todo";
import type { CreateProjectRequest, Project } from "@/types/project";

export function DashboardLayout() {
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
  } = useTodosQuery(Boolean(user));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectModalError, setProjectModalError] = useState<string | null>(null);

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
  } = useTaxonomyQuery(Boolean(user));

  const {
    projects,
    isLoading: isProjectsLoading,
    createProject,
    updateProject,
    isSaving: isProjectSaving,
  } = useProjects(Boolean(user));

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

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setProjectModalError(null);
    setIsProjectModalOpen(true);
  };

  const handleSave = async (payload: CreateTodoRequest): Promise<boolean> => {
    const result = editingTodo
      ? await updateTodo(editingTodo.id, payload)
      : await createTodo(payload);
    return result.ok;
  };

  const handleSaveProject = async (payload: CreateProjectRequest): Promise<boolean> => {
    setProjectModalError(null);
    const result = editingProject
      ? await updateProject(editingProject.id, payload)
      : await createProject(payload);
    if (!result.ok) {
      setProjectModalError(result.error ?? "Failed");
      return false;
    }
    return true;
  };

  const handleMoveTodo = (id: string, status: TodoStatus) => {
    const isDone = status === "done";
    void updateTodo(id, {
      status,
      completed: isDone,
      ...(isDone ? { progress: 100 } : {}),
    });
  };

  const handleQuickAdd = async (title: string): Promise<boolean> => {
    const result = await createTodo({
      title,
      status: "todo",
      progress: 0,
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
    return result.ok;
  };

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
    projects,
    categories,
    tags,
    isLoading,
    isError,
    error,
    deletingId,
    params,
    onUpdateParams: updateParams,
    onRetry: () => refetch(),
    onCreate: openCreateModal,
    onEdit: openEditModal,
    onDelete: deleteTodo,
    onMove: handleMoveTodo,
    onQuickAdd: handleQuickAdd,
    onToggleComplete: handleToggleComplete,
    onCreateProject: openCreateProjectModal,
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
          projects={projects}
          onManageTaxonomy={() => setIsOrganizerOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />

        <Outlet context={tasksViewContext} />
      </main>

      <ProjectPanel
        projects={projects}
        isLoading={isProjectsLoading || isLoading}
        onSelectProject={(p) => {
          updateParams({ projectId: p.id, page: 1 });
        }}
      />

      <TodoModal
        key={`${editingTodo?.id ?? "new"}-${isModalOpen}`}
        isOpen={isModalOpen}
        isSaving={isSaving}
        serverError={mutationError}
        editingTodo={editingTodo}
        categories={categories}
        tags={tags}
        projects={projects}
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

      <ProjectModal
        isOpen={isProjectModalOpen}
        isSaving={isProjectSaving}
        editingProject={editingProject}
        serverError={projectModalError}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
      />

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
