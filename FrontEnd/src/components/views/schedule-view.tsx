import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import type { WorkspaceViewContext } from "@/types/views";
import type { Todo } from "@/types/todo";

type ViewMode = "day" | "week";

function getScheduledDate(todo: Todo): Date | null {
  if (todo.scheduledStart) {
    const d = parseISO(todo.scheduledStart);
    return isNaN(d.getTime()) ? null : d;
  }
  if (todo.dueDate) {
    const d = parseISO(todo.dueDate);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export default function ScheduleView() {
  const { todos, onEdit } = useOutletContext<WorkspaceViewContext>();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { scheduledTodos, unscheduledTodos } = useMemo(() => {
    const scheduled: Todo[] = [];
    const unscheduled: Todo[] = [];
    todos.forEach((t) => {
      if (t.scheduledStart || t.scheduledEnd || t.dueDate) scheduled.push(t);
      else unscheduled.push(t);
    });
    return { scheduledTodos: scheduled, unscheduledTodos: unscheduled };
  }, [todos]);

  const todosByDay = useMemo(() => {
    const map = new Map<string, Todo[]>();
    const days = viewMode === "day" ? [selectedDate] : weekDays;
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      map.set(key, []);
    });

    scheduledTodos.forEach((todo) => {
      const d = getScheduledDate(todo);
      if (!d) return;
      const key = format(d, "yyyy-MM-dd");
      if (map.has(key)) {
        map.get(key)!.push(todo);
      } else if (viewMode === "day" && isSameDay(d, selectedDate)) {
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(todo);
      }
    });

    // sort each day by scheduledStart time
    map.forEach((list) => {
      list.sort((a, b) => {
        const aTime = a.scheduledStart ? parseISO(a.scheduledStart).getTime() : 0;
        const bTime = b.scheduledStart ? parseISO(b.scheduledStart).getTime() : 0;
        return aTime - bTime;
      });
    });

    return map;
  }, [scheduledTodos, selectedDate, viewMode, weekDays]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Schedule</h1>
            <p className="text-sm text-muted-foreground">
              {viewMode === "day" ? format(selectedDate, "EEEE, MMM d, yyyy") : `${format(weekStart, "MMM d")} - ${format(addDays(weekStart, 6), "MMM d, yyyy")}`} • {scheduledTodos.length} scheduled • {unscheduledTodos.length} unscheduled
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={viewMode}
              items={{ day: "Day", week: "Week" }}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Button variant="outline" onClick={() => setShowCalendar(!showCalendar)}>
                <CalendarIcon size={16} /> {format(selectedDate, "MMM d")}
              </Button>
              {showCalendar && (
                <div className="absolute right-0 top-12 z-20 rounded-xl border border-border bg-card p-2 shadow-lg">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                      if (d) setSelectedDate(d);
                      setShowCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>

            <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {viewMode === "day" ? (
          <DayView date={selectedDate} todos={todosByDay.get(format(selectedDate, "yyyy-MM-dd")) ?? []} onEdit={onEdit} />
        ) : (
          <WeekView days={weekDays} todosByDay={todosByDay} onEdit={onEdit} />
        )}

        {unscheduledTodos.length > 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-card/50 p-5">
            <h3 className="text-sm font-medium">Unscheduled ({unscheduledTodos.length})</h3>
            <p className="text-xs text-muted-foreground mt-1">These tasks have no due date or scheduled time. Add scheduling to see them on timeline.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {unscheduledTodos.slice(0, 8).map((t) => (
                <button
                  key={t.id}
                  onClick={() => onEdit(t)}
                  className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-accent"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DayView({ date, todos, onEdit }: { date: Date; todos: Todo[]; onEdit: (t: Todo) => void }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const todosWithTime = todos.filter((t) => t.scheduledStart);
  const todosWithoutTime = todos.filter((t) => !t.scheduledStart);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-medium">{format(date, "EEEE, MMMM d")}</h3>
          <p className="text-xs text-muted-foreground">{todos.length} tasks</p>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourTodos = todosWithTime.filter((t) => {
              const d = t.scheduledStart ? parseISO(t.scheduledStart) : null;
              return d && d.getHours() === hour;
            });

            return (
              <div key={hour} className="flex gap-4 border-b border-border/50 p-3 last:border-0">
                <div className="w-16 shrink-0 text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                </div>
                <div className="flex-1 space-y-2">
                  {hourTodos.length === 0 ? (
                    <div className="h-6" />
                  ) : (
                    hourTodos.map((todo) => (
                      <button
                        key={todo.id}
                        onClick={() => onEdit(todo)}
                        className="w-full rounded-lg border border-border bg-muted/50 p-2 text-left hover:bg-accent text-xs"
                      >
                        <div className="font-medium">{todo.title}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {todo.scheduledStart && todo.scheduledEnd
                            ? `${format(parseISO(todo.scheduledStart), "HH:mm")} - ${format(parseISO(todo.scheduledEnd), "HH:mm")}`
                            : todo.project?.name || todo.status}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-medium mb-3">All day & unscheduled time</h3>
        <div className="space-y-2">
          {todosWithoutTime.length === 0 && todosWithTime.length === 0 && (
            <p className="text-xs text-muted-foreground">No tasks for this day</p>
          )}
          {[...todosWithoutTime, ...todosWithTime.filter(t => !todosWithoutTime.includes(t) && false)].map((todo) => (
            <button
              key={todo.id}
              onClick={() => onEdit(todo)}
              className="w-full rounded-lg border border-border p-3 text-left hover:bg-muted"
            >
              <p className="text-sm font-medium">{todo.title}</p>
              <p className="text-xs text-muted-foreground">{todo.project?.name || "No project"} • {todo.status}</p>
            </button>
          ))}
          {todos.map((todo) => (
            <button
              key={todo.id}
              onClick={() => onEdit(todo)}
              className="w-full rounded-lg border border-border bg-muted/30 p-3 text-left hover:bg-muted"
            >
              <p className="text-sm font-medium truncate">{todo.title}</p>
              <p className="text-xs text-muted-foreground">
                {todo.scheduledStart ? format(parseISO(todo.scheduledStart), "HH:mm") : "All day"} • {todo.priority}
                {todo.project && ` • ${todo.project.name}`}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView({ days, todosByDay, onEdit }: { days: Date[]; todosByDay: Map<string, Todo[]>; onEdit: (t: Todo) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const dayTodos = todosByDay.get(key) ?? [];
        const isToday = isSameDay(day, new Date());

        return (
          <div key={key} className={`rounded-xl border p-3 ${isToday ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
            <div className="mb-3">
              <p className={`text-xs ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>{format(day, "EEE")}</p>
              <p className={`text-lg font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</p>
            </div>

            <div className="space-y-2 min-h-[120px]">
              {dayTodos.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">No tasks</p>
              ) : (
                dayTodos.map((todo) => (
                  <button
                    key={todo.id}
                    onClick={() => onEdit(todo)}
                    className="w-full rounded-lg bg-muted p-2 text-left hover:bg-accent"
                  >
                    <p className="truncate text-xs font-medium">{todo.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {todo.scheduledStart ? format(parseISO(todo.scheduledStart), "HH:mm") : "All day"}
                    </p>
                    {todo.project && (
                      <span
                        className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] text-white"
                        style={{ backgroundColor: todo.project.color || "#8A73FF" }}
                      >
                        {todo.project.name}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
