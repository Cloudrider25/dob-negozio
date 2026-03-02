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
- src/components/layout
- src/components/pages (current)



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




# Review Refactor Cartella Pages

## Gap residui per chiudere a `10/10`
- Ridurre la complessità dei page container monolitici (`HomePage`, `ShopPage`, `ProductDetailPage`, `ServiceDetailPage`) con estrazione di slice server/client e helper condivisi.
- Uniformare struttura subfolder `frontend/*` per dominio (co-location completa di componenti page-specific, CSS e contratti tipi).
- Ridurre duplicazioni di helper runtime lato pagina (`resolveMedia`, estrazione rich text, format utility) in utility condivise per migliorare velocità di sviluppo e ridurre regressioni.

## Valutazione sintetica
- Manutenibilità: `7.6/10`
- Velocità di sviluppo: `7.5/10`
- Modernità approccio: `8.1/10`
- Performance FE: `7.9/10`

## Findings prioritizzati (più impattanti prima)
1. **Container pagina troppo grandi in `frontend`**
- File oltre soglia operativa: `ProductDetailPage.tsx` (`878`), `ServiceDetailPage.tsx` (`823`), `ShopPage.tsx` (`588`), `HomePage.tsx` (`433`).
- Impatto: bassa leggibilità, testabilità ridotta, review lente.

2. **Duplicazione helper dati/media in più pagine**
- Pattern ricorrenti (`resolveMedia`, resolve gallery cover, rich text text extraction) replicati in pagine diverse.
- Impatto: rischio divergenze comportamento e bug cross-page.

3. **Dettagli services/shop ancora sbilanciati lato server component**
- Pagine detail contengono query + normalizzazione + rendering nello stesso file.
- Impatto: cambio requisiti lento e maggiore rischio regressioni.

4. **Pagine legali statiche senza dominio dedicato di presentazione**
- Sono corrette come route, ma possono convergere su template shared unico per coerenza e manutenzione.
- Impatto: piccoli costi di mantenimento su contenuti statici ripetuti.

## Punti positivi
- Routing `app/(frontend)/[locale]` già convertito in pattern wrapper-only.
- Coerenza buona nei domain folder `services/*` e `shop/*` sotto `pages/frontend`.
- CSS page-level correttamente fuori da `app/` e co-locato nei domini componenti.

## Checklist monitor verso 10/10

### Target finale
- Manutenibilità: `10/10`
- Velocità di sviluppo: `10/10`
- Modernità approccio: `10/10`
- Performance FE: `10/10`

### 1) Quick wins (1 giorno)
- [x] Consolidare naming e subfolder omogenei in `pages/frontend/*` (co-location totale page-specific).
- [x] Estrarre helper condivisi minimi (`media/richtext/format`) riusati da almeno 2 pagine.
- [x] KPI: riduzione duplicazioni evidenti senza regressioni (`lint/typecheck` verdi).
- Stato: quick wins pages completato il `2026-03-02` con estrazione utility condivise in `src/components/shared/media.ts` e `src/components/shared/richtext.ts`, applicate al cluster `services` (`ServicesPage`, `ServicesCategoryPage`, `ServiceAreaDetailPage`, `ServiceGoalDetailPage`, `ServiceTreatmentDetailPage`) e riallineamento naming/subfolder (`program-detail` -> `programs/program-detail`); `lint`/`typecheck` ok.

### 2) Refactor medio (2-3 giorni)
- [ ] Spezzare `HomePage` e `ShopPage` in slice leggibili (data mapper + sections render).
- [ ] Estrarre contratti page-domain (`types.ts` / `contracts.ts`) per shop/services/home.
- [ ] KPI: riduzione complessità interna e tempi review più rapidi.
- Stato: refactor medio pages in corso al `2026-03-02`: `ShopPage` con estrazione `contracts` + helper shared (`src/components/pages/frontend/shop/contracts.ts`, `src/components/pages/frontend/shop/shared.ts`, riduzione `588 -> 529` righe), `HomePage` con estrazione `contracts` + helper shared (`src/components/pages/frontend/home/contracts.ts`, `src/components/pages/frontend/home/shared.ts`, riuso utility media condivise, riduzione `433 -> 362` righe), `ServiceDetailPage` con estrazione `contracts` + helper domain (`src/components/pages/frontend/services/service-detail/contracts.ts`, `src/components/pages/frontend/services/service-detail/shared.ts`, riduzione `823 -> 637` righe) e `ProductDetailPage` con estrazione `contracts` + helper domain (`src/components/pages/frontend/shop/product-detail/contracts.ts`, `src/components/pages/frontend/shop/product-detail/shared.ts`, riduzione `894 -> 736` righe). Consolidato anche riuso cross-detail (`product/service`) con componenti shared `InlineVideo`, `DetailFaqSection`, `DetailInsideSection` e `DetailAccordion`; nessuna regressione (`lint`/`typecheck` ok).

### 3) Stato dati robusto (1-2 giorni)
- [ ] Centralizzare normalizzazione media/richtext per pagine frontend in utility condivise.
- [ ] Introdurre guardie consistenti per fallback contenuto (nullability/shape unknown).
- [ ] KPI: comportamento uniforme nei fallback cross-page.

### 4) CSS e rendering (1-2 giorni)
- [ ] Verificare mobile-first nei module CSS page-level residui.
- [ ] Ridurre eccezioni `className` utility duplicate tra pagine detail.
- [ ] KPI: regole più prevedibili e minore frammentazione stilistica.

### 5) Test, quality gate e regressioni (continuo)
- [ ] Aggiungere smoke `@smoke` dedicati ai percorsi page-critical rifattorizzati (`home`, `shop`, `services detail`).
- [ ] Coprire con test int le utility condivise estratte (media/richtext formatters).
- [ ] KPI: regressioni page-level intercettate in CI prima del merge.

### 6) Monitor finale punteggi (da aggiornare a fine fase)
- [ ] Manutenibilità: `10/10` raggiunto. (stato fase pages: `7.6/10`)
- [ ] Velocità di sviluppo: `10/10` raggiunto. (stato fase pages: `7.5/10`)
- [ ] Modernità approccio: `10/10` raggiunto. (stato fase pages: `8.1/10`)
- [ ] Performance FE: `10/10` raggiunto. (stato fase pages: `7.9/10`)
- Delta vs avvio fase pages: da aggiornare a chiusura.
