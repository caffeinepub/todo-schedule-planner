import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Priority, type Task } from "../backend.d";
import { useActor } from "./useActor";

export { Priority };
export type { Task };

// ── Query keys ──────────────────────────────────────────────────────────────
export const TASKS_KEY = ["tasks"] as const;

// ── Queries ─────────────────────────────────────────────────────────────────
export function useGetTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: TASKS_KEY,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTasksByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks", "date", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksByDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      dueDate,
      dueTime,
      priority,
    }: {
      title: string;
      description: string;
      dueDate: string | null;
      dueTime: string | null;
      priority: Priority;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(title, description, dueDate, dueTime, priority);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success("Task created");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      dueDate,
      dueTime,
      priority,
    }: {
      id: bigint;
      title: string;
      description: string;
      dueDate: string | null;
      dueTime: string | null;
      priority: Priority;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTask(
        id,
        title,
        description,
        dueDate,
        dueTime,
        priority,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success("Task updated");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueryData<Task[]>(TASKS_KEY);
      qc.setQueryData<Task[]>(TASKS_KEY, (old) =>
        (old ?? []).filter((t) => t.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      qc.setQueryData<Task[]>(TASKS_KEY, context?.previous);
      toast.error("Failed to delete task");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useToggleComplete() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleComplete(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueryData<Task[]>(TASKS_KEY);
      qc.setQueryData<Task[]>(TASKS_KEY, (old) =>
        (old ?? []).map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      qc.setQueryData<Task[]>(TASKS_KEY, context?.previous);
      toast.error("Failed to update task");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
