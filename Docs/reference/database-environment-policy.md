# Database Environment Policy

## Scope

This project uses three database modes with strict separation:

1. `dev`
2. `staging`
3. `prod`

This policy is mandatory for code, CI, deploy workflows, and future maintenance.

## Rules

### Dev

- Dev must use a local Docker Postgres database.
- Accepted local hosts for automatic schema push are:
  - `localhost`
  - `127.0.0.1`
  - `::1`
- In `NODE_ENV=development`, the app must prefer local database env vars over staging/prod env vars.
- Automatic Payload/Drizzle schema push is allowed only in this mode.

Env resolution order in local development:

1. `LOCAL_DATABASE_URL`
2. `DEV_DATABASE_URL`
3. `DATABASE_URL`
4. `POSTGRES_URL`
5. `POSTGRES_URL_NON_POOLING`
6. `POSTGRES_PRISMA_URL`
7. staging fallbacks only if none of the above are valid

### Staging

- Staging must use the staging remote database.
- Automatic schema push is forbidden.
- Schema alignment must happen only on explicit request.
- Alignment must be done through tracked migrations or explicit operational commands, never as a side effect of app boot or CI test initialization.

Typical env vars:

- `STG_DATABASE_URL`
- `STG_POSTGRES_URL`

### Production

- Production must use the production remote database.
- Automatic schema push is forbidden.
- Schema alignment must happen only on explicit request.
- Production alignment must be controlled, traceable, and migration-based.

Typical env vars:

- `PROD_DATABASE_URL`
- `PROD_POSTGRES_URL`

## Runtime Behavior

The runtime config enforces:

- local automatic schema push only for local development databases
- no automatic schema push in CI
- no automatic schema push on staging/prod remote databases

Override is possible only via:

`PAYLOAD_ENABLE_SCHEMA_PUSH=true`

This override should be used only intentionally and never as the default for shared environments.

## Rationale

This avoids:

- implicit schema mutations on shared databases
- CI runs mutating staging
- drift caused by `pushDevSchema` on remote databases
- repeated FK/index collisions caused by database naming limits

## Operational Guidance

### Local development

Use a local Postgres Docker container and keep `.env` pointed to the local database for normal dev work.

Example:

```env
LOCAL_DATABASE_URL=postgres://postgres:postgres@localhost:5432/dobmilano
DEV_DATABASE_URL=postgres://postgres:postgres@localhost:5432/dobmilano
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dobmilano
```

### Staging / production alignment

When schema changes are needed:

1. create or update a tracked migration
2. validate locally
3. apply to staging on request
4. promote to production on request

Do not rely on application boot to reconcile shared database schema.
