# News Backend

Modular Fastify + TypeScript backend with a Nest-style folder approach where each module owns its full flow.

## Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /docs` (Swagger UI)

## Project Structure

```text
.
├── api
│   ├── auth
│   │   ├── auth.route.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.model.ts
│   │   ├── auth.type.ts
│   │   └── auth.util.ts
│   ├── health
│   │   ├── health.route.ts
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   └── health.type.ts
│   └── index.ts
├── drizzle
│   ├── 0000_*.sql
│   └── meta
├── shared
│   ├── db
│   │   ├── audit-columns.ts
│   │   ├── client.ts
│   │   └── schema.ts
│   ├── errors
│   ├── fastify
│   ├── types
│   └── utils
├── app.ts
└── server.ts
```

## Environment

Create your local env:

```bash
cp .env.example .env
```

JWT is configured through:

- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS`

Postgres is configured through:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Audit columns are centralized in `shared/db/audit-columns.ts` and reused per table.

Global API response shaping is centralized in `shared/fastify/response-handler.ts` with:
- standard response envelope (`Success`, `Message`, `Object`, `Errors`)

## Commands

```bash
npm run dev
npm run typecheck
npm run build
npm start
npm run db:generate
npm run db:migrate
```
