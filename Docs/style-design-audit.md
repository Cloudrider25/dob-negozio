# Style & Design Audit (Active)

Ultimo aggiornamento: 2026-02-17  
Owner: Team DOB Milano

## Obiettivo
Mantenere coerenza visuale e di interaction design sul frontend, riducendo custom CSS locali e convergendo su standard condivisi (token, componenti UI, varianti button, typography).

## Stato corrente (snapshot)
- Riorganizzazione `src/components` completata per domini principali.
- Navigator legacy rimossi; i tipi sono stati migrati in `src/components/shop` e `src/components/services`.
- Sistema button consolidato su `kind: main | card | hero` con motion condiviso.
- Sistema label consolidato su `src/components/ui/label.tsx` + `label-theme.ts` con palette/varianti condivise.
- Sezioni switcher allineate con spacing verticale coerente (`2.5vw`).
- Form consulenza convergente su componente shared (`src/components/services/ConsulenzaSection.tsx`).

## Standard attivi
- Breakpoint split/layout: `1024px`.
- Spacing verticale baseline tra blocchi sotto switcher: `2.5vw`.
- Button policy:
- default `main`
- `card` solo per card prodotto/servizio e CTA acquisto
- `hero` solo per CTA hero
- Carousel policy: `UIC_Carousel` + `UIC_CarouselCard` come base shared.

## Backlog attivo (solo aperti)

### P1 - Alta priorita

- [ ] **Riduzione CSS globale monolitico**  
Scope: `src/styles/globals.css`  
Evidenza: presenti regole component-specific che dovrebbero vivere nei rispettivi module/componenti.  
Azione: continuare migrazione verso CSS module/local scope e mantenere `globals.css` su foundations/reset/theme.

### P2 - Design system quality

- [ ] **Hardening coerenza button states (light/dark + motion)**  
Scope: `src/components/ui/button*` + consumer CTA/filter/pill  
Evidenza: rischio incoerenze di contrasto durante stati interattivi e motion.  
Azione: completare matrice stati unica e verifica contrasto AA su `default/hover/active/focus/disabled`.

- [ ] **Pulizia typography locale residua**  
Scope: componenti frontend con `font-size`/`font-family` hardcoded  
Evidenza: restano override tipografici non allineati alla scala globale.  
Azione: migrare progressivamente su utility tipografiche complete centralizzate (non solo `text-*`) e token `clamp()` mobile-first.

## Media Governance (operativo)
- `media/`: storage upload runtime di Payload (configurato come `staticDir` in `src/collections/Media.ts`).
- `public/media/`: fallback statici legacy ancora referenziati da path hardcoded `/media/...`.
- Decisione corrente: mantenere `public/media` fino a migrazione completa dei fallback su asset gestiti da Payload.
- Regola cleanup: non eliminare file in `public/media` se referenziati da fallback attivi.

## Storico completato
Le voci completate e i batch storici sono stati spostati in:
- `Docs/archive/style-design-audit-completed.legacy.md`
## Typography Refactor Site-Wide (Checklist monitor)

Stato programma: completato (Fasi 0→6 chiuse il 2026-02-17).

Riferimenti ufficiali:
- Baseline e inventario: `Docs/typography-baseline-inventory.md`
- Scala tipografica e mapping token: `Docs/typography-scale.md`
- Governance, regole vincolanti, eccezioni deliberate: `Docs/typography-governance.md`
- Checklist PR operativa: `Docs/pr-checklist-typography.md`
- Storico batch dettagliato: `Docs/archive/style-design-audit-completed.legacy.md`

Nota: in questo file restano solo backlog aperti e stato operativo corrente; i dettagli implementativi storici sono stati decentrati nei documenti tematici.

### Criteri di completamento

- [x] heading/body principali allineati alla scala tipografica unica
- [x] `clamp()` applicato ai livelli previsti in approccio mobile-first
- [x] rimozione dei custom typography ridondanti nelle aree core (module css “layout-only”)
- [x] adozione classi `typo-*` complete nei consumer principali
- [x] hardening visivo completato su componenti core (`Fase 3b`) con eccezioni documentate
- [x] nessuna regressione tecnica (`tsc --noEmit` + build ok)

## Estensione piano: leggibilita e motion safety (solo pulsanti)

Stato programma: completato (batch 1→4, 2026-02-17).

Riferimento ufficiale:
- `Docs/button-governance.md`

Sintesi:
- contrasto light/dark centralizzato su token
- stati `default/hover/active/focus-visible/disabled` unificati
- motion safety completata con fallback `prefers-reduced-motion`
- QA tecnica chiusa (`pnpm build`, `pnpm tsc --noEmit --incremental false`)

Nota: validazione visuale manuale cross-page resta in handoff UAT/design signoff.


## Estensione piano: deduplica strutturale stili/componenti

- [ ] **Estensione - Deduplica strutturale stili/componenti**  
Scope: componenti con varianti duplicate e wrapper legacy (`sections`, `carousel`, `auth/account`, `shop/services`)  
Evidenza: stili e markup simili replicati in file diversi, rischio drift visuale e costo manutenzione alto.  
Azione:
- accorpare pattern ripetuti in componenti shared (`ui/*`, `sections/*`) con API minima
- rimuovere alias/wrapper non necessari dove i consumer possono usare il componente core diretto
- unificare regole visuali duplicate (CTA/filter pills/cards) su token + varianti standard
- eliminare file legacy non referenziati dopo migrazione (con verifica `rg` + build/tsc)
Stato: avviata analisi baseline, implementazione da pianificare a batch.

Baseline ricerca (2026-02-17, scope `src/**/*.module.css`):
- file analizzati: `34`
- ripetizioni selector (stesso nome classe): `.title (13)`, `.section (11)`, `.card (8)`, `.subtitle (7)`, `.page (6)`, `.media (6)`, `.label (4)`, `.input (4)`, `.pill (3)`, `.pills (3)`, `.sectionTitle (3)`
- pattern CSS ricorrenti: `display:flex (171)`, `border-radius:999px (52)`, `background:transparent (46)`, `border:1px solid var(--stroke) (8)`, `text-transform:uppercase (6)`

Priorita operativa suggerita (alto impatto / basso rischio):
- Batch A: `ui/input` + `input-theme` (riduzione duplicati su `AuthForms`, `AccountDashboard`, `ConsultationForm`, `RoutineTemplateBuilder`)
- Batch B: `ui/chip` (pill/tag/filter) unificato per `shop/services/section-switcher/detail`
- Batch C: `sections/SectionHeader` shared (`title/subtitle/sectionTitle`) con API minima
- Batch D: cleanup wrapper/alias legacy + rimozione file non referenziati (con `rg` + `pnpm tsc --noEmit` + build)
