import type { Task } from "../backend.d";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsJSON(tasks: Task[]) {
  const data = tasks.map((t) => ({
    id: t.id.toString(),
    title: t.title,
    description: t.description,
    dueDate: t.dueDate ?? null,
    dueTime: t.dueTime ?? null,
    priority: t.priority,
    completed: t.completed,
    createdAt: t.createdAt.toString(),
  }));
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  triggerDownload(blob, "tasks-backup.json");
}

function escapeCSVField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportAsCSV(tasks: Task[]) {
  const headers = [
    "id",
    "title",
    "description",
    "dueDate",
    "dueTime",
    "priority",
    "completed",
    "createdAt",
  ];

  const rows = tasks.map((t) =>
    [
      t.id.toString(),
      escapeCSVField(t.title),
      escapeCSVField(t.description),
      t.dueDate ?? "",
      t.dueTime ?? "",
      t.priority,
      t.completed ? "true" : "false",
      t.createdAt.toString(),
    ].join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, "tasks-backup.csv");
}
