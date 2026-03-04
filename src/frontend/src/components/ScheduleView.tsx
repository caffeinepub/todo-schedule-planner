import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  Priority,
  type Task,
  useGetTasks,
  useToggleComplete,
} from "../hooks/useQueries";

// ── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getWeekStart(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Mon as start
  return addDays(d, diff + (day === 0 ? 1 : 0));
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM → 11 PM

function timeToHour(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 || 12;
  return `${display}${period}`;
}

function getPriorityDotClass(priority: Priority) {
  switch (priority) {
    case Priority.low:
      return "bg-priority-low";
    case Priority.medium:
      return "bg-priority-medium";
    case Priority.high:
      return "bg-priority-high";
  }
}

function getPriorityTextClass(priority: Priority) {
  switch (priority) {
    case Priority.low:
      return "text-priority-low";
    case Priority.medium:
      return "text-priority-medium";
    case Priority.high:
      return "text-priority-high";
  }
}

// ── Schedule Task Card ────────────────────────────────────────────────────────

function ScheduleTaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded px-2 py-1 border text-xs transition-all duration-150",
        "bg-card border-border hover:border-primary/40 hover:bg-accent",
        task.completed && "opacity-50 line-through",
      )}
    >
      <div className="flex items-start gap-1.5">
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0",
            getPriorityDotClass(task.priority),
          )}
        />
        <div className="min-w-0">
          <p
            className={cn(
              "font-medium leading-snug truncate",
              getPriorityTextClass(task.priority),
            )}
          >
            {task.title}
          </p>
          {task.dueTime && (
            <p className="text-muted-foreground text-[10px] flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {task.dueTime}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Day View ─────────────────────────────────────────────────────────────────

function DayView({
  date,
  tasks,
  onToggle,
}: {
  date: Date;
  tasks: Task[];
  onToggle: (id: bigint) => void;
}) {
  const dateStr = toLocalDateString(date);
  const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const scheduledTasks = dayTasks.filter((t) => t.dueTime);
  const unscheduledTasks = dayTasks.filter((t) => !t.dueTime);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Unscheduled */}
        {unscheduledTasks.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Unscheduled
            </p>
            <div className="space-y-1.5">
              <AnimatePresence>
                {unscheduledTasks.map((t) => (
                  <ScheduleTaskCard
                    key={t.id.toString()}
                    task={t}
                    onClick={() => onToggle(t.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {unscheduledTasks.length > 0 && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Timeline
            </p>
          )}
          <div className="space-y-0">
            {HOURS.map((hour) => {
              const tasksInSlot = scheduledTasks.filter((t) => {
                if (!t.dueTime) return false;
                const h = timeToHour(t.dueTime);
                return Math.floor(h) === hour;
              });

              return (
                <div key={hour} className="flex gap-3 group/slot">
                  {/* Hour label */}
                  <div className="w-10 flex-shrink-0 text-right">
                    <span className="text-[10px] text-muted-foreground leading-none relative -top-1.5">
                      {formatHour(hour)}
                    </span>
                  </div>

                  {/* Slot */}
                  <div
                    className={cn(
                      "flex-1 min-h-[44px] border-t border-border relative pb-0.5",
                      hour % 2 === 0 ? "bg-transparent" : "bg-card/30",
                    )}
                  >
                    {tasksInSlot.length > 0 && (
                      <div className="pt-1 space-y-1 pr-2">
                        <AnimatePresence>
                          {tasksInSlot.map((t) => (
                            <ScheduleTaskCard
                              key={t.id.toString()}
                              task={t}
                              onClick={() => onToggle(t.id)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty for today */}
        {dayTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No tasks scheduled for this day
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────────

function WeekView({
  weekStart,
  tasks,
  onToggle,
}: {
  weekStart: Date;
  tasks: Task[];
  onToggle: (id: bigint) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = toLocalDateString(new Date());

  // Tasks without date
  const unscheduled = tasks.filter((t) => !t.dueDate);

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {/* Unscheduled row */}
        {unscheduled.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              No Date
            </p>
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence>
                {unscheduled.map((t) => (
                  <div key={t.id.toString()} className="w-40">
                    <ScheduleTaskCard task={t} onClick={() => onToggle(t.id)} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-1.5 min-w-0">
          {days.map((day) => {
            const ds = toLocalDateString(day);
            const dayTasks = tasks.filter((t) => t.dueDate === ds);
            const isToday = ds === today;

            return (
              <div key={ds} className="min-w-0">
                {/* Column header */}
                <div
                  className={cn(
                    "text-center mb-1.5 pb-1.5 border-b",
                    isToday ? "border-primary" : "border-border",
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-widest",
                      isToday ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p
                    className={cn(
                      "text-base font-display font-bold leading-tight",
                      isToday ? "text-primary" : "text-foreground",
                    )}
                  >
                    {day.getDate()}
                  </p>
                </div>

                {/* Tasks in day */}
                <div className="space-y-1">
                  {dayTasks.length === 0 ? (
                    <div className="h-12 rounded border border-dashed border-border/50 flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground/40">
                        empty
                      </span>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {dayTasks.map((t) => (
                        <ScheduleTaskCard
                          key={t.id.toString()}
                          task={t}
                          onClick={() => onToggle(t.id)}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

// ── Main Schedule View ────────────────────────────────────────────────────────

export function ScheduleView() {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: tasks = [] } = useGetTasks();
  const toggleMutation = useToggleComplete();

  const today = new Date();
  const weekStart = getWeekStart(currentDate);

  const navigate = (dir: number) => {
    if (viewMode === "day") {
      setCurrentDate((d) => addDays(d, dir));
    } else {
      setCurrentDate((d) => addDays(d, dir * 7));
    }
  };

  const goToday = () => setCurrentDate(new Date());
  const isToday = toLocalDateString(currentDate) === toLocalDateString(today);

  const weekEndLabel = () => {
    const end = addDays(weekStart, 6);
    const startFmt = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endFmt = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startFmt} – ${endFmt}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="font-display text-base font-bold text-foreground tracking-tight">
              Schedule
            </h2>
          </div>

          {/* View toggle */}
          <div className="flex rounded-md overflow-hidden border border-border bg-secondary">
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                viewMode === "day"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
              data-ocid="schedule.day_tab"
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                viewMode === "week"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
              data-ocid="schedule.week_tab"
            >
              Week
            </button>
          </div>
        </div>

        {/* Navigation row */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => navigate(-1)}
            data-ocid="schedule.prev_button"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <p className="flex-1 text-center text-xs font-medium text-foreground font-body">
            {viewMode === "day"
              ? formatDisplayDate(currentDate)
              : weekEndLabel()}
          </p>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => navigate(1)}
            data-ocid="schedule.next_button"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs bg-secondary border-border text-muted-foreground hover:text-foreground"
              onClick={goToday}
              data-ocid="schedule.today_button"
            >
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Schedule body */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === "day" ? (
            <motion.div
              key="day"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <DayView
                date={currentDate}
                tasks={tasks}
                onToggle={(id) => toggleMutation.mutate(id)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <WeekView
                weekStart={weekStart}
                tasks={tasks}
                onToggle={(id) => toggleMutation.mutate(id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
