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

- src/page-domains/frontend/account
- src/components/carousel
- src/components/cart
- src/components/forms
- src/page-domains/frontend/checkout
- src/components/heroes
- src/components/layout
- src/page-domains/frontend
- src/page-domains/frontend (current)



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
- Organizzazione per responsabilità: `src/page-domains/frontend/<domain>/<page>` per page container+sections+shared di dominio; `src/components/*` solo cross-domain riusabile; `src/components/ui/primitives` per building blocks e `src/components/ui/compositions` per blocchi UI composti; co-location di `*.module.css` e contratti/tipi in `contracts.ts`/`types.ts`.
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
- Ridurre duplicazione trasversale tra pagine detail (`shop`/`services`/`programs`) su mapper dati/media e layout UI.
- Estrarre pattern ripetuti in componenti globali riusabili (legal static page, services taxonomy detail page, detail CSS primitives).
- Allineare CSS page-level: meno coupling tra componenti, più moduli dedicati e token condivisi.

## Valutazione sintetica
- Manutenibilità: `7.4/10`
- Velocità di sviluppo: `7.2/10`
- Modernità approccio: `8.0/10`
- Performance FE: `7.8/10`

## Findings principali (priorità)
1. **Duplicazioni forti file-by-file su pagine omologhe**
- `services/area-detail`, `services/goal-detail`, `services/treatment-detail`: codice quasi identico.
- `legal/*`: cinque pagine quasi uguali con sola copy diversa.

2. **Detail pages ancora troppo accoppiate (TSX + CSS)**
- `ServiceDetailPage.tsx` (`624`) e `ProductDetailPage.tsx` (`736`) restano monolitiche.
- `ServiceDetailPage.module.css` (`836`) e `ProductDetailPage.module.css` (`756`) condividono molte classi ma sono separate.

3. **Helper media/text duplicati tra domini**
- `home/shared.ts`, `dob-protocol`, `journal`, `program-detail`, `service-detail/shared.ts`, `shop/product-detail/shared.ts` hanno overlap funzionale.

4. **Coupling CSS/component che limita riuso**
- `ServiceChooseOptions.tsx` e `AlternativeSelector.tsx` dipendono da CSS del parent detail invece che da modulo proprio.

## Findings file-by-file (tutti i file in `src/page-domains/frontend`)
1. `src/page-domains/frontend/account/AccountPage.tsx` (`322`): valido e sicuro (`overrideAccess: false` dove serve); troppo mapping inline, da estrarre mapper in dominio `account`.
2. `src/page-domains/frontend/dob-protocol/DobProtocolPage.tsx` (`93`): semplice ma duplica `resolveMedia/resolveMediaValue`; usare utility shared globale.
3. `src/page-domains/frontend/home/HomePage.module.css` (`35`): leggero; `.page` solo per gap var, ok ma riusabile via preset comune.
4. `src/page-domains/frontend/home/HomePage.tsx` (`362`): migliorato ma ancora mixed query+mapping+render; utile split in `data.ts` + `mappers.ts`.
5. `src/page-domains/frontend/home/contracts.ts` (`1`): ok.
6. `src/page-domains/frontend/home/sections/ProgramsSplitSection.module.css` (`365`): molto grande; estrarre variabili/tokens comuni e classi CTA comuni.
7. `src/page-domains/frontend/home/sections/ProgramsSplitSection.tsx` (`219`): componente valido; candidato riuso parziale per pattern split+step navigator.
8. `src/page-domains/frontend/home/sections/ValuesSection.module.css` (`114`): struttura simile a `StoryValuesSection`; possibile base shared.
9. `src/page-domains/frontend/home/sections/ValuesSection.tsx` (`86`): buona separazione client; pattern molto simile a `StoryValuesSection`.
10. `src/page-domains/frontend/home/shared.ts` (`72`): utile, ma parte delle funzioni è cross-page e andrebbe in shared globale.
11. `src/page-domains/frontend/journal/JournalPage.module.css` (`72`): specifico e pulito.
12. `src/page-domains/frontend/journal/JournalPage.tsx` (`156`): buono, ma `resolveMedia` locale duplicata; fetch Instagram da spostare in helper domain/lib.
13. `src/page-domains/frontend/legal/ContactPage.tsx` (`22`): duplicato strutturale; convergere su `LegalStaticPage`.
14. `src/page-domains/frontend/legal/PrivacyPage.tsx` (`21`): duplicato strutturale; convergere su `LegalStaticPage`.
15. `src/page-domains/frontend/legal/RefundPage.tsx` (`21`): duplicato strutturale; convergere su `LegalStaticPage`.
16. `src/page-domains/frontend/legal/ShippingPage.tsx` (`21`): duplicato strutturale; convergere su `LegalStaticPage`.
17. `src/page-domains/frontend/legal/TermsPage.tsx` (`21`): duplicato strutturale; convergere su `LegalStaticPage`.
18. `src/page-domains/frontend/our-story/OurStoryPage.module.css` (`9`): minimale e corretto.
19. `src/page-domains/frontend/our-story/OurStoryPage.tsx` (`307`): buon dominio, ma mapper dati ancora nel file pagina.
20. `src/page-domains/frontend/our-story/sections/StoryTeamSection.module.css` (`86`): CSS specifico, ok.
21. `src/page-domains/frontend/our-story/sections/StoryTeamSection.tsx` (`61`): pulito; potenziale estrazione in shared section catalog se riusato altrove.
22. `src/page-domains/frontend/our-story/sections/StoryValuesSection.module.css` (`160`): overlap parziale con `ValuesSection.module.css`.
23. `src/page-domains/frontend/our-story/sections/StoryValuesSection.tsx` (`106`): simile a `ValuesSection.tsx`; candidata base shared con varianti.
24. `src/page-domains/frontend/programs/program-detail/ProgramDetailPage.module.css` (`244`): corposo ma coerente; alcune primitive CTA/layout duplicano pattern detail.
25. `src/page-domains/frontend/programs/program-detail/ProgramDetailPage.tsx` (`352`): duplica helper media/format/ID; rischio N+1 nelle `findByID` nei loop steps.
26. `src/page-domains/frontend/services/ServicesPage.tsx` (`296`): struttura buona; molto mapping inline, da isolare in mapper.
27. `src/page-domains/frontend/services/area-detail/ServiceAreaDetailPage.tsx` (`66`): quasi identico a goal/treatment; creare template shared unico.
28. `src/page-domains/frontend/services/category/ServicesCategoryPage.module.css` (`158`): CSS specifico e consistente.
29. `src/page-domains/frontend/services/category/ServicesCategoryPage.tsx` (`299`): ricco ma gestibile; alcune trasformazioni dati ripetitive.
30. `src/page-domains/frontend/services/goal-detail/ServiceGoalDetailPage.tsx` (`66`): quasi identico a area/treatment; creare template shared unico.
31. `src/page-domains/frontend/services/service-detail/ServiceChooseOptions.tsx` (`222`): funzionale, ma accoppiato a CSS parent; creare modulo CSS dedicato.
32. `src/page-domains/frontend/services/service-detail/ServiceDetailPage.module.css` (`836`): troppo esteso; molte classi in overlap con product detail.
33. `src/page-domains/frontend/services/service-detail/ServiceDetailPage.tsx` (`624`): migliorato ma ancora monolite; split in slice render + data builder.
34. `src/page-domains/frontend/services/service-detail/contracts.ts` (`1`): ok.
35. `src/page-domains/frontend/services/service-detail/shared.ts` (`218`): utile ma parzialmente duplicato con `shop/product-detail/shared.ts`.
36. `src/page-domains/frontend/services/treatment-detail/ServiceTreatmentDetailPage.tsx` (`66`): quasi identico a area/goal; creare template shared unico.
37. `src/page-domains/frontend/shop/ShopPage.tsx` (`529`): ancora pesante; resolver media/hero locali e mapper multipli da esternalizzare.
38. `src/page-domains/frontend/shop/contracts.ts` (`11`): ok.
39. `src/page-domains/frontend/shop/product-detail/AlternativeSelector.tsx` (`138`): buona logica, ma usa CSS del parent detail; isolare modulo proprio.
40. `src/page-domains/frontend/shop/product-detail/ProductDetailPage.module.css` (`756`): troppo esteso; overlap con service detail da consolidare.
41. `src/page-domains/frontend/shop/product-detail/ProductDetailPage.tsx` (`736`): migliorato, ancora complesso; ulteriore split consigliato.
42. `src/page-domains/frontend/shop/product-detail/contracts.ts` (`1`): ok.
43. `src/page-domains/frontend/shop/product-detail/shared.ts` (`155`): overlap con `services/service-detail/shared.ts`; unificare parti comuni.
44. `src/page-domains/frontend/shop/shared.ts` (`78`): buono; alcune utility relation/localized text generalizzabili in shared globale.

## Punti positivi
- Routing `app/(frontend)/[locale]` già convertito in pattern wrapper-only.
- Co-location domain-first ormai consolidata in `pages/frontend/*`.
- Pattern `contracts.ts` + `shared.ts` introdotto e già utile per refactor incrementale.
- Componenti cross-detail già globalizzati (`InlineVideo`, `DetailFaqSection`, `DetailInsideSection`, `DetailAccordion`).

## Focus riuso componenti/global
- `LegalStaticPage` (nuovo shared): unico renderer per `contact/privacy/refund/shipping/terms`.
- `ServiceTaxonomyDetailPage` (nuovo shared): unico template per `area/goal/treatment` detail.
- `InteractiveSplitValues` (shared opzionale): base per `home/ValuesSection` e `our-story/StoryValuesSection`.
- `detail-data/shared` (nuovo shared): funzioni comuni tra `service-detail/shared.ts` e `product-detail/shared.ts`.

## Focus CSS globale/shared
- Creare modulo shared per primitive detail (`detail-layout`): `page`, `leadSection`, `heroMedia`, `accordion*`, `faq*`, `inside*`, `video*`.
- Evitare import CSS parent in componenti figli (`AlternativeSelector`, `ServiceChooseOptions`): modulo CSS dedicato per componente.
- Tenere in `src/styles/globals.css` solo layout truly-global (`frontend-page`, split base), non varianti dominio.

## Checklist monitor verso 10/10

### Target finale
- Manutenibilità: `10/10`
- Velocità di sviluppo: `10/10`
- Modernità approccio: `10/10`
- Performance FE: `10/10`

### 1) Quick wins (1 giorno)
- [x] Consolidare naming e subfolder omogenei in `pages/frontend/*`.
- [x] Estrarre helper condivisi minimi (`media/richtext/format`) riusati da almeno 2 pagine.
- [x] KPI: riduzione duplicazioni evidenti senza regressioni (`lint/typecheck` verdi).
- Stato: completato `2026-03-02`.

### 2) Refactor medio (2-3 giorni)
- [ ] Spezzare ulteriormente `ShopPage`, `ServiceDetailPage`, `ProductDetailPage` in `data.ts` + `mappers.ts` + view slices.
- [x] Estrarre contratti page-domain (`contracts.ts`) per home/shop/services detail.
- [ ] KPI: riduzione complessità interna e tempi review più rapidi (target: nessun page container > `500` righe).
- Stato: in corso `2026-03-02`; avanzamento reale confermato ma non sufficiente per “medio” chiuso.

### 3) Stato dati robusto (1-2 giorni)
- [ ] Unificare `resolveMediaFromId/resolveText/formatPrice/normalizeBullets` tra `services` e `shop` detail.
- [ ] Spostare helper duplicati (`DobProtocolPage`, `JournalPage`, `ProgramDetailPage`) su shared globale.
- [ ] KPI: un solo percorso utility per media+richtext nei page domains.

### 4) CSS e rendering (1-2 giorni)
- [ ] Estrarre primitive CSS comuni detail (`service-detail`/`product-detail`) in modulo condiviso.
- [ ] Dare CSS dedicato a `AlternativeSelector` e `ServiceChooseOptions` (stop import dal parent).
- [ ] KPI: riduzione `ServiceDetailPage.module.css` e `ProductDetailPage.module.css` almeno del `20%` ciascuno.

### 5) Test, quality gate e regressioni (continuo)
- [ ] Aggiungere smoke `@smoke` su flussi page-critical (`home`, `shop detail`, `services detail`, `program detail`).
- [ ] Coprire utility estratte (`shared.ts` dominio e global) con test int.
- [ ] KPI: regressioni page-level intercettate in CI prima del merge.

### 6) Monitor finale punteggi (da aggiornare a fine fase)
- [ ] Manutenibilità: `10/10` raggiunto. (stato fase pages review completa: `7.4/10`)
- [ ] Velocità di sviluppo: `10/10` raggiunto. (stato fase pages review completa: `7.2/10`)
- [ ] Modernità approccio: `10/10` raggiunto. (stato fase pages review completa: `8.0/10`)
- [ ] Performance FE: `10/10` raggiunto. (stato fase pages review completa: `7.8/10`)
- Delta vs avvio fase pages: in aggiornamento dopo chiusura fasi 2-4.
