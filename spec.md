# Todo List & Schedule Planner

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Todo list with task creation, editing, completion toggle, and deletion
- Schedule/calendar planner with daily and weekly views
- Tasks can have a due date, time, priority level, and optional description
- Filter tasks by status (all, active, completed) and by date
- Drag-and-drop or click-based scheduling of tasks onto a calendar
- Persistent storage of tasks in the backend

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend
- `Task` data type with fields: id, title, description, dueDate (optional), dueTime (optional), priority (Low/Medium/High), completed, createdAt
- CRUD operations: createTask, getTasks, updateTask, deleteTask, toggleComplete
- Query tasks by date range for schedule view

### Frontend
- Main layout with two panels: Task List (left) and Schedule/Calendar (right)
- Task list panel:
  - Input to add a new task (title, date, time, priority)
  - Filter tabs: All / Active / Completed
  - Task cards with checkbox, title, due date/time badge, priority badge, edit and delete buttons
  - Empty state for no tasks
- Schedule panel:
  - Toggle between Day view and Week view
  - Day view: time slots from 6am–11pm, tasks placed at their scheduled time
  - Week view: 7-column grid with tasks listed per day
  - Click a task in schedule to mark complete or view details
- Edit task modal/dialog
- Responsive layout
