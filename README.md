# TaskFlow

TaskFlow is a full-stack todo and Kanban application built with a React frontend and a NestJS API.

## Technologies

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4
- Backend: NestJS 12, Prisma, PostgreSQL
- Authentication: JWT access/refresh tokens
- Documentation: Swagger/OpenAPI
- Testing: Vitest, React Testing Library, Supertest

## Project Structure

```text
TaskFlow/
  FrontEnd/  React application
  Backend/   NestJS API
```

## Prerequisites

- Node.js
- npm
- PostgreSQL

## Backend Setup

```powershell
cd Backend
npm install
Copy-Item .env.example .env
```

Set `DATABASE_URL` and production `JWT_SECRET` in `Backend/.env`.

Run migrations and start the API:

```powershell
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend URLs:

```text
API base:   http://localhost:3000/api/v1
Swagger UI: http://localhost:3000/api/docs
```

## Frontend Setup

```powershell
cd FrontEnd
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

The frontend expects `VITE_API_BASE_URL` to point to the versioned API:

```dotenv
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

## Environment Variables

Backend variables are documented in `Backend/.env.example`. The frontend uses `FrontEnd/.env.example`.

Never commit real secrets or production credentials.

## Database and Migrations

Prisma schema:

```text
Backend/prisma/schema.prisma
```

Development:

```powershell
cd Backend
npx prisma migrate dev
```

Production:

```powershell
cd Backend
npx prisma migrate deploy
```

## Running Tests

Backend:

```powershell
cd Backend
npm test
npm run test:e2e
```

Frontend:

```powershell
cd FrontEnd
npm test
```

## API Documentation

Swagger/OpenAPI documentation is available at:

```text
http://localhost:3000/api/docs
```

All API routes are versioned under `/api/v1`.

## Security and Production Practices

- Consistent global error handling
- DTO validation and unknown-field rejection
- Environment-based configuration
- Structured JSON logging
- Helmet security headers
- CORS allowlist
- Rate limiting
- Secure password hashing
- Role-based admin authorization
- User-scoped resource ownership checks

## More Documentation

- [Frontend README](FrontEnd/README.md)
- [Backend README](Backend/README.md)

