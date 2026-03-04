import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Priority, type Task } from "../hooks/useQueries";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingTask?: Task | null;
  onSubmit: (data: {
    title: string;
    description: string;
    dueDate: string | null;
    dueTime: string | null;
    priority: Priority;
  }) => void;
  isPending?: boolean;
}

export function TaskDialog({
  open,
  onOpenChange,
  editingTask,
  onSubmit,
  isPending,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.medium);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate ?? "");
      setDueTime(editingTask.dueTime ?? "");
      setPriority(editingTask.priority);
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      setPriority(Priority.medium);
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      priority,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] bg-popover border-border"
        data-ocid="task.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {editingTask ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="task-title"
              className="text-xs text-muted-foreground font-medium uppercase tracking-wider"
            >
              Title *
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
              data-ocid="task.title_input"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="task-desc"
              className="text-xs text-muted-foreground font-medium uppercase tracking-wider"
            >
              Description
            </Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or details..."
              rows={3}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
              data-ocid="task.description_textarea"
            />
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="task-date"
                className="text-xs text-muted-foreground font-medium uppercase tracking-wider"
              >
                Due Date
              </Label>
              <Input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-secondary border-border text-foreground [color-scheme:dark]"
                data-ocid="task.date_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="task-time"
                className="text-xs text-muted-foreground font-medium uppercase tracking-wider"
              >
                Time
              </Label>
              <Input
                id="task-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-secondary border-border text-foreground [color-scheme:dark]"
                data-ocid="task.time_input"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Priority
            </Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Priority)}
            >
              <SelectTrigger
                className="bg-secondary border-border text-foreground"
                data-ocid="task.priority_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value={Priority.low}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-priority-low inline-block" />
                    Low
                  </span>
                </SelectItem>
                <SelectItem value={Priority.medium}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-priority-medium inline-block" />
                    Medium
                  </span>
                </SelectItem>
                <SelectItem value={Priority.high}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-priority-high inline-block" />
                    High
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="task.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="task.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Saving…
                </>
              ) : editingTask ? (
                "Save Changes"
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
