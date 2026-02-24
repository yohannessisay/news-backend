# News Backend

Fastify + TypeScript backend with module-first structure (`api/<module>`) and shared reusable foundations in `shared/`.

## API

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/articles` (author only)
- `GET /api/v1/articles/me` (author only)
- `PUT /api/v1/articles/:id` (author only, own article only)
- `DELETE /api/v1/articles/:id` (author only, soft delete)
- `GET /api/v1/articles` (public, published + non-deleted only, paginated)
- `GET /api/v1/articles/:id` (public/optional auth, read tracking)
- `GET /api/v1/author/dashboard` (author only, paginated views)
- `POST /api/v1/analytics/process` (author only, enqueue daily aggregation)
- `GET /docs` (Swagger UI)

## Setup

1. Copy env file:
```bash
cp .env.example .env
```
2. Ensure Postgres is running with values from `.env`.
3. Run migrations:
```bash
npm run db:migrate
```
4. Start server:
```bash
npm run dev
```

## Environment Variables

- `NODE_ENV`
- `HOST`
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS`

All env vars are required. App startup fails fast if any value is missing.

## Response Format

Base response:

```json
{
  "Success": true,
  "Message": "Any message",
  "Object": {},
  "Errors": null
}
```

Paginated response:

```json
{
  "Success": true,
  "Message": "Any message",
  "Object": [],
  "PageNumber": 1,
  "PageSize": 10,
  "TotalSize": 0,
  "Errors": null
}
```

## Notes

- ORM: Drizzle + PostgreSQL.
- User data is stored in `security.users`.
- Shared audit columns (`created_at`, `updated_at`, `created_by`, `updated_by`) are centralized in `shared/db/audit-columns.ts`.
- Read tracking is non-blocking and queued for analytics aggregation.

## Refresh Abuse Control

To prevent one user from generating 100 reads in seconds, current logic applies a 10-second dedupe window per `(articleId, readerId)`. For stricter control in production, add Redis rate-limits and an IP + user fingerprint throttle at the article-read endpoint.

## Commands

```bash
npm run dev
npm run typecheck
npm run build
npm start
npm run db:generate
npm run db:migrate
```
