# Setup Staging + Production

Data: 2026-03-06

## Branch Model

- `dev`: sviluppo continuo (feature merge)
- `staging`: branch di integrazione/QA (deploy automatico staging)
- `prod`: branch produzione (deploy automatico prod)

## Workflow operativo

1. Feature branch -> PR su `dev`
2. `dev` -> PR su `staging` (test integrato su ambiente staging)
3. `staging` -> PR su `prod` (promozione in produzione)

Hotfix:

1. branch da `prod`
2. PR su `prod`
3. back-merge su `dev`

## GitHub Actions introdotte

- [deploy-staging.yml](../../.github/workflows/deploy-staging.yml)
  - trigger: push su `staging`
  - gate: lint + typecheck + test:int + build
  - deploy: webhook `STAGING_DEPLOY_HOOK_URL`

- [deploy-production.yml](../../.github/workflows/deploy-production.yml)
  - trigger: PR su `prod` per verify, push su `prod` per deploy
  - gate: lint + typecheck + test:int + build + smoke e2e
  - deploy: `vercel --prod` via `VERCEL_TOKEN`

## Secrets richiesti

Staging:

- `STAGING_DATABASE_URL`
- `STAGING_DEPLOY_HOOK_URL` (opzionale ma raccomandato)
- `PAYLOAD_SECRET`

Production:

- `PRODUCTION_DATABASE_URL`
- `PAYLOAD_SECRET`
- `VERCEL_TOKEN`

## Branch protection (GitHub UI)

`staging`:

- Require a pull request before merging
- Require approvals: almeno `1`
- Require status checks:
  - `Verify Staging Build`
- Restrict who can push directly: enabled

`prod`:

- Require a pull request before merging
- Require approvals: almeno `1`
- Require approval of the most recent reviewable push
- Require status checks:
  - `Verify Production Build`
  - `Lint + Typecheck + Int Tests`
- Require branches to be up to date before merging
- Restrict who can push directly: enabled

## Comandi iniziali (una volta)

```bash
git checkout -b dev
git push -u origin dev

git checkout -b staging
git push -u origin staging

git checkout -b prod
git push -u origin prod
```

## Note operative

- Staging e produzione devono usare DB separati.
- Mai deployare in produzione da branch diversi da `prod`.
- I deploy produzione devono risultare in Vercel come `Production`, non `Preview`.
