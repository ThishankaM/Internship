# TaskFlow Backend

NestJS REST API for the TaskFlow todo application. It stores data in PostgreSQL through Prisma and provides authentication, authorization, todos, projects, categories, tags, and admin APIs.

## Technologies

- NestJS 12
- TypeScript
- Prisma 5
- PostgreSQL
- JWT and Passport
- bcrypt
- class-validator and class-transformer
- Swagger/OpenAPI
- Helmet and rate limiting
- Vitest and Supertest

## Features

- Versioned REST API under `/api/v1`
- JWT access and refresh tokens
- USER and ADMIN roles
- Password change, forgot password, and reset password flows
- Todo CRUD with filtering, sorting, and pagination
- Project management with per-project progress stats
- Category and tag management
- User-scoped ownership checks
- Global validation and consistent error responses
- Environment-based configuration
- Structured JSON request/error logging
- Rate limiting and security headers
- Swagger/OpenAPI documentation

## Project Structure

```text
Backend/
  prisma/
    migrations/
    schema.prisma
  src/
    admin/
    auth/
    categories/
    common/
      dto/
      filters/
      logging/
      middleware/
    config/
    prisma/
    tags/
    todos/
    app.module.ts
    main.ts
  test/
```

## Prerequisites

- Node.js
- npm
- PostgreSQL

## Environment Variables

Create `.env` from `.env.example`:

```powershell
Copy-Item .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `PORT` | No | API port, default `3000` |
| `CORS_ORIGINS` | No | Comma-separated allowed frontend origins |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Production | Secret used to sign JWTs |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token lifetime, default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token lifetime, default `7d` |
| `JWT_RESET_EXPIRES_MINUTES` | No | Reset token lifetime, default `15` |
| `BCRYPT_ROUNDS` | No | Password hashing rounds, default `10` |
| `THROTTLE_TTL_MS` | No | Rate limit window in milliseconds, default `60000` |
| `THROTTLE_LIMIT` | No | Requests allowed per window, default `100` |
| `OBSERVE_APP_KEY` | No | Enables NestJS Observe when paired with secret |
| `OBSERVE_APP_SECRET` | No | NestJS Observe secret |

In production, `JWT_SECRET` is required and must be at least 32 characters long.

## Database Setup

Set `DATABASE_URL` in `.env`, then run:

```powershell
npx prisma generate
npx prisma migrate dev
```

Production migration:

```powershell
npx prisma migrate deploy
```

## Run the Backend

```powershell
npm install
npm run start:dev
```

API base URL:

```text
http://localhost:3000/api/v1
```

Swagger documentation:

```text
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Register a user |
| POST | `/api/v1/auth/login` | Log in |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/change-password` | Change password |
| POST | `/api/v1/auth/forgot-password` | Start simulated reset flow |
| POST | `/api/v1/auth/reset-password` | Reset password |

### Todos

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/todos` | List/filter todos |
| POST | `/api/v1/todos` | Create a todo |
| GET | `/api/v1/todos/:id` | Get one todo |
| PATCH | `/api/v1/todos/:id` | Update a todo |
| DELETE | `/api/v1/todos/:id` | Delete a todo |

### Categories and Tags

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/categories` | Create category |
| PATCH | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |
| GET | `/api/v1/tags` | List tags |
| POST | `/api/v1/tags` | Create tag |
| PATCH | `/api/v1/tags/:id` | Update tag |
| DELETE | `/api/v1/tags/:id` | Delete tag |

### Projects

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/projects` | List projects with progress stats |
| POST | `/api/v1/projects` | Create a project |
| GET | `/api/v1/projects/:id` | Get a project with its tasks |
| GET | `/api/v1/projects/:id/tasks` | List the tasks of a project |
| PATCH | `/api/v1/projects/:id` | Update a project |
| DELETE | `/api/v1/projects/:id` | Delete a project (tasks are detached) |

### Admin

Admin endpoints require `ADMIN` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/admin/users` | List users |
| GET | `/api/v1/admin/stats` | Basic statistics |
| PATCH | `/api/v1/admin/users/:id/role` | Change role |
| PATCH | `/api/v1/admin/users/:id/toggle-active` | Enable/disable user |

## Error Response Format

All errors use a consistent shape:

```json
{
  "success": false,
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request",
  "path": "/api/v1/todos",
  "timestamp": "2026-09-17T10:00:00.000Z",
  "requestId": "d95f6fbd-5e7b-4e6c-9f8f-3f8f4f8f4f8f"
}
```

Validation errors are collected by the global `ValidationPipe`. Unexpected server errors return a generic message in production while still being logged with details.

## Security Practices

- Passwords are hashed with bcrypt.
- JWT secrets and token lifetimes come from environment configuration.
- Refresh tokens are stored hashed.
- Input DTOs are validated and unknown fields are rejected.
- Prisma uses parameterized queries, reducing SQL injection risk.
- CORS origins are configured through `CORS_ORIGINS`.
- Helmet adds security headers.
- Global rate limiting protects the API.
- Sensitive fields such as passwords are never returned by user/admin queries.
- Todo/category/tag access is scoped to the authenticated user.
- Admin APIs are protected by JWT and role guards.

## Testing

```powershell
npm test
npm run test:e2e
npm run test:cov
```

Unit tests cover services, validation-related logic, authentication, authorization, and business rules. API/E2E tests cover registration, login, todo CRUD, project CRUD, unauthorized access, ownership checks, and failure scenarios.

## Scripts

| Script | Description |
| --- | --- |
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Build the application |
| `npm run start:prod` | Run the production build |
| `npm run lint` | Run oxlint |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run API/E2E tests |
| `npm run test:cov` | Run tests with coverage |
