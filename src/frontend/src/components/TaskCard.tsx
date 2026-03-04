import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Priority, type Task } from "../hooks/useQueries";

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: bigint) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: bigint) => void;
  compact?: boolean;
}

function getPriorityGlowClass(priority: Priority) {
  switch (priority) {
    case Priority.low:
      return "priority-glow-low";
    case Priority.medium:
      return "priority-glow-medium";
    case Priority.high:
      return "priority-glow-high";
  }
}

function getPriorityBadgeClass(priority: Priority) {
  switch (priority) {
    case Priority.low:
      return "text-priority-low border-priority-low/30 bg-priority-low/10";
    case Priority.medium:
      return "text-priority-medium border-priority-medium/30 bg-priority-medium/10";
    case Priority.high:
      return "text-priority-high border-priority-high/30 bg-priority-high/10";
  }
}

function getPriorityLabel(priority: Priority) {
  switch (priority) {
    case Priority.low:
      return "Low";
    case Priority.medium:
      return "Medium";
    case Priority.high:
      return "High";
  }
}

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function TaskCard({
  task,
  index,
  onToggle,
  onEdit,
  onDelete,
  compact,
}: TaskCardProps) {
  const glowClass = getPriorityGlowClass(task.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative bg-card border border-border rounded-md pl-3.5 pr-2.5 py-2.5 transition-all duration-200",
        glowClass,
        task.completed && "opacity-55",
      )}
      data-ocid={`todo.item.${index + 1}`}
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <div className="mt-0.5 flex-shrink-0">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            data-ocid={`todo.checkbox.${index + 1}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium leading-snug text-foreground transition-all duration-200",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </p>

          {!compact && task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 font-medium border",
                getPriorityBadgeClass(task.priority),
              )}
            >
              {getPriorityLabel(task.priority)}
            </Badge>

            {task.dueDate && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(task.dueDate)}
              </span>
            )}

            {task.dueTime && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(task.dueTime)}
              </span>
            )}
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 mt-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => onEdit(task)}
            data-ocid={`todo.edit_button.${index + 1}`}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(task.id)}
            data-ocid={`todo.delete_button.${index + 1}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
