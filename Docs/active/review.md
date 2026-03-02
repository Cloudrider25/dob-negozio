# Folder Review (Source of Truth)

Ultimo aggiornamento: 2026-03-02
Owner: Team DOB Milano

## Obiettivo
Workflow unico per portare i folder a prod-ready con ciclo ripetibile:
1. richiesta analisi folder
2. analisi secondo questa policy
3. report con findings azionabili
4. eventuali fix + nuova review
5. quando non servono altre modifiche: summary in `go_nogo.md`
6. passaggio al nuovo folder con reset `review_report.md`

## File e responsabilità
- `Docs/active/review.md`: policy e gate (source of truth)
- `Docs/active/review_report.md`: working file del folder corrente (uno solo alla volta)
- `Docs/active/go_nogo.md`: archivio storico dei folder chiusi (`GO | GO con note | NO-GO`)

## Scope della review
Per ogni folder target verificare:
- struttura (file/folder corretti)
- estrazione logica/UI (`cosa`, `quando`, `dove`)
- qualità CSS (mobile-first, token, scope)
- test e quality gate
- readiness produzione (security, data, rollout, observability)

## Regole baseline
1. Struttura frontend:
- `src/frontend/page-domains/<domain>/...` per pagine/sezioni dominio
- `src/frontend/components/...` solo componenti riusabili cross-domain

2. Struttura librerie:
- `src/lib/frontend/...` logica frontend/client
- `src/lib/server/...` logica server-only
- `src/lib/shared/...` utility/types pure
- `src/lib/i18n/...` utility i18n

3. Regole tecniche minime:
- co-location CSS con `*.module.css`
- CSS mobile-first (`base` + `@media (min-width: ...)`)
- contratti/tipi dedicati (`contracts.ts`, `types.ts`) quando utili
- nessuna regressione su `pnpm lint`, `pnpm typecheck`, `pnpm test:int`
- smoke obbligatorio sul folder in review (scope mirato)
- smoke globale opzionale durante review folder; obbligatorio solo a fine batch/pre-release

## Workflow operativo (obbligatorio)

### Fase 0 - Richiesta analisi folder
Input minimi:
- folder target
- owner tecnico
- baseline punteggi iniziali (0-10)

Output:
- `review_report.md` inizializzato con stato `IN REVIEW`

### Fase 1 - Analisi folder (audit)
Checklist:
- inventory file/subfolder
- file mal riposti o mancanti
- violazioni architettura/layer
- duplicazioni da estrarre
- audit CSS (token/mobile-first/scope)
- audit test coverage (`@smoke` + int pertinenti)

Output:
- findings in `review_report.md` con severità `S0/S1/S2/S3`
- azioni azionabili (`Immediate` / `Deferred`)

### Fase 2 - Fix e re-review (loop)
Regola priorità:
- `S0/S1` sempre in `Immediate`
- `S2/S3` in `Deferred` solo se non bloccanti

Regola loop:
- se vengono fatte modifiche, ripetere Fase 1 + Fase 3
- uscire dal loop solo quando non servono altre modifiche necessarie

### Fase 3 - Validazione tecnica
Eseguire sempre:
```bash
pnpm lint
pnpm typecheck
pnpm test:int
# smoke mirato al folder (obbligatorio)
pnpm test:e2e:smoke -- --grep "<tag o spec del folder>"
```

Opzionale durante review singolo folder:
```bash
# smoke globale completo (consigliato ma non bloccante per il singolo folder)
pnpm test:e2e:smoke
```

Se toccati schema/config Payload:
```bash
pnpm generate:types
payload generate:importmap
pnpm typecheck
```

Output:
- evidenze PASS/FAIL nel `review_report.md`

### Fase 4 - Chiusura folder e archiviazione
Regole decisione:
- `GO`: zero `S0/S1` aperti + gate verdi
- `GO con note`: gate verdi + solo backlog non bloccante
- `NO-GO`: almeno un blocker aperto o gate fallito

Output:
- summary finale aggiunto in `go_nogo.md`
- `review_report.md` svuotato/resettato al template pronto per il prossimo folder

Regola di compilazione report:
- in `review_report.md` deve sempre essere presente e compilata la sezione `Production Readiness Checklist (Go/No-Go)` con tutti i 10 punti.

## Severity model
- `S0`: critico (sicurezza/dati/down), blocca sempre
- `S1`: alto (core flow regressi), blocca sempre
- `S2`: medio (debito con rischio evolutivo)
- `S3`: basso (cleanup/documentazione)

## Modello di misurazione (0-10)
Metriche obbligatorie:
- `Manutenibilità`
- `Velocità`
- `Modernità`
- `Performance`

Regole:
- registrare baseline iniziale
- registrare punteggi finali
- registrare delta (`finale - baseline`)
- target minimo: `>= 8/10`
- target stretch: `10/10`

## KPI minimi chiusura folder
- zero import CSS cross-folder non autorizzati
- zero hardcoded colori nel folder (salvo eccezioni documentate)
- almeno 1 smoke `@smoke` sul flusso principale
- gate tecnici verdi
- nessun `S0/S1` aperto

## Production Readiness Checklist (Go/No-Go)

### 1) Decisione
- [ ] Decisione esplicita: `GO | GO con note | NO-GO`
- [ ] Owner tecnico assegnato
- [ ] Motivazione sintetica documentata

### 2) Security gate
- [ ] Access control verificato su endpoint/route toccate
- [ ] Nessun secret hardcoded o leak in log/client bundle
- [ ] Rate limit/protezioni minime su endpoint sensibili
- [ ] Vulnerability check dipendenze eseguito (se applicabile)

### 3) Data & migrations gate
- [ ] Migrazioni `up` validate in test/staging
- [ ] Strategia rollback documentata
- [ ] Integrità dati post-migrazione verificata
- [ ] Piano backup/ripristino definito pre-deploy

### 4) Quality gate tecnico
- [ ] `pnpm lint` verde
- [ ] `pnpm typecheck` verde
- [ ] `pnpm test:int` verde
- [ ] `pnpm test:e2e:smoke -- --grep "<tag o spec folder>"` verde
- [ ] `pnpm test:e2e:smoke` globale verde (`opzionale folder`, obbligatorio fine batch/pre-release)

### 5) Performance gate
- [ ] Baseline pre-rilascio registrata
- [ ] Misure post-change confrontate
- [ ] Nessuna regressione oltre soglia accettata

### 6) Accessibility gate
- [ ] Keyboard/focus verificati
- [ ] Label/semantic role verificati
- [ ] Contrasto minimo verificato

### 7) SEO & routing gate (frontend)
- [ ] Metadata/canonical/hreflang coerenti
- [ ] `sitemap`/`robots` coerenti
- [ ] Status code/fallback route verificati

### 8) Observability gate
- [ ] Logging operativo sufficiente
- [ ] Error tracking attivo
- [ ] Alert minimi definiti

### 9) Rollout & rollback
- [ ] Strategia rilascio definita
- [ ] Procedura rollback pronta
- [ ] Owner on-call e finestra monitoraggio concordati

### 10) Post-release verification
- [ ] Smoke post-deploy completato
- [ ] Monitor 24h/48h senza blocker
- [ ] Chiusura formale release con evidenze

## Template working report (`review_report.md`)

### Folder
`<path-folder>`

### Stato
- Owner:
- Stato: `IN REVIEW | READY FOR GATE`
- Data apertura:

### Baseline punteggi (0-10)
- Manutenibilità:
- Velocità:
- Modernità:
- Performance:

### Inventory
- Subfolder:
- File principali:

### Findings (con severità)
- S0:
- S1:
- S2:
- S3:

### Azioni immediate (bloccanti)
1. [ ]

### Azioni differite (non bloccanti)
1. [ ]

### Evidenze validation
- `pnpm lint`:
- `pnpm typecheck`:
- `pnpm test:int`:
- `pnpm test:e2e:smoke -- --grep "<tag o spec folder>"`:
- `pnpm test:e2e:smoke` (globale, opzionale in review folder):
- Note:

### Production Readiness Checklist (Go/No-Go)

#### 1) Decisione
- [ ] Decisione esplicita: `GO | GO con note | NO-GO`
- [ ] Owner tecnico assegnato
- [ ] Motivazione sintetica documentata

#### 2) Security gate
- [ ] Access control verificato su endpoint/route toccate
- [ ] Nessun secret hardcoded o leak in log/client bundle
- [ ] Rate limit/protezioni minime su endpoint sensibili
- [ ] Vulnerability check dipendenze eseguito (se applicabile)

#### 3) Data & migrations gate
- [ ] Migrazioni `up` validate in test/staging
- [ ] Strategia rollback documentata
- [ ] Integrità dati post-migrazione verificata
- [ ] Piano backup/ripristino definito pre-deploy

#### 4) Quality gate tecnico
- [ ] `pnpm lint` verde
- [ ] `pnpm typecheck` verde
- [ ] `pnpm test:int` verde
- [ ] `pnpm test:e2e:smoke -- --grep "<tag o spec folder>"` verde
- [ ] `pnpm test:e2e:smoke` globale verde (`opzionale folder`, obbligatorio fine batch/pre-release)

#### 5) Performance gate
- [ ] Baseline pre-rilascio registrata
- [ ] Misure post-change confrontate
- [ ] Nessuna regressione oltre soglia accettata

#### 6) Accessibility gate
- [ ] Keyboard/focus verificati
- [ ] Label/semantic role verificati
- [ ] Contrasto minimo verificato

#### 7) SEO & routing gate (frontend)
- [ ] Metadata/canonical/hreflang coerenti
- [ ] `sitemap`/`robots` coerenti
- [ ] Status code/fallback route verificati

#### 8) Observability gate
- [ ] Logging operativo sufficiente
- [ ] Error tracking attivo
- [ ] Alert minimi definiti

#### 9) Rollout & rollback
- [ ] Strategia rilascio definita
- [ ] Procedura rollback pronta
- [ ] Owner on-call e finestra monitoraggio concordati

#### 10) Post-release verification
- [ ] Smoke post-deploy completato
- [ ] Monitor 24h/48h senza blocker
- [ ] Chiusura formale release con evidenze

### Monitor finale punteggi (0-10)
- Manutenibilità:
- Velocità:
- Modernità:
- Performance:
- Delta vs baseline:

### Decisione proposta
- Esito: `GO | GO con note | NO-GO`
- Motivazione:
