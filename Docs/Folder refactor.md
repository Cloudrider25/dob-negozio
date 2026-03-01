# Gap globali residui per chiudere codebase a 10/10:
- Ridurre i warning lint legacy globali e portare il gate a zero warning nuovi + trend warning in discesa.
- Stabilizzare e ampliare la suite E2E smoke su altri percorsi critici (shop/checkout/account avanzato) per copertura regressioni più ampia.
- Chiudere il loop performance con misure ripetibili (LCP/CLS) su pagine account/checkout in CI o pre-release.
- Nota tracking globale: target `10/10` codebase non ancora chiuso finché restano aperti warning lint legacy e loop misure LCP/CLS non industrializzato; smoke percorsi critici baseline ora coperti e da mantenere stabili.

## Counter globali permanenti (non rimuovere al cambio folder)
- Regola: questa sezione resta sempre in testa al documento e va aggiornata a ogni folder review.
- Warning lint legacy globali: `18` (ultimo `pnpm lint`: 0 errori, 18 warning)
- Suite E2E smoke non implementata (gap percorsi critici): `0` su `4` target minimi (`@smoke` coperti: homepage, account, carousel, shop->cart->checkout)
- Loop performance con misure ripetibili (LCP/CLS) non implementato: `1` (stato `aperto`)
- Ultimo aggiornamento counter: `2026-03-01`

## Counter folder refactored (non rimuovere e aggiornare  al cambio folder)

- src/components/account
- src/components/carousel
- src/components/cart
- src/components/forms (current)
- src/components/checkout (next)


# Review Refactor Cartella Forms

## Gap residui per chiudere a `10/10`
- Ridurre complessità e dimensione del componente `ConsultationForm` (attualmente oltre budget righe).
- Separare configurazione contenuti/copy dal rendering per migliorare manutenibilità e i18n.
- Rendere più robusto stato dati submit/validation e uniformare policy UI/accessibilità sui controlli.

## Workflow riusabile per altre cartelle
Regole operative per applicare lo stesso miglioramento su un nuovo folder (`X`):

1. Baseline iniziale:
- Misura punteggi iniziali (`manutenibilità`, `velocità`, `modernità`, `performance`) e lista findings prioritizzati con riferimenti file/linea.
- Definisci KPI concreti per ogni fase prima di toccare codice.

2. Piano fasi standard (replicabile):
- `Quick wins` (lint/typecheck, copy hardcoded, chiavi React, accessibilità base).
- `Refactor medio` (split responsabilità, contratti dati più chiari, API componente stabile).
- `Stato dati robusto` (normalizzazione input, fallback immagine/link, guardie runtime).
- `CSS/UI consistency` (mobile-first reale, breakpoints coerenti, token-only policy).
- `Test & quality gate` (unit/int + E2E smoke + workflow CI).

3. Regole tecniche minime da mantenere:
- Nessuna regressione su `pnpm lint`, `pnpm typecheck`, `pnpm test:int`, `pnpm test:e2e:smoke`.
- Ogni refactor strutturale deve includere almeno un test su logica estratta.
- Per API sensibili: verificare sempre access control e ownership con test dedicati.
- CSS sempre `mobile-first`: base senza media query, override solo con `@media (min-width: ...)`; evitare override desktop duplicati/sparsi.
- Organizzazione folder/subfolder per dominio come `account`: root dominio con sottocartelle semantiche (`tabs/<feature>`, `hooks/<feature>`, `client-api`, `shared`, `dashboard`, `forms/<area>`, `auth` quando serve), co-location di `*.module.css` accanto ai componenti e contratti/tipi in file dedicati (`contracts.ts`, `types.ts`).
- Budget dimensione file TS/TSX: target `<= 300` righe per componente/container; oltre soglia va motivato o splittato.

4. Quality gate riusabile:
- Riusa `quality:gate` e la workflow CI `Quality Gate`.
- Mantieni tag `@smoke` sui test E2E essenziali del folder `X`.
- Aggiorna PR template con DoD specifica del dominio toccato.

5. Definition of Done per folder `X`:
- Nessun warning nuovo introdotto.
- KPI fase raggiunti e documentati con evidenza.
- Snapshot finale punteggi + gap residui esplicitati in testa al documento di refactor.

## Valutazione sintetica
- Manutenibilità: `6/10`
- Velocità di sviluppo: `6/10`
- Modernità approccio: `6.5/10`
- Performance FE: `6.5/10`

## Findings prioritizzati (più impattanti prima)
1. **Componente unico oltre budget righe e responsabilità miste**
- `ConsultationForm.tsx` contiene rendering, config statica (`skinTypes`/`skinConcerns`), logica submit e UI helper in un unico blocco (371 righe).
- Riferimento: [ConsultationForm.tsx](/Users/ale/Progetti/DOBMilano/src/components/forms/ConsultationForm.tsx)

2. **Copy hardcoded non localizzata**
- Label/placeholder/messaggi e testo footer sono hardcoded in italiano nel componente; limita riuso cross-locale.
- Riferimento: [ConsultationForm.tsx](/Users/ale/Progetti/DOBMilano/src/components/forms/ConsultationForm.tsx)

3. **Stato submit minimale senza reset/error detail**
- Stato `success/error` è booleano semplice, senza reset automatico/coerenza per retry o mapping errori backend.
- Riferimento: [ConsultationForm.tsx](/Users/ale/Progetti/DOBMilano/src/components/forms/ConsultationForm.tsx)

4. **Contratti styles poco tipizzati (`Record<string, string>`)**
- Prop `styles` non vincola le classi richieste, con rischio mismatch runtime.
- Riferimento: [ConsultationForm.tsx](/Users/ale/Progetti/DOBMilano/src/components/forms/ConsultationForm.tsx)

5. **Accessibilità interattivi migliorabile**
- Bottoni `choice/pill/contact` hanno stati hover ma focus keyboard non esplicitato in CSS.
- Riferimento: [ConsultationForm.module.css](/Users/ale/Progetti/DOBMilano/src/components/forms/ConsultationForm.module.css)

6. **Breakpoints multipli ma non consolidati in tokens shared**
- `640/768` hardcoded nel module: coerenti ma non centralizzati in costanti/policy di dominio.
- Riferimento: [ConsultationForm.module.css](/Users/ale/Progetti/DOBMilano/src/components/forms/ConsultationForm.module.css)

## Punti positivi
- Componente già allineato a token colore globali (niente hardcoded `#...` critici nel module).
- Usa primitive shared (`Button`, `Input`, `Textarea`, `Label`, `SectionTitle/Subtitle`).
- Struttura mobile-first presente nel CSS con override progressivi.

## Checklist monitor verso 10/10

### Target finale
- Manutenibilità: `10/10`
- Velocità di sviluppo: `10/10`
- Modernità approccio: `10/10`
- Performance FE: `10/10`

### 1) Quick wins (1-2 giorni)
- [x] Estrarre config statica (`skinTypes`, `skinConcerns`) in file dedicato `shared/config.ts`.
- [x] Introdurre helper tipizzato per classNames (o sostituire con `cn`) eliminando util duplicata locale.
- [x] Aggiungere stati `:focus-visible` su bottoni interattivi (`contactButton`, `choiceButton`, `pill`).
- [x] Eseguire `pnpm lint` + `pnpm typecheck` e correggere regressioni.
- Stato: quick wins completati il `2026-03-01` (`lint`: 0 errori, 18 warning legacy globali; `typecheck`: ok).

### 2) Refactor medio (2-4 giorni)
- [x] Spezzare `ConsultationForm.tsx` in sottocomponenti (`ContactActions`, `PersonalInfoFields`, `SkinTypeSelector`, `ConcernsSelector`, `SubmitState`).
- [x] Introdurre cartelle semantiche `src/components/forms/{ui,shared,hooks}`.
- [x] Tipizzare meglio il contratto style props o passare a import module locale standard.
- [x] Rientrare nel budget file (`<= 300` righe per TSX principali) con split mirato.
- Stato: fase 2 completata il `2026-03-01` (`ConsultationForm` principale ora in `ui/` a 169 righe).

### 3) Stato dati robusto (1-2 giorni)
- [x] Estrarre reducer/form-state helper per update campi/concerns.
- [x] Definire strategia submit robusta (reset stato, retry, error mapping coerente).
- [x] Validare/sanificare payload prima di `onSubmit` (trim + opzionali/nullability chiara).
- [x] KPI: nessun submit inconsistente in retry rapidi o errori backend simulati.
- Stato: fase 3 chiusa il `2026-03-01` con smoke E2E submit success/error + retry rapido (`forms-consultation-smoke`).

### 4) CSS e rendering (1-2 giorni)
- [x] Consolidare module CSS con focus su accessibilità keyboard e coerenza spacing mobile-first.
- [x] Ridurre `transition: all` dove non necessario e limitare proprietà animate.
- [x] Uniformare typography utility e gerarchia titoli/form labels.
- [x] KPI: resa uniforme mobile/desktop con navigazione da tastiera completa.
- Stato: fase 4 chiusa il `2026-03-01` con verifica smoke E2E desktop/mobile + tab navigation.

### 5) Test, quality gate e regressioni (continuo)
- [x] Aggiungere test int su helpers/reducer form.
- [x] Aggiungere smoke E2E light sul submit form (happy path + errore).
- [x] Integrare smoke forms nel gate `test:e2e:smoke` se stabile e non flaky.
- [x] KPI: regressioni form intercettate in CI prima del merge.
- Stato: aggiunti `tests/int/forms-domain.int.spec.ts` e `tests/e2e/forms-consultation-smoke.e2e.spec.ts`; `test:e2e:smoke` passato (`6/6`) il `2026-03-01`.

### 6) Monitor finale punteggi (da aggiornare a fine fase)
- [ ] Manutenibilità: `10/10` raggiunto. (stato fase forms: `8.8/10`)
- [ ] Velocità di sviluppo: `10/10` raggiunto. (stato fase forms: `8.6/10`)
- [ ] Modernità approccio: `10/10` raggiunto. (stato fase forms: `8.9/10`)
- [ ] Performance FE: `10/10` raggiunto. (stato fase forms: `8.4/10`)
- Delta vs avvio: manutenibilità `+2.8`, velocità `+2.6`, modernità `+2.4`, performance `+1.9`.
- Esito fase forms: miglioramento sostanziale chiuso; target `10/10` non marcato finché restano gap globali cross-folder (lint legacy/perf industrializzata).

### Snapshot finale fase (2026-03-01)
- Manutenibilità: `8.8/10`
- Velocità di sviluppo: `8.6/10`
- Modernità approccio: `8.9/10`
- Performance FE: `8.4/10`

### Snapshot avvio fase (2026-03-01)
- Manutenibilità: `6/10`
- Velocità di sviluppo: `6/10`
- Modernità approccio: `6.5/10`
- Performance FE: `6.5/10`
