# Review Report (Working File - Current Folder)

Ultimo aggiornamento: 2026-03-02
Owner: Team DOB Milano

## Uso
Questo file contiene solo il folder attualmente in review.
Quando il folder è chiuso, il summary va in `Docs/active/go_nogo.md` e questo file viene resettato.

---

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
- Esito:
- Motivazione:
