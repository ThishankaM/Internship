import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { format, isBefore, isSameDay, parseISO, startOfToday } from "date-fns";
import { useAuth } from "@/providers/auth-context";
import { ErrorState } from "@/components/states/error-state";
import { QuickAddTask } from "@/components/my-day/quick-add-task";
import { TodayProgress } from "@/components/my-day/today-progress";
import { PriorityTasks } from "@/components/my-day/priority-tasks";
import { FocusCard } from "@/components/my-day/focus-card";
import { TodayTimeline } from "@/components/my-day/today-timeline";
import { TodayTaskList } from "@/components/my-day/today-task-list";
import type { WorkspaceViewContext } from "@/types/views";

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function MyDayView() {
  const { user } = useAuth();

  const {
    todos,
    isLoading,
    isError,
    error,
    onRetry,
    onCreate,
    onEdit,
    onToggleComplete,
    onQuickAdd,
  } = useOutletContext<WorkspaceViewContext>();

  const todayTasks = useMemo(() => {
    const today = new Date();
    return todos
      .filter(
        (todo) => todo.dueDate && isSameDay(parseISO(todo.dueDate), today)
      )
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [todos]);

  const overdueCount = useMemo(
    () =>
      todos.filter(
        (todo) =>
          todo.dueDate &&
          !todo.completed &&
          isBefore(parseISO(todo.dueDate), startOfToday())
      ).length,
    [todos]
  );

  const priorityTasks = useMemo(
    () => todos.filter((todo) => todo.priority === "HIGH" && !todo.completed),
    [todos]
  );

  const completedToday = todayTasks.filter((todo) => todo.completed).length;
  const focusTask =
    priorityTasks[0] ?? todayTasks.find((todo) => !todo.completed) ?? null;

  if (isLoading && todos.length === 0) {
    return (
      <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-6xl animate-pulse flex-col gap-6">
          <div className="h-9 w-72 rounded-lg bg-muted" />
          <div className="h-16 rounded-2xl bg-muted" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-72 rounded-2xl bg-muted lg:col-span-2" />
            <div className="h-72 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <ErrorState
          title="Couldn't load your day"
          message={error ?? "Unknown error"}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {getGreeting()}, {user?.name ?? "there"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s on your plate for today.
          </p>
        </header>

        <QuickAddTask onAdd={onQuickAdd} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <TodayProgress
              completed={completedToday}
              total={todayTasks.length}
              overdue={overdueCount}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <PriorityTasks todos={priorityTasks} onEdit={onEdit} />
              <FocusCard task={focusTask} onEdit={onEdit} />
            </div>

            <TodayTaskList
              todos={todayTasks}
              onToggle={onToggleComplete}
              onEdit={onEdit}
              onAdd={onCreate}
            />
          </div>

          <TodayTimeline todos={todayTasks} onEdit={onEdit} />
        </div>
      </div>
    </div>
  );
}
