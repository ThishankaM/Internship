# TaskFlow Frontend

The frontend for TaskFlow, a dark-themed Kanban todo application. It is built with React, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui primitives backed by Base UI.

## Features

- Three-column Kanban board: To do List, In Progress, and Done
- Create todos through a dialog modal
- Edit todo title, description, and status
- Delete todos from any column
- Fetch todos from the backend REST API
- Refresh the board on demand
- Navigation sidebar and project summary panel
- Dark theme configured through CSS variables

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui and Base UI primitives
- lucide-react

## Prerequisites

- Node.js
- npm
- The TaskFlow backend running on `http://localhost:3000`

## Setup

```powershell
cd FrontEnd
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend expects the backend API to be available at:

```text
http://localhost:3000/todos
```

Make sure the backend CORS configuration allows the Vite development server origin.

## Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the Vite development server         |
| `npm run build`    | Type-check and create a production build  |
| `npm run lint`     | Run ESLint                                |
| `npm run preview`  | Preview the production build              |

## API Integration

The API base URL is defined in `src/App.tsx`:

```ts
const API_URL = "http://localhost:3000/todos";
```

The UI uses these endpoints:

| Method | Endpoint     | Purpose        |
| ------ | ------------ | -------------- |
| GET    | `/todos`     | List all todos |
| POST   | `/todos`     | Create a todo  |
| PATCH  | `/todos/:id` | Update a todo  |
| DELETE | `/todos/:id` | Delete a todo  |

The frontend groups todos into columns using the `status` field:

```ts
type TodoStatus = "todo" | "in-progress" | "done";
```

## Project Structure

```text
FrontEnd/
  public/
  src/
    components/
      TaskCard.tsx
      TodoModal.tsx
      kanban-column.tsx
      mini-project-card.tsx
      nav-item.tsx
      project-panel.tsx
      task-sidebar.tsx
      task-toolbar.tsx
      ui/
    hooks/
      use-mobile.ts
    lib/
      utils.ts
    types/
      todo.ts
    App.tsx
    index.css
    main.tsx
  vite.config.ts
  package.json
```

## Main Components

| Component        | Responsibility                                        |
| ---------------- | ----------------------------------------------------- |
| `App`            | Holds todo state and coordinates API calls            |
| `TaskSidebar`    | Left navigation sidebar                               |
| `TaskToolbar`    | Search, filter, sort, refresh, and new task controls  |
| `KanbanColumn`   | Renders one status column of todo cards               |
| `TaskCard`       | Displays one todo and provides edit/delete actions    |
| `TodoModal`      | Create/edit dialog with title, description, and status |
| `ProjectPanel`   | Right-side profile and project summary panel          |

## Theme

The palette is defined in `src/index.css` with CSS variables. Key colors include:

| Purpose       | Value      |
| ------------- | ---------- |
| Background    | `#000000`  |
| Sidebar       | `#050505`  |
| Cards         | `#050505`  |
| Borders       | `#242424`  |
| Primary       | `#8A73FF`  |
| Danger        | `#FF5C5C`  |
| Success       | `#32D6A0`  |

