# TaskFlow

TaskFlow is a full-stack todo application with a React frontend and a NestJS backend.

## Project Layout

```text
TaskFlow/
  FrontEnd/  React, TypeScript, Vite, Tailwind CSS
  Backend/   NestJS, Prisma, PostgreSQL
```

## Quick Start

### 1. Start the backend

```powershell
cd Backend
npm install
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

The backend runs at `http://localhost:3000`.

### 2. Start the frontend

```powershell
cd FrontEnd
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Documentation

- [Frontend README](FrontEnd/README.md)
- [Backend README](Backend/README.md)

