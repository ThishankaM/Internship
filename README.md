# Todo App

A small React + TypeScript todo application built with Vite, Tailwind CSS v4, and shadcn/ui (Base UI primitives).

## Features

- Add todos with a title and optional description
- Mark todos as complete or incomplete
- Edit todo title and description inline
- Delete todos
- Empty state and completed/total counter
- Required title validation

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

## Scripts

- `npm run dev` — start the development server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

## Project structure

```text
src/
  components/
    todo-form.tsx
    todo-item.tsx
    todo-list.tsx
    ui/          # shadcn/ui primitives
  lib/
    utils.ts
  types/
    todo.ts
  App.tsx
  main.tsx
  index.css
```
