# TaskFlow

A dark-themed Kanban todo app built with React, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui (Base UI primitives).

## Features

- Three-column Kanban board: To do, In Progress, and Done
- Create, edit, and delete todos through a modal
- Fetch and persist todos against a REST API
- Refresh the board on demand
- Navigation sidebar and project summary panel
- Custom dark color palette managed with CSS variables

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui (Base UI primitives)
- lucide-react

## Getting started

```bash
npm install
npm run dev
```

The frontend expects a todo API at:

```text
http://localhost:3000/todos
```

Make sure the API allows CORS from the Vite development server.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

## API

| Method | Endpoint     | Description    |
| ------ | ------------ | -------------- |
| GET    | `/todos`     | List all todos |
| POST   | `/todos`     | Create a todo  |
| PATCH  | `/todos/:id` | Update a todo  |
| DELETE | `/todos/:id` | Delete a todo  |

Todo shape used by the app:

```ts
type TodoStatus = "todo" | "in-progress" | "done";

interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt: string | Date;
}
```

## Project structure

```text
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
    ui/               # shadcn/ui primitives
  hooks/
    use-mobile.ts
  lib/
    utils.ts
  types/
    todo.ts
  App.tsx
  main.tsx
  index.css
```

## Theme

The palette is defined in `src/index.css` through CSS variables. Key colors:

- Main background: `#000000`
- Sidebar: `#050505`
- Cards: `#050505`
- Borders: `#242424`
- Primary accent: `#8A73FF`
- Danger: `#FF5C5C`
- Success: `#32D6A0`
