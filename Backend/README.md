# TaskFlow Backend

The backend for TaskFlow, a NestJS REST API that stores todos in PostgreSQL using Prisma.

## Features

- CRUD API for todos
- PostgreSQL persistence through Prisma
- DTO validation with `class-validator`
- Global request validation with `whitelist` and `transform`
- CORS configured for the TaskFlow frontend
- Optional NestJS Observe instrumentation
- Unit and e2e test setup with Vitest

## Tech Stack

- NestJS 12
- TypeScript
- Prisma 5
- PostgreSQL
- class-validator and class-transformer
- Vitest

## Prerequisites

- Node.js
- npm
- PostgreSQL running locally or remotely

## Setup

```powershell
cd Backend
npm install
```

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Set the PostgreSQL connection string in `.env`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/todo_db?schema=public"
```

## Database Setup

Generate the Prisma client:

```powershell
npx prisma generate
```

Apply the existing migration:

```powershell
npx prisma migrate dev
```

For a deployed or non-development environment:

```powershell
npx prisma migrate deploy
```

## Running the Server

```powershell
npm run start:dev
```

The API starts at:

```text
http://localhost:3000
```

The root endpoint returns `Hello World!` and the todo endpoints are under `/todos`.

## Scripts

| Script             | Description                                   |
| ------------------ | --------------------------------------------- |
| `npm run start`    | Start the NestJS server                       |
| `npm run start:dev`| Start the server in watch mode                |
| `npm run start:debug` | Start the server in debug watch mode       |
| `npm run start:prod` | Run the production build from `dist`        |
| `npm run build`    | Build the backend                             |
| `npm run lint`     | Run oxlint                                    |
| `npm run test`     | Run unit tests with Vitest                    |
| `npm run test:e2e` | Run end-to-end tests                          |
| `npm run test:cov` | Run tests with coverage                       |

## API Reference

Base URL:

```text
http://localhost:3000
```

### Todo endpoints

| Method | Endpoint     | Description         |
| ------ | ------------ | ------------------- |
| GET    | `/todos`     | List all todos      |
| POST   | `/todos`     | Create a todo       |
| GET    | `/todos/:id` | Get one todo by ID  |
| PATCH  | `/todos/:id` | Update a todo       |
| DELETE | `/todos/:id` | Delete a todo       |

### Create Todo

```http
POST /todos
Content-Type: application/json
```

```json
{
  "title": "Design landing page",
  "description": "Create the initial landing page layout",
  "status": "todo",
  "completed": false,
  "progress": 0,
  "dueDate": "2026-09-20",
  "comments": 0,
  "attachments": 0
}
```

Only `title` is required. Other fields are optional and have defaults.

### Update Todo

```http
PATCH /todos/:id
Content-Type: application/json
```

```json
{
  "title": "Design updated landing page",
  "status": "in-progress",
  "progress": 40
}
```

When status is updated, the backend also syncs the `completed` flag:

- `done` sets `completed` to `true`
- `todo` or `in-progress` sets `completed` to `false`

### Example Response

```json
{
  "id": "7a7e5e43-5a22-4f16-9f52-219b04f935df",
  "title": "Design landing page",
  "description": "Create the initial landing page layout",
  "completed": false,
  "status": "todo",
  "progress": 0,
  "dueDate": "2026-09-20",
  "comments": 0,
  "attachments": 0,
  "created_at": "2026-09-16T10:00:00.000Z",
  "updated_at": "2026-09-16T10:00:00.000Z"
}
```

## Validation

The application uses a global `ValidationPipe`:

```ts
new ValidationPipe({
  whitelist: true,
  transform: true,
});
```

`CreateTodoDto` enforces:

- `title` is a non-empty string
- `description` is an optional string
- `completed` is an optional boolean
- `status` is one of `todo`, `in-progress`, or `done`
- `progress`, `comments`, and `attachments` are optional numbers

## CORS

CORS is enabled in `src/main.ts` for:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Allowed methods are:

```text
GET, POST, PATCH, DELETE
```

## Database Schema

The Prisma schema is defined in `prisma/schema.prisma`.

The `Todo` model contains:

| Field         | Type       | Default       |
| ------------- | ---------- | ------------- |
| `id`          | String/UUID | auto UUID     |
| `title`       | String     | required      |
| `description` | String?    | null          |
| `completed`   | Boolean    | false         |
| `status`      | String     | `todo`        |
| `progress`    | Int        | 0             |
| `dueDate`     | String?    | null          |
| `comments`    | Int        | 0             |
| `attachments` | Int        | 0             |
| `created_at`  | DateTime   | now           |
| `updated_at`  | DateTime   | auto-updated  |

## Project Structure

```text
Backend/
  prisma/
    migrations/
    schema.prisma
  src/
    prisma/
      prisma.service.ts
    todos/
      dto/
        create-todo.dto.ts
        update-todo.dto.ts
      entities/
        todo.entity.ts
      todos.controller.ts
      todos.module.ts
      todos.service.ts
    app.controller.ts
    app.module.ts
    app.service.ts
    main.ts
  test/
  package.json
```

## Observability

If `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` are set, the NestJS Observe module is enabled with the service ID `todo-backend`. Without those variables, the app starts normally without Observe instrumentation.

