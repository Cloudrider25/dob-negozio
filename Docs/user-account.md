# User Account - Reference

Ultimo aggiornamento: 2026-02-13  
Owner: Team DOB Milano

## Stato corrente

- Ready for QA: completato
- Ready for Production: in sospeso (da riprendere in fase di preparazione rilascio)

## Ambito coperto

- Dominio customer su `users` (ruolo `customer`, profilo base, preferenze locali)
- Flussi auth frontend: `signin`, `signup`, `forgot-password`, `reset-password`, `verify-email`
- Routing icona user: account se autenticato, signin se anonimo
- Area account unica con sezioni dinamiche:
  - Overview
  - Orders
  - Addresses
- Associazione ordini a utente autenticato (`orders.customer`)
- Hardening sicurezza account:
  - rate limiting endpoint auth
  - policy password
  - lockout soft login
  - audit eventi auth
- i18n account/auth/email su `it/en/ru`

## Esiti implementazione

- M1 completata: data model customer + access control
- M2 completata: collegamento ordini <-> utente
- M3 completata: frontend auth/account
- M4 completata: hardening sicurezza account
- M5 completata: QA + i18n account

## Gate di qualità già verificati

- Security Gate: completo
  - self/admin access users verificato
  - access ordini lato account verificato
  - nessuna esposizione cross-user verificata
  - reset password protetto da abuso minimo
  - error handling senza leakage tecnico
- QA Gate: completo
  - register/login/logout
  - forgot/reset password
  - update profilo
  - gestione indirizzi
  - storico ordini utente
  - verifica copy IT/EN/RU

## Test di riferimento

- Integration:
  - `tests/int/account-access.int.spec.ts`
  - `tests/int/api.int.spec.ts`
- E2E:
  - `tests/e2e/account-journey.e2e.spec.ts`
  - `tests/e2e/account-security.e2e.spec.ts`

Comandi usati in validazione:

- `pnpm -s test:int`
- `pnpm -s exec playwright test tests/e2e/account-journey.e2e.spec.ts tests/e2e/account-security.e2e.spec.ts --reporter=line`
- `pnpm -s tsc --noEmit`

## Open point (intenzionale)

- `Ready for Production` resta aperto finche non parte la checklist di rilascio prod-like/prod.

## Note operative per la prossima fase (production prep)

Quando si riprende il rollout produzione, usare questo file come baseline e completare:

- Deploy Gate account (migrazioni, typegen, typecheck, build prod, smoke prod-like)
- Check finale SMTP/Stripe/Sendcloud in ambiente target
- QA smoke finale multi-lingua su journey account
