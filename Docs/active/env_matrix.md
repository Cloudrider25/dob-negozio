# Environment Matrix (Dev / Staging / Prod)

## Canonical variables (use only these in app/runtime)

- `DATABASE_URL`
- `POSTGRES_URL`
- `PRISMA_DATABASE_URL`
- `PAYLOAD_SECRET`
- `BLOB_READ_WRITE_TOKEN`

## GitHub Actions secrets

- `PAYLOAD_SECRET`
- `STAGING_DATABASE_URL`
- `STAGING_DEPLOY_HOOK_URL`
- `PRODUCTION_DATABASE_URL`
- `VERCEL_TOKEN`
- `STG_READ_WRITE_TOKEN`

## Branch and deploy mapping

- `dev`: development flow, preview checks
- `staging`: staging deploy workflow + staging hook
- `prod`: production deploy workflow + `vercel --prod`

## Rules to avoid accidental overwrite

- Never commit real `.env` files.
- Keep Vercel env values separated by environment:
  - `Preview (dev/staging)` -> staging DB + staging blob token
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

## Current operational status

- Production deploys no longer use `PRODUCTION_DEPLOY_HOOK_URL`.
- `PRODUCTION_DEPLOY_HOOK_URL` has been removed from GitHub secrets.
- Staging still uses `STAGING_DEPLOY_HOOK_URL`.
- Production deploys are executed by GitHub Actions via Vercel CLI:
  - `vercel pull --environment=production`
  - `vercel build --prod`
  - `vercel deploy --prebuilt --prod`
