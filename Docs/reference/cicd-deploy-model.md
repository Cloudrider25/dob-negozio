# CI/CD Deploy Model

## Branch model

- `dev`: integration branch for ongoing development
- `staging`: QA / staging promotion branch
- `prod`: production promotion branch

## Promotion flow

1. feature branch -> PR to `dev`
2. `dev` -> PR to `staging`
3. `staging` -> PR to `prod`

No direct deploys from feature branches to shared environments.

Promotion PRs are guarded by workflow:

- `promote/dev-to-staging-*` must target `staging`
- `promote/staging-to-prod-*` must target `prod`
- promotion branches must never target `dev`

## Deploy model

### Staging

- workflow: [deploy-staging.yml](../../.github/workflows/deploy-staging.yml)
- trigger: push to `staging`
- verify job:
  - lint
  - typecheck
  - integration tests
  - build
- runtime env source:
  - `vercel pull --environment=preview`
  - staging DB alias exported as `STG_POSTGRES_URL`
- deploy job:
  - uses `STAGING_DEPLOY_HOOK_URL`

### Production

- workflow: [deploy-production.yml](../../.github/workflows/deploy-production.yml)
- triggers:
  - PR to `prod` for verification
  - push to `prod` for deploy
- verify job:
  - lint
  - typecheck
  - integration tests
  - build
- runtime env source:
  - `vercel pull --environment=production`
  - production DB alias exported as `PROD_POSTGRES_URL`
- deploy job:
  - uses Vercel CLI
  - `vercel pull --environment=production`
  - `vercel build --prod`
  - `vercel deploy --prebuilt --prod`

## Required GitHub secrets

- `PAYLOAD_SECRET`
- `VERCEL_TOKEN`
- `STG_READ_WRITE_TOKEN`
- `STAGING_DEPLOY_HOOK_URL`

## Protection rules

### `staging`

- PR required
- at least 1 approval
- required check:
  - `Lint + Typecheck + Int Tests`

### `prod`

- PR required
- at least 1 approval
- last push must be approved
- required checks:
  - `Lint + Typecheck + Int Tests`
  - `Verify Production Build`

## Vercel requirements

- Production Branch must be `prod`
- Production deploys must resolve as `Environment: Production`
- Preview deploys from `prod` indicate broken Vercel branch/deploy configuration

## Database policy linkage

This deploy model depends on the database policy in:

- [Database Environment Policy](./database-environment-policy.md)
