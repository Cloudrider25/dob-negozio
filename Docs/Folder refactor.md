# Review Refactor Cartella Account

## Gap residui per chiudere a `10/10`
- Ridurre i warning lint legacy globali e portare il gate a zero warning nuovi + trend warning in discesa.
- Stabilizzare e ampliare la suite E2E smoke su altri percorsi critici (shop/checkout/account avanzato) per copertura regressioni più ampia.
- Chiudere il loop performance con misure ripetibili (LCP/CLS) su pagine account/checkout in CI o pre-release.

## Workflow riusabile per altre cartelle
Regole operative per applicare lo stesso miglioramento su un nuovo folder (`X`):

1. Baseline iniziale:
   - Misura punteggi iniziali (`manutenibilità`, `velocità`, `modernità`, `performance`) e lista findings prioritizzati con riferimenti file/linea.
   - Definisci KPI concreti per ogni fase prima di toccare codice.

2. Piano fasi standard (replicabile):
   - `Quick wins` (lint/typecheck, cleanup duplicazioni, fix accessibilità ovvi).
   - `Refactor medio` (split componenti grandi, riduzione prop drilling, estrazione dominio puro + test).
   - `Stato dati robusto` (server-state, optimistic update con rollback, gestione race, error handling unico).
   - `Media/UI consistency` (wrapper riusabili, fallback coerenti, rimozione eccezioni lint non necessarie).
   - `Test & quality gate` (unit/int + E2E smoke + workflow CI).

3. Regole tecniche minime da mantenere:
   - Nessuna regressione su `pnpm lint`, `pnpm typecheck`, `pnpm test:int`, `pnpm test:e2e:smoke`.
   - Ogni refactor strutturale deve includere almeno un test su logica estratta.
   - Per API sensibili: verificare sempre access control e ownership con test dedicati.
   - CSS sempre `mobile-first`: base senza media query, override solo con `@media (min-width: ...)`; evitare override desktop duplicati/sparsi e preferire un unico blocco desktop per modulo quando possibile.
   - Organizzazione folder/subfolder per dominio come `account`: root dominio con sottocartelle semantiche (`tabs/<feature>`, `hooks/<feature>`, `client-api`, `shared`, `dashboard`, `forms/<area>`, `auth` quando serve), co-location di `*.module.css` accanto al componente e contratti/tipi in file dedicati (`contracts.ts`, `types.ts`).

4. Quality gate riusabile:
   - Riusa `quality:gate` e la workflow CI `Quality Gate`.
   - Mantieni tag `@smoke` sui test E2E essenziali del folder `X`.
   - Aggiorna PR template con DoD specifica del dominio toccato.

5. Definition of Done per folder `X`:
   - Nessun warning nuovo introdotto.
   - KPI fase raggiunti e documentati con evidenza.
   - Snapshot finale punteggi + gap residui esplicitati in testa al documento di refactor.

## Valutazione sintetica
- Manutenibilità: `5.5/10`
- Velocità di sviluppo: `6/10`
- Modernità approccio: `6/10`
- Performance FE: `5/10`

## Findings prioritizzati (più impattanti prima)
1. **Code-splitting quasi annullato dal preload totale dei tab**
   - Stai usando `dynamic(..., { ssr: false })` per tutti i tab, ma poi li prefetchi tutti appena la pagina è idle: questo scarica comunque tutto JS e riduce il vantaggio del lazy loading.
   - Riferimenti: [AccountDashboardClient.tsx:45](/Users/ale/Progetti/DOBMilano/src/components/account/dashboard/AccountDashboardClient.tsx:45), [AccountDashboardClient.tsx:287](/Users/ale/Progetti/DOBMilano/src/components/account/dashboard/AccountDashboardClient.tsx:287)

2. **Rischio inconsistenza stato indirizzi (optimistic update senza rollback/versioning)**
   - `setAddresses(next)` viene fatto prima della conferma server; in caso di errore rimani con UI locale divergente.
   - Chiamate ravvicinate (`delete`, `set default`, `save`) possono arrivare fuori ordine e sovrascrivere stato remoto.
   - Riferimenti: [useAccountAddresses.ts:103](/Users/ale/Progetti/DOBMilano/src/components/account/hooks/addresses/useAccountAddresses.ts:103), [useAccountAddresses.ts:116](/Users/ale/Progetti/DOBMilano/src/components/account/hooks/addresses/useAccountAddresses.ts:116), [useAccountAddresses.ts:222](/Users/ale/Progetti/DOBMilano/src/components/account/hooks/addresses/useAccountAddresses.ts:222)

3. **Componente orchestratore troppo grande (God component + prop drilling)**
   - `AccountDashboardClient` è a 580 righe, con troppi stati, callback e pacchetti di props verso tab/modali. Rende più fragile il refactor e più lento lo sviluppo.
   - Riferimenti: [AccountDashboardClient.tsx:121](/Users/ale/Progetti/DOBMilano/src/components/account/dashboard/AccountDashboardClient.tsx:121), [AccountDashboardClient.tsx:372](/Users/ale/Progetti/DOBMilano/src/components/account/dashboard/AccountDashboardClient.tsx:372)

4. **Hook con responsabilità miste (business logic + rendering JSX + classi CSS)**
   - `useAccountServices` genera anche UI (`renderServiceDataPill`) e dipende da `servicesStyles`: coupling alto, testabilità bassa, riuso ridotto.
   - Riferimenti: [useAccountServices.tsx:22](/Users/ale/Progetti/DOBMilano/src/components/account/hooks/services/useAccountServices.tsx:22), [useAccountServices.tsx:332](/Users/ale/Progetti/DOBMilano/src/components/account/hooks/services/useAccountServices.tsx:332)

5. **Overhead evitabile su formattazione date/valuta in render**
   - `Intl.DateTimeFormat` viene creato ripetutamente dentro map/render path e modali; su liste grandi diventa costo inutile.
   - Riferimenti: [AccountOrdersTab.tsx:109](/Users/ale/Progetti/DOBMilano/src/components/account/tabs/orders/AccountOrdersTab.tsx:109), [AccountDashboardModals.tsx:155](/Users/ale/Progetti/DOBMilano/src/components/account/dashboard/modals/AccountDashboardModals.tsx:155), [AccountDashboardClient.tsx:217](/Users/ale/Progetti/DOBMilano/src/components/account/dashboard/AccountDashboardClient.tsx:217)

6. **Molta duplicazione di pattern interattivi (`onKeyDown`/`role="button"`/`tabIndex`)**
   - Stessa logica copiata molte volte nei tab ordini/servizi; manutenzione e bugfix peggiorano nel tempo.
   - Riferimenti: [AccountOrdersTab.tsx:153](/Users/ale/Progetti/DOBMilano/src/components/account/tabs/orders/AccountOrdersTab.tsx:153), [AccountServicesTab.tsx:153](/Users/ale/Progetti/DOBMilano/src/components/account/tabs/services/AccountServicesTab.tsx:153)

7. **Uso esteso di `<img>` con lint disabilitato**
   - Perde ottimizzazioni immagini di Next (lazy, sizing, potenziale CLS/LCP migliore).
   - Riferimenti: [AccountOrdersTab.tsx:98](/Users/ale/Progetti/DOBMilano/src/components/account/tabs/orders/AccountOrdersTab.tsx:98), [AccountDashboardModals.tsx:136](/Users/ale/Progetti/DOBMilano/src/components/account/dashboard/modals/AccountDashboardModals.tsx:136)

8. **Timer senza cleanup in auth forms**
   - `setTimeout` post-success senza cleanup: possibile update/navigation dopo unmount.
   - Riferimenti: [SignUpForm.tsx:69](/Users/ale/Progetti/DOBMilano/src/components/account/forms/auth/SignUpForm.tsx:69), [ResetPasswordForm.tsx:57](/Users/ale/Progetti/DOBMilano/src/components/account/forms/auth/ResetPasswordForm.tsx:57)

## Nota architetturale importante (sicurezza da verificare)
- Dal client fai `PATCH /api/users/${userId}` per profilo e indirizzi.
- Va bene solo se lato API applica ownership/access rigidissimo.
- Riferimenti: [profile.ts:8](/Users/ale/Progetti/DOBMilano/src/components/account/client-api/profile.ts:8), [addresses.ts:100](/Users/ale/Progetti/DOBMilano/src/components/account/client-api/addresses.ts:100)

## Punti positivi
- Buona separazione per dominio (`tabs`, `hooks`, `client-api`, `shared`).
- Tipi TS presenti e abbastanza coerenti.
- UX complessiva ricca (filtri, modal, stati di feedback).

## Checklist monitor verso 10/10

### Target finale
- Manutenibilità: `10/10`
- Velocità di sviluppo: `10/10`
- Modernità approccio: `10/10`
- Performance FE: `10/10`

### 1) Quick wins (1-2 giorni)
- [x] Rimuovere preload globale di tutti i tab in idle e mantenere solo prefetch su intent utente (hover/focus/pointerdown).
- [x] Introdurre formatter condivisi memoizzati (`date`, `dateTime`, `money`) e rimuovere istanze `Intl.*` create in loop/render path.
- [x] Aggiungere cleanup dei `setTimeout` in form auth (`SignUp`, `ResetPassword`) con `useRef`/`useEffect` dedicato.
- [x] Estrarre utility unica per righe cliccabili da tastiera (`Enter`/`Space`) per eliminare duplicazione pattern accessibilità.
- [x] Eseguire `pnpm lint` e `pnpm tsc --noEmit` (o script equivalenti del progetto) e correggere regressioni.
- [x] Validare con smoke test manuale: login, logout, cambio tab, apertura modali, filtri ordini/servizi.
- [x] KPI: riduzione JS iniziale account e riduzione warning lint.
  - Evidenza lint: warning totali ridotti da `22` a `20` (nessun errore).
  - Evidenza build: route `"/[locale]/account"` a `15.4 kB` page size / `177 kB` First Load JS, con preload idle globale tab rimosso (download tab non più forzato all'avvio).

### 2) Refactor medio (3-5 giorni)
- [x] Spezzare `AccountDashboardClient` in container dedicati (`OverviewContainer`, `OrdersContainer`, `ServicesContainer`, `AddressesContainer`, `AestheticContainer`).
- [x] Ridurre prop drilling introducendo `AccountDashboardContext` con slice minime (stato UI comune + dispatch).
- [x] Spostare tipi grandi e contratti props in file dedicati (`contracts.ts` per tab/container).
- [x] Estrarre funzioni pure di dominio da componenti/hook (`groupOrders`, `groupServices`, `formatServiceStatus`, ecc.).
- [x] Aggiungere test unitari alle funzioni pure estratte (ordinamento, grouping, status mapping).
- [x] Definire limite massimo di complessità file (es. max 250-300 righe per componente container).
- [x] KPI: `AccountDashboardClient` sotto 250 righe e minor numero di props passate per tab.
  - Evidenza: `AccountDashboardClient.tsx` ridotto a `170` righe, con split in `AccountDashboardSidebar`, `AccountDashboardContent` e hook `useAccountDashboardForms`.

### 3) Stato dati robusto (2-3 giorni)
- [x] Introdurre layer server-state (`TanStack Query` o `SWR`) per indirizzi, profilo, cartella estetica e sessioni servizi.
- [x] Implementare optimistic update con rollback esplicito su errore per indirizzi.
- [x] Gestire race condition con mutation queue/serializzazione per operazioni indirizzi (`delete`, `set default`, `save`).
- [x] Centralizzare gestione errori API con helper unico (`parseApiError`) e messaggi coerenti.
- [x] Aggiungere invalidazione/fetch policy chiara (`staleTime`, `refetchOnWindowFocus`, retry).
- [x] Verificare guardie lato server su `PATCH /api/users/:id` (ownership e access control).
- [x] KPI: nessuna divergenza stato UI/server in test concorrenti simulati.
  - Evidenza: test `account-access.int.spec.ts` (patch profilo/indirizzi cross-user negato) + `account-address-mutation-queue.int.spec.ts` (serializzazione mutazioni concorrenti).

### 4) Pulizia hook servizi (1-2 giorni)
- [x] Rimuovere rendering JSX da `useAccountServices` (`renderServiceDataPill`) e riportarlo in componente presentazionale.
- [x] Eliminare dipendenza del hook da CSS modules (`servicesStyles`) passando solo dati/flag.
- [x] Separare hook in due layer: `useServiceFilters` (filtri/sort/group) e `useServiceScheduleMutations` (azioni rete).
- [x] Tipizzare meglio stati e transizioni (eventuale `useReducer` con action esplicite).
- [x] Aggiungere test unitari su filtri `used/not_used` e sub-filtri.
- [x] KPI: hook testabile senza DOM e con responsabilità singola.
  - Evidenza: hook servizi separato in `useServiceFilters` + `useServiceScheduleMutations`, reducer puro testato (`account-service-schedule-mutations-reducer.int.spec.ts`).

### 5) Immagini e rendering media (1 giorno)
- [x] Sostituire `<img>` ripetuti con `next/image` dove tecnicamente possibile.
- [x] Definire `sizes`, placeholder/fallback e dimensioni coerenti per evitare layout shift.
- [x] Creare wrapper riusabile globale `MediaThumb` per ordine/prodotto/modale/checkout.
- [x] Rimuovere `eslint-disable` non più necessari relativi a `@next/next/no-img-element`.
- [x] KPI: riduzione CLS/LCP su pagine account e coerenza rendering thumbnail.
  - Evidenza: wrapper condiviso `MediaThumb` adottato sitewide per thumbnail in account (`orders` + modale dettagli ordine), checkout (riepilogo + raccomandati), cart (`drawer` + `page`), search drawer e routine builder (thumb prodotti), con `sizes` espliciti e fallback uniforme.

### 6) Test, quality gate e regressioni (continuo)
- [x] Copertura test minima sui flussi critici account (auth, indirizzi, filtri ordini/servizi, modali).
- [x] Aggiungere test E2E principali (Playwright/Cypress): login, modifica profilo, CRUD indirizzi, modifica data servizio.
- [x] Integrare quality gate CI: typecheck, lint, test unit, test E2E smoke.
- [x] Definire Definition of Done per PR account: performance check + accessibilità base + zero warning nuovi.
- [x] KPI: regressioni funzionali intercettate in CI prima del merge.
  - Evidenza: aggiunti smoke `tests/e2e/account-management-smoke.e2e.spec.ts` + tag smoke su frontend, script `typecheck`/`test:e2e:smoke`/`quality:gate`, workflow GitHub Actions `.github/workflows/quality-gate.yml`, e checklist DoD aggiornata in `.github/pull_request_template.md`.

### 7) Monitor finale punteggi (da aggiornare a fine fase)
- [ ] Manutenibilità: `10/10` raggiunto.
- [ ] Velocità di sviluppo: `10/10` raggiunto.
- [ ] Modernità approccio: `10/10` raggiunto.
- [ ] Performance FE: `10/10` raggiunto.

### Snapshot finale fase (2026-03-01)
- Manutenibilità: `9.0/10`
- Velocità di sviluppo: `9.0/10`
- Modernità approccio: `9.0/10`
- Performance FE: `8.5/10`
