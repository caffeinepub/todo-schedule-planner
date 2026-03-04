# Todo & Schedule Planner

## Current State
The app has a task list (TaskList.tsx) and a schedule view (ScheduleView.tsx). Tasks have title, description, dueDate, dueTime, priority, and completed fields. The header has a logo and auth controls. No export functionality exists.

## Requested Changes (Diff)

### Add
- Export button in the TaskList header (next to "New" button) that opens a small dropdown/popover with two options: "Download JSON" and "Download CSV"
- JSON export: serializes all tasks from the current `tasks` array into a formatted JSON file and triggers a browser download
- CSV export: converts tasks to comma-separated values with headers (id, title, description, dueDate, dueTime, priority, completed, createdAt) and triggers a browser download
- A helper utility function `exportTasks` in a new `utils/exportTasks.ts` file

### Modify
- TaskList.tsx: import and wire export button with dropdown

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/utils/exportTasks.ts` with two exported functions: `exportAsJSON(tasks: Task[])` and `exportAsCSV(tasks: Task[])` that create Blob URLs and trigger downloads
2. In `TaskList.tsx`, add an export button (Download icon) next to the "New" button that opens a DropdownMenu with "Export as JSON" and "Export as CSV" options
3. Wire each menu item to call the corresponding export function with the current `tasks` array
4. Add appropriate `data-ocid` markers to the export button and menu items
