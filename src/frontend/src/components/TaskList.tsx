import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AlertCircle, ListTodo, Loader2, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Priority,
  type Task,
  useCreateTask,
  useDeleteTask,
  useGetTasks,
  useToggleComplete,
  useUpdateTask,
} from "../hooks/useQueries";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";

type FilterTab = "all" | "active" | "completed";

export function TaskList() {
  const [quickTitle, setQuickTitle] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks, isLoading, isError } = useGetTasks();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const toggleMutation = useToggleComplete();

  const filteredTasks = (tasks ?? []).filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const handleQuickAdd = () => {
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    createMutation.mutate(
      {
        title: trimmed,
        description: "",
        dueDate: null,
        dueTime: null,
        priority: Priority.medium,
      },
      { onSuccess: () => setQuickTitle("") },
    );
  };

  const handleDialogSubmit = (data: {
    title: string;
    description: string;
    dueDate: string | null;
    dueTime: string | null;
    priority: Priority;
  }) => {
    if (editingTask) {
      updateMutation.mutate(
        { id: editingTask.id, ...data },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingTask(null);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const counts = {
    all: (tasks ?? []).length,
    active: (tasks ?? []).filter((t) => !t.completed).length,
    completed: (tasks ?? []).filter((t) => t.completed).length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-primary" />
            <h2 className="font-display text-base font-bold text-foreground tracking-tight">
              Tasks
            </h2>
            <span className="text-xs text-muted-foreground font-body tabular-nums">
              {counts.active} left
            </span>
          </div>
          <Button
            size="sm"
            onClick={openNew}
            className="h-7 px-2.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
            data-ocid="todo.add_button"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
        </div>

        {/* Quick-add input */}
        <div className="flex gap-2">
          <Input
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickAdd();
            }}
            placeholder="Quick add task…"
            className="h-8 text-sm bg-secondary border-border placeholder:text-muted-foreground text-foreground"
            data-ocid="todo.input"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleQuickAdd}
            disabled={!quickTitle.trim() || createMutation.isPending}
            className="h-8 px-2.5 flex-shrink-0 bg-secondary hover:bg-accent border border-border"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-2 flex-shrink-0">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList
            className="h-7 bg-secondary border border-border p-0.5 w-full"
            data-ocid="todo.filter.tab"
          >
            {(["all", "active", "completed"] as FilterTab[]).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={cn(
                  "flex-1 h-6 text-xs capitalize font-medium",
                  "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                  "text-muted-foreground",
                )}
              >
                {tab}
                <span className="ml-1 tabular-nums text-[10px] opacity-60">
                  {counts[tab]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Task list body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-2" data-ocid="task.loading_state">
            {["sk1", "sk2", "sk3", "sk4"].map((k) => (
              <Skeleton key={k} className="h-16 w-full bg-card rounded-md" />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div
            className="flex flex-col items-center justify-center gap-2 py-10 text-center"
            data-ocid="task.error_state"
          >
            <AlertCircle className="w-8 h-8 text-destructive opacity-60" />
            <p className="text-sm text-muted-foreground">
              Failed to load tasks
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredTasks.length === 0 && (
          <div
            className="flex flex-col items-center justify-center gap-3 py-12 text-center"
            data-ocid="todo.empty_state"
          >
            <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {filter === "all"
                  ? "No tasks yet"
                  : filter === "active"
                    ? "All caught up!"
                    : "No completed tasks"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filter === "all"
                  ? "Add your first task above"
                  : "Switch filters to see other tasks"}
              </p>
            </div>
          </div>
        )}

        {/* Task cards */}
        {!isLoading && !isError && filteredTasks.length > 0 && (
          <AnimatePresence initial={false}>
            <div className="space-y-2">
              {filteredTasks.map((task, i) => (
                <TaskCard
                  key={task.id.toString()}
                  task={task}
                  index={i}
                  onToggle={(id) => toggleMutation.mutate(id)}
                  onEdit={openEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditingTask(null);
        }}
        editingTask={editingTask}
        onSubmit={handleDialogSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
