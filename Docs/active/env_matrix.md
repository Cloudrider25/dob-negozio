# Environment Matrix (Dev / Staging / Prod)

## Canonical variables (use only these in app/runtime)

- `DATABASE_URL`
- `POSTGRES_URL`
- `PRISMA_DATABASE_URL`
- `PAYLOAD_SECRET`
- `BLOB_READ_WRITE_TOKEN`

## GitHub Actions secrets

- `STAGING_DATABASE_URL`
- `STAGING_PAYLOAD_SECRET`
- `STAGING_DEPLOY_HOOK_URL`
- `PRODUCTION_DATABASE_URL`
- `PRODUCTION_PAYLOAD_SECRET`
- `PRODUCTION_DEPLOY_HOOK_URL`

## Branch and deploy mapping

- `dev`: development flow, preview checks
- `staging`: staging deploy workflow + staging hook
- `prod`: production deploy workflow + production hook

## Rules to avoid accidental overwrite

- Never commit real `.env` files.
- Keep Vercel env values separated by environment:
  - `Preview (develop/staging)` -> staging DB + staging blob token
  - `Production` -> production DB + production blob token
- Promote by merge only:
  - `dev -> staging` (validate)
  - `staging -> prod` (release)

## Cleanup policy (legacy variables)

Legacy names should not be used by code:

- `STG_DATABASE_URL`, `STG_POSTGRES_URL`, `STG_PRISMA_DATABASE_URL`
- `prod_DATABASE_URL`, `prod_POSTGRES_URL`, `prod_PRISMA_DATABASE_URL`
- `STG_READ_WRITE_TOKEN`, `PROD_READ_WRITE_TOKEN`

Keep them only temporarily during migration. Remove after confirming canonical vars are set in all Vercel environments.
