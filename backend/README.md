# News Backend

Modular Fastify + TypeScript backend with a Nest-style folder approach where each module owns its full flow.

## Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /docs` (Swagger UI)

## Default Login

- `email`: `admin@example.com`
- `password`: `Password@123`

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
├── shared
│   ├── errors
│   ├── response
│   ├── types
│   └── utils
├── app.ts
├── server.ts
└── scripts
    └── generate-openapi.ts
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

## Commands

```bash
npm run dev
npm run typecheck
npm run build
npm start
npm run openapi
```
