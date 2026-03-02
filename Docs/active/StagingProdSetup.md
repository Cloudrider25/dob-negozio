# Setup Staging + Production

Data: 2026-03-02

## Branch Model

- `develop`: sviluppo continuo (feature merge)
- `staging`: branch di integrazione/QA (deploy automatico staging)
- `main`: branch produzione (deploy automatico prod)

## Workflow operativo

1. Feature branch -> PR su `develop`
2. `develop` -> PR su `staging` (test integrato su ambiente staging)
3. `staging` -> PR su `main` (promozione in produzione)

Hotfix:

1. branch da `main`
2. PR su `main`
3. back-merge su `develop`

## GitHub Actions introdotte

- [deploy-staging.yml](../../.github/workflows/deploy-staging.yml)
  - trigger: push su `staging`
  - gate: lint + typecheck + test:int + build
  - deploy: webhook `STAGING_DEPLOY_HOOK_URL`

- [deploy-production.yml](../../.github/workflows/deploy-production.yml)
  - trigger: push su `main`
  - gate: lint + typecheck + test:int + build + smoke e2e
  - deploy: webhook `PRODUCTION_DEPLOY_HOOK_URL`

## Secrets richiesti

Staging:

- `STAGING_DATABASE_URL`
- `STAGING_PAYLOAD_SECRET`
- `STAGING_DEPLOY_HOOK_URL` (opzionale ma raccomandato)

Production:

- `PRODUCTION_DATABASE_URL`
- `PRODUCTION_PAYLOAD_SECRET`
- `PRODUCTION_DEPLOY_HOOK_URL` (opzionale ma raccomandato)

## Branch protection (GitHub UI)

`staging`:

- Require a pull request before merging
- Require approvals: almeno `1`
- Require status checks:
  - `Verify Staging Build`
- Restrict who can push directly: enabled

`main`:

- Require a pull request before merging
- Require approvals: almeno `1` (meglio `2`)
- Require status checks:
  - `Verify Production Build`
  - `Quality Gate / Lint + Typecheck + Int Tests`
  - `Quality Gate / E2E Smoke`
- Require branches to be up to date before merging
- Restrict who can push directly: enabled

## Comandi iniziali (una volta)

```bash
git checkout -b develop
git push -u origin develop

git checkout -b staging
git push -u origin staging
```

## Note operative

- Staging e produzione devono usare DB separati.
- Mai deployare in produzione da branch diversi da `main`.
- Se fai push locale diretto su `main`, parte comunque il workflow prod: raccomandato disabilitare push diretto con branch protection.
