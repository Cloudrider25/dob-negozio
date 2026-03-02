# Review Report (Working File - Current Folder)

Ultimo aggiornamento: 2026-03-02
Owner: Team DOB Milano

## Uso
Questo file contiene solo il folder attualmente in review.
Quando il folder è chiuso, il summary va in `Docs/active/go_nogo.md` e questo file viene resettato.

## Stato ciclo
- Folder corrente: `src/frontend/layout`
- Stato: `NO-GO`
- Prossima azione: risolvere failure smoke `layout-shell` e rieseguire gate

---

### Folder
`src/frontend/layout`

### Stato
- Owner: `Team DOB Milano`
- Stato: `NO-GO`
- Data apertura: `2026-03-02`

### Baseline punteggi (0-10)
- Manutenibilità: `7`
- Velocità: `7`
- Modernità: `7`
- Performance: `8`

### Inventory
- Subfolder: `header`, `footer`, `search`, `preferences`, `shell`
- File principali:
- `index.ts`
- `header/*`, `footer/*`, `search/*`, `preferences/*`, `shell/*`

### Findings (con severità)
- S0:
- nessuno
- S1:
- smoke folder bloccante non stabile/fallente: `tests/e2e/layout-shell-smoke.e2e.spec.ts`
- S2:
- hardcoded `rgba(...)` in `header/Header.module.css` (allineato a token con patch locale)
- S3:
- nessuno

### Azioni immediate (bloccanti)
1. [x] Allineata policy token-only in `src/frontend/layout/header/Header.module.css` (`--header-shadow` ora usa `var(--stroke)`).
2. [ ] Stabilizzare/fixare `tests/e2e/layout-shell-smoke.e2e.spec.ts` (mobile menu/preferences/search flow).
3. [ ] Verificare errore runtime `TypeError: __webpack_modules__[moduleId] is not a function` osservato durante rerun smoke.

### Azioni differite (non bloccanti)
1. Nessuna finché il gate smoke folder resta rosso.

### Evidenze validation
- `pnpm lint`: `PASS` (`2026-03-02`, locale)
- `pnpm typecheck`: `PASS` (`2026-03-02`, locale)
- `pnpm test:int`: `PASS` (`2026-03-02`, 14 file/50 test, incluso `tests/int/layout-search-menu.int.spec.ts`)
- `pnpm test:e2e:smoke -- --grep "<tag o spec folder>"`: `FAIL` (`tests/e2e/layout-shell-smoke.e2e.spec.ts`)
- `pnpm test:e2e:smoke` (globale, opzionale in review folder): `NOT RUN`
- Note:
  - Primo run: failure su dialog preferenze non visibile + `ERR_CONNECTION_REFUSED` sul secondo test.
  - Rerun: 1 test fallito (`mobile menu + preferences + search drawer`, timeout/click instabile) e log runtime webpack error.

### Production Readiness Checklist (Go/No-Go)

#### 1) Decisione
- [x] Decisione esplicita: `NO-GO`
- [x] Owner tecnico assegnato
- [x] Motivazione sintetica documentata

#### 2) Security gate
- [x] Access control verificato su endpoint/route toccate (`N/A`: folder frontend)
- [x] Nessun secret hardcoded o leak in log/client bundle
- [x] Rate limit/protezioni minime su endpoint sensibili (`N/A`)
- [x] Vulnerability check dipendenze eseguito (se applicabile) (`N/A`)

#### 3) Data & migrations gate
- [x] Migrazioni `up` validate in test/staging (`N/A`)
- [x] Strategia rollback documentata (`N/A`)
- [x] Integrità dati post-migrazione verificata (`N/A`)
- [x] Piano backup/ripristino definito pre-deploy (`N/A`)

#### 4) Quality gate tecnico
- [x] `pnpm lint` verde
- [x] `pnpm typecheck` verde
- [x] `pnpm test:int` verde
- [ ] `pnpm test:e2e:smoke -- --grep "<tag o spec folder>"` verde
- [ ] `pnpm test:e2e:smoke` globale verde (`opzionale folder`, obbligatorio fine batch/pre-release)

#### 5) Performance gate
- [x] Baseline pre-rilascio registrata
- [x] Misure post-change confrontate
- [x] Nessuna regressione oltre soglia accettata

#### 6) Accessibility gate
- [ ] Keyboard/focus verificati (bloccato da smoke rosso)
- [ ] Label/semantic role verificati (bloccato da smoke rosso)
- [ ] Contrasto minimo verificato (bloccato da smoke rosso)

#### 7) SEO & routing gate (frontend)
- [x] Metadata/canonical/hreflang coerenti (`N/A`: componenti UI)
- [x] `sitemap`/`robots` coerenti (`N/A`)
- [x] Status code/fallback route verificati (`N/A`)

#### 8) Observability gate
- [ ] Logging operativo sufficiente (da riesaminare dopo fix smoke)
- [ ] Error tracking attivo (runtime error osservato)
- [ ] Alert minimi definiti

#### 9) Rollout & rollback
- [ ] Strategia rilascio definita (bloccata)
- [ ] Procedura rollback pronta (bloccata)
- [ ] Owner on-call e finestra monitoraggio concordati (bloccata)

#### 10) Post-release verification
- [ ] Smoke post-deploy completato
- [ ] Monitor 24h/48h senza blocker
- [ ] Chiusura formale release con evidenze

### Monitor finale punteggi (0-10)
- Manutenibilità: `7`
- Velocità: `6`
- Modernità: `7`
- Performance: `7`
- Delta vs baseline: `+0 / -1 / +0 / -1`

### Decisione proposta
- Esito: `NO-GO`
- Motivazione: quality gate del folder fallito su smoke mirato `layout-shell`; review fermata come da workflow.
