# Gap globali residui per chiudere codebase a 10/10:
- Mantenere warning lint globali a zero e prevenire regressioni (`pnpm lint` gate pulito).
- Mantenere suite smoke estesa sui percorsi critici cross-domain (`@smoke`).
- Mantenere monitor performance con trend storico LCP/CLS attivo in CI (`@perf` + workflow dedicata).
- Nota tracking globale: nessun gap bloccante aperto al `2026-03-01`; mantenere la disciplina di monitor continuo.

## Counter globali permanenti (non rimuovere al cambio folder)
- Regola: questa sezione resta sempre in testa al documento e va aggiornata a ogni folder review.
- Warning lint legacy globali: `0` (ultimo `pnpm lint`: 0 errori, 0 warning)
- Suite E2E smoke non implementata (gap percorsi critici): `0` su `8` target minimi (`@smoke` coperti: homepage, account, carousel, shop->cart->checkout, forms-consultation, checkout-validation, heroes, layout-shell)
- Loop performance con misure ripetibili (LCP/CLS) non implementato: `0` (trend storico attivo con `test:e2e:perf`, `perf:vitals:trend` e workflow `Performance Vitals`)
- Ultimo aggiornamento counter: `2026-03-01`

## Counter folder refactored (non rimuovere e aggiornare  al cambio folder)

- src/components/account
- src/components/carousel
- src/components/cart
- src/components/forms
- src/components/checkout
- src/components/heroes
- src/components/layout (current)



# Review Refactor Cartella Layout

## Gap residui per chiudere a `10/10`
- Ridurre complessità strutturale di `Header` (markup/menu state/azioni) con split per responsabilità.
- Ridurre dimensione e frammentazione di `Header.module.css` (token/breakpoint/theme) con consolidamento mobile-first.
- Stabilizzare UX/search drawer (fetch live search, fallback, race handling) con test smoke dedicato.

## Workflow riusabile per altre cartelle
Regole operative per applicare lo stesso miglioramento su un nuovo folder (`X`):

1. Baseline iniziale:
- Misura punteggi iniziali (`manutenibilità`, `velocità`, `modernità`, `performance`) e lista findings prioritizzati con riferimenti file/linea.
- Definisci KPI concreti per ogni fase prima di toccare codice.

2. Piano fasi standard (replicabile):
- `Quick wins` (lint/typecheck, hardcoded critici, accessibilità base).
- `Refactor medio` (split responsabilità, contratti dati più chiari, API componente stabile).
- `Stato dati robusto` (normalizzazione input, fallbacks, guardie runtime).
- `CSS/UI consistency` (mobile-first reale, breakpoints coerenti, token-only policy).
- `Test & quality gate` (unit/int + E2E smoke + workflow CI).

3. Estensione workflow per cartelle ampie (`X-large domain`, es. `layout`):
- `Inventory & dependency map`: mappa entrypoint, dipendenze runtime e side effects globali.
- `Refactor per slice`: esegui in sotto-fasi (`header shell`, `drawer/search`, `preferences`, `theme observer`) con gate per ciascuna slice.
- `Stabilization sprint`: 1 pass finale solo regressioni cross-slice, dead code e allineamento naming/export.

4. Regole tecniche minime da mantenere:
- Nessuna regressione su `pnpm lint`, `pnpm typecheck`, `pnpm test:int`, `pnpm test:e2e:smoke`.
- Ogni refactor strutturale deve includere almeno un test su logica estratta.
- Per API sensibili: verificare sempre access control e ownership con test dedicati.
- CSS sempre `mobile-first`: base senza media query, override solo con `@media (min-width: ...)`; evitare override desktop duplicati/sparsi.
- Organizzazione folder/subfolder per dominio come `account`: root dominio con sottocartelle semantiche (`tabs/<feature>`, `hooks/<feature>`, `client-api`, `shared`, `dashboard`, `forms/<area>`, `auth` quando serve), co-location di `*.module.css` accanto ai componenti e contratti/tipi in file dedicati (`contracts.ts`, `types.ts`).
- Budget dimensione file TS/TSX: target `<= 300` righe per componente/container; oltre soglia va motivato o splittato (eccezioni solo con nota tecnica in review).

5. Quality gate riusabile:
- Riusa `quality:gate` e la workflow CI `Quality Gate`.
- Mantieni tag `@smoke` sui test E2E essenziali del folder `X`.
- Aggiorna PR template con DoD specifica del dominio toccato.

6. Definition of Done per folder `X`:
- Nessun warning nuovo introdotto.
- KPI fase raggiunti e documentati con evidenza.
- Snapshot finale punteggi + gap residui esplicitati in testa al documento di refactor.

## Valutazione sintetica
- Manutenibilità: `6.9/10`
- Velocità di sviluppo: `7.0/10`
- Modernità approccio: `7.3/10`
- Performance FE: `7.1/10`

## Findings prioritizzati (più impattanti prima)
1. **Header monolitico con responsabilità miste (layout/menu/navigation/icon actions)**
- `Header.tsx` concentra menu mobile, nav desktop, brand, social/contact links, e trigger di componenti esterni in un unico blocco.
- Riferimento: [Header.tsx](/Users/ale/Progetti/DOBMilano/src/components/layout/header/Header.tsx)

2. **CSS header molto esteso e difficile da evolvere**
- `Header.module.css` è ampio (`586` righe) con regole duplicate per tema/stati globali e gestione responsive mista.
- Riferimento: [Header.module.css](/Users/ale/Progetti/DOBMilano/src/components/layout/header/Header.module.css)

3. **Gestione menu basata su checkbox/DOM imperative**
- Stato menu affidato a `#menu-toggle` + `label` + `MenuLink.closeMenu()` via DOM query: pattern fragile per testabilità/a11y avanzata.
- Riferimenti: [Header.tsx](/Users/ale/Progetti/DOBMilano/src/components/layout/header/Header.tsx), [MenuLink.tsx](/Users/ale/Progetti/DOBMilano/src/components/layout/header/MenuLink.tsx)

4. **SearchDrawer con data fetching + UI nello stesso componente**
- `SearchDrawer.tsx` accorpa fetch di suggerimenti/live search, routing decisionale e rendering; candidabile a split `hooks/client-api/ui`.
- Riferimento: [SearchDrawer.tsx](/Users/ale/Progetti/DOBMilano/src/components/layout/search/SearchDrawer.tsx)

5. **Observer globale body-class da isolare meglio**
- `HeaderThemeObserver` manipola classi globali body con observer/scroll logic: utile ma da rendere più contrattualizzato/testabile.
- Riferimento: [HeaderThemeObserver.tsx](/Users/ale/Progetti/DOBMilano/src/components/layout/header/HeaderThemeObserver.tsx)

## Punti positivi
- Dominio coerente e centralizzato per la shell globale (`Header`, search drawer, preferences).
- CSS già basato su token design (`--stroke`, `--paper`, `--text-*`) senza hardcoded critici diffusi.
- Lazy loading già presente sul drawer di ricerca con trigger dedicato.

## Checklist monitor verso 10/10

### Target finale
- Manutenibilità: `10/10`
- Velocità di sviluppo: `10/10`
- Modernità approccio: `10/10`
- Performance FE: `10/10`

### 1) Quick wins (1 giorno)
- [x] Verificare lint/typecheck + smoke base senza regressioni su layout.
- [x] Uniformare className composition (`cn`) nei punti con template string duplicative.
- [x] Introdurre fix a11y veloci (focus-visible coerente su trigger/menu actions).
- [x] KPI: baseline stabile e nessuna regressione header/search/prefs.
- Stato: quick wins layout completati il `2026-03-01` (`lint`: ok, `typecheck`: ok, `test:e2e:smoke`: `14/14`).

### 2) Refactor medio (1-2 giorni)
- [x] Riorganizzare folder in slice semantiche (`header/`, `search/`, `preferences/`, `footer/`, `shell/` + `header/parts`).
- [x] Spezzare `Header.tsx` in blocchi (`HeaderBrand`, `HeaderNavigation`, `HeaderActions`, `HeaderMenuOverlay`).
- [x] Estrarre contratti/layout models in `header/contracts.ts`.
- [x] KPI: componenti principali più piccoli e API interne chiare.
- Stato: refactor medio layout completato il `2026-03-02` (`Header.tsx` ridotto a `48` righe, `app/(frontend)/[locale]/layout.tsx` ridotto a `29` righe come route adapter, estrazione `Footer`, `FrontendLocaleShell` e loader server `shell/server/getFrontendLocaleShellData.ts`, migrazione root in `header/search/preferences/footer/shell`; `lint`/`typecheck`/`smoke 14/14` ok).

### 3) Stato dati robusto (0.5-1 giorno)
- [x] Estrarre fetch logic SearchDrawer in hook/client-api con abort/debounce/guardie.
- [x] Formalizzare gestione stato menu senza accesso DOM imperative dove possibile.
- [x] KPI: race conditions ridotte e stato UI più deterministico.
- Stato: stato dati robusto layout completato il `2026-03-01` (`SearchDrawer` con `client-api + hook` e guardie race/abort/debounce; chiusura menu via callback `onNavigate` senza `document.getElementById`; `lint`/`typecheck`/`smoke 14/14` ok).

### 4) CSS e rendering (1-2 giorni)
- [x] Rifattorizzare `Header.module.css` in blocchi/sottosezioni con naming coerente.
- [x] Consolidare breakpoint strategy mobile-first per header/menu overlay.
- [x] Ridurre regole tema duplicate (`:global body[data-theme=...]`) dove centralizzabile.
- [x] Spostare i CSS modulo page-level fuori da `app/(frontend)/[locale]` verso dominio componenti (`src/components/pages/frontend/*`).
- [x] KPI: CSS più compatto e prevedibile su mobile/desktop.
- Stato: CSS e rendering layout completato il `2026-03-02` (assetto mobile-first base + override `@media (min-width: 1025px)`, sezioni CSS esplicite, dedup tema con variabili `--header-*`, migrazione CSS page-level fuori da `app/`); `lint`/`typecheck`/`smoke 14/14` ok.

### 5) Test, quality gate e regressioni (continuo)
- [x] Aggiungere test int su helper search/menu state estratti.
- [x] Aggiungere smoke E2E layout (`@smoke`) per header desktop/mobile + search drawer open/close + preferences modal.
- [x] Includere coverage layout smoke nel gate standard.
- [x] KPI: regressioni UI shell intercettate prima del merge.
- Stato: fase 5 layout completata il `2026-03-01` con `tests/int/layout-search-menu.int.spec.ts` + `tests/e2e/layout-shell-smoke.e2e.spec.ts`; `lint`/`typecheck`/`test:int`/`test:e2e:smoke` tutti verdi (`14/14` smoke).

### 6) Monitor finale punteggi (da aggiornare a fine fase)
- [ ] Manutenibilità: `10/10` raggiunto. (stato fase layout: `9.5/10`)
- [ ] Velocità di sviluppo: `10/10` raggiunto. (stato fase layout: `9.4/10`)
- [ ] Modernità approccio: `10/10` raggiunto. (stato fase layout: `9.5/10`)
- [ ] Performance FE: `10/10` raggiunto. (stato fase layout: `9.0/10`)
- Delta vs avvio: manutenibilità `+2.6`, velocità `+2.4`, modernità `+2.2`, performance `+1.9`.
- Esito fase layout: miglioramento sostanziale consolidato con riorganizzazione per dominio (`header/search/preferences/footer/shell`), shell globale semplificata (`app/(frontend)/[locale]/layout.tsx` ridotto a adapter), stato dati robusto e quality gate verde (`lint/typecheck/test:int/test:e2e:smoke`); `10/10` non marcato finché non si consolida trend storico performance.

### Snapshot finale fase (2026-03-02)
- Manutenibilità: `9.5/10`
- Velocità di sviluppo: `9.4/10`
- Modernità approccio: `9.5/10`
- Performance FE: `9.0/10`

### Snapshot avvio fase (2026-03-01)
- Manutenibilità: `6.9/10`
- Velocità di sviluppo: `7.0/10`
- Modernità approccio: `7.3/10`
- Performance FE: `7.1/10`
