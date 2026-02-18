# Style & Design Audit - Two-Column Layout

Ultimo aggiornamento: 2026-02-16  
Owner: Team DOB Milano

## Obiettivo
Verificare i layout a 2 colonne nel frontend e guidare la convergenza di stile/design.

## Scope Implementazione Corrente
- Inclusi: componenti/pagine frontend fuori navigator.
- Esclusi per ora: `service-navigator` e `shop-navigator`.

## Risultati Audit

### Componenti frontend con 2 colonne (`src/components`)
Totale: **9 componenti**
- `src/components/sections/StoryValuesSection.tsx`
- `src/components/account/AccountDashboardClient.tsx`
- `src/components/sections/ProtocolSplit.tsx`
- `src/components/shop/RoutineBuilderSplitSection.tsx`
- `src/components/sections/ProgramsSplitSection.tsx`
- `src/components/navigators/shop-navigator/ShopNavigatorSection.tsx`
- `src/components/navigators/shop-navigator/components/ConsulenzaForm.tsx`
- `src/components/navigators/shop-navigator/components/columns/ColumnProducts.tsx`
- `src/components/navigators/service-navigator/components/ConsulenzaForm.tsx`

### Pagine/layout con pattern 2 colonne (`src/app/(frontend)`)
Totale: **5 file**
- `src/app/(frontend)/[locale]/layout.tsx`
- `src/app/(frontend)/[locale]/services/[category]/page.tsx`
- `src/app/(frontend)/[locale]/services/service/[slug]/service-detail.module.css`
- `src/app/(frontend)/[locale]/shop/[slug]/product-detail.module.css`
- `src/app/(frontend)/[locale]/journal/journal.module.css`

### Totale esteso
Totale file con pattern 2 colonne rilevati: **14**

## Piano (Roadmap)
1. Standard unico split 2 colonne (`1024px` collapse, gap coerente, ratio coerente).
2. Riduzione duplicazione CSS tra detail pages.
3. Convergenza split su componenti editoriali/account.
4. QA visuale desktop/tablet/mobile.
5. Solo dopo: allineamento navigator (`service-navigator`, `shop-navigator`).

## Stato Implementazione

### Batch 1 completato
1. Breakpoint 2-colonne allineato a `1024px` su componenti/pagine fuori navigator.
2. `sizes` immagini allineato al breakpoint nei file toccati.
3. Introdotto `--split-gap` nei detail (`service-detail`, `product-detail`).
4. Verifica: `pnpm -s tsc --noEmit` OK.

### Batch 2 completato
1. Convergenza strutturale griglie 2-colonne in:
   - `src/app/(frontend)/[locale]/services/service/[slug]/service-detail.module.css`
   - `src/app/(frontend)/[locale]/shop/[slug]/product-detail.module.css`
2. Estrazione regole comuni (`display`, `grid-template-columns`, `gap`) con selettori condivisi.
3. Semplificazione media query `1024px` con collapse centralizzato.
4. Verifica: `pnpm -s tsc --noEmit` OK.

### Batch 3 completato
1. Convergenza split-layout in:
   - `src/components/sections/StoryValuesSection.module.css`
   - `src/components/sections/ProgramsSplitSection.module.css`
   - `src/components/account/AccountDashboardClient.module.css`
2. Token locali introdotti nei componenti split (`--split-gap`, `--split-min-height`, `--split-radius`).
3. `sizes` immagini aggiornato in `src/components/sections/ProgramsSplitSection.tsx`.
4. Verifica: `pnpm -s tsc --noEmit` OK.

### Batch 4 completato
1. Riallineamento breakpoint residui `900/1100` a `1024` nei componenti condivisi:
   - `src/components/account/AuthForms.module.css`
   - `src/components/layout/Header.module.css`
   - `src/components/services/ServicesProtocol.module.css`
   - `src/components/shop/RoutineBuilderSection.module.css`
2. Aggiornato anche il boundary desktop corrispondente in header:
   - `@media (min-width: 1101px)` -> `@media (min-width: 1025px)`.
3. Verifica: nessun `sizes`/media query residuo con `900/1100` nei componenti target del batch.
4. Verifica tecnica: `pnpm -s tsc --noEmit` OK.

## Stato Attuale Standard (attivo)
- Breakpoint split: `1024px`.
- Gap split baseline: `2.5rem` (token locale dove possibile).
- Pattern preferred: regole grid condivise + media query unica per collapse.

## Checklist Monitor (Backlog Migliorie)

### Priorita P1 (alto impatto)

- [ ] **Navigator duplicati**  
Scope: `src/components/navigators/service-navigator/*` e `src/components/navigators/shop-navigator/*`  
Evidenza: componenti omonimi con differenze moderate (`NavigatorGrid.tsx`, `PathBreadcrumb.tsx`, `ColumnList.tsx`, ecc.)  
Azione: creare `UIC_NavigatorCore` + adapter per dominio (`service`/`shop`) e ridurre duplicazione.

- [x] **File identici duplicati**  
Scope: `src/components/navigators/service-navigator/icons.tsx`, `src/components/navigators/shop-navigator/icons.tsx`, `src/components/navigators/core/icons.tsx`  
Evidenza: file duplicati sui due navigator.  
Azione: unificato su `navigators/core/icons.tsx`, migrati i consumer diretti e rimossi gli alias locali.

- [x] **Consulenza form duplicata con placeholder runtime**  
Scope: `src/components/forms/ConsultationForm.tsx`, consumer in `service-navigator` e `shop`, endpoint `src/app/api/consultation-leads/route.ts`  
Evidenza: form duplicato e submit placeholder (`console.log`/`alert`) nel layer navigator.  
Azione: estratto componente shared in `src/components/forms`, rimossi wrapper dominio `ConsulenzaForm.tsx`, aggiunto `onSubmit` su props e collegato a endpoint backend dedicato con persistenza lead su Payload (`consultation-leads`).

### Priorita P2 (qualita architettura/stile)

- [x] **Riallineamento sizes e breakpoint condiviso**  
Scope iniziale: `UIC_CarouselCard`, `ValuesSection`, `AuthSplitLayout`, `UIC_Carousel`, `Header`, `ServicesProtocol`, `RoutineBuilderSection`, `AuthForms`  
Risultato: riallineato a `1024px` dove coerente (completato nei batch 1-4).

- [x] **Sistema bottoni unificato (3 soli tipi)**  
Scope: `src/components/ui/button.tsx`, `src/components/ui/button-link.tsx`, `src/components/ui/button-theme.ts`, `src/lib/ui-variants.ts`  
Evidenza: presenza storica di varianti eterogenee (`variant/tone`) e CTA con stili locali non coerenti.  
Azione: standardizzati i bottoni su `kind: main | card | hero` (default `main`), rimosso supporto legacy `variant/tone`, mantenuto motion condiviso; applicata regola d'uso: `card` solo per card prodotto/servizio e CTA acquisto nei program, `main` altrove, `hero` nei CTA hero.
Stato: completato e verificato con scan codebase + `pnpm -s tsc --noEmit`.

- [ ] **Riduzione CSS globale monolitico**  
Scope: `src/styles/globals.css`  
Evidenza: file ancora esteso con regole component-specific.  
Azione: proseguire migrazione in CSS module/componenti e mantenere `globals.css` su foundations/tokens/theme/reset.

### Priorita P3 (basso impatto / decisione API)

- [x] **Wrapper carousel legacy**  
Scope: `src/components/carousel/ServicesCarousel.tsx`, `src/components/carousel/ShopCarousel.tsx`, `src/components/carousel/UIC_Carousel.tsx`  
Evidenza: `ServicesCarousel` e `ShopCarousel` sono wrapper sottili su `UIC_Carousel`.  
Azione: consumer migrati a `UIC_Carousel` diretto nelle pagine frontend; rimossi alias root obsoleti in `src/components/*`; wrapper deprecati mantenuti solo in `src/components/carousel/*` per compatibilita.

### Checklist Monitor - Riorganizzazione `src/components`

- [x] **Definizione convenzioni cartelle e naming**  
Scope: `src/components/**`  
Evidenza: coesistenza di file root, cartelle dominio e naming eterogeneo (`UIC_*`, file sparsi, folder specifiche).  
Azione: convenzione fissata: `UIC_*` solo per primitive/shared UI core; componenti di pagina/domino in cartelle feature (`heroes`, `layout`, `theme`, `sections`, `carousel`).

- [x] **Raggruppamento componenti root in cartelle feature**  
Scope: `src/components/{heroes,layout,theme,sections,carousel}`  
Evidenza: 37 file al root `src/components`, con componenti funzionalmente aggregabili.  
Azione: batch 1 completato: file root migrati nelle cartelle target, con alias compatibili nei vecchi path.

- [x] **Alias compatibilita import legacy**  
Scope: vecchi entrypoint `src/components/*` dopo spostamento  
Evidenza: import path legacy presenti in `src/app` e componenti correlati.  
Azione: re-export temporanei usati durante migrazione e poi rimossi; restano solo wrapper deprecati carousel in `src/components/carousel/*`.

- [x] **Barrel per dominio/feature**  
Scope: `src/components/*/index.ts` (dove utile)  
Evidenza: import diretti su file puntuali con path lunghi e non uniformi.  
Azione: aggiunti `index.ts` in `heroes`, `layout`, `theme`, `sections`, `carousel`.

- [x] **Unificazione navigator core (service/shop)**  
Scope: `src/components/navigators/service-navigator/*`, `src/components/navigators/shop-navigator/*`, nuovo `src/components/navigators/core/*`  
Evidenza: duplicazione componenti (`NavigatorGrid`, `PathBreadcrumb`, `MobileFlow`, `SidePreview`, `ColumnList`, ecc.).  
Azione: estrarre core condiviso e mantenere adapter dominio `service`/`shop` per data mapping e query.  
Stato batch 4: convergenza completata con core condiviso per `NavigatorGridLayout`, `MobileFlowShell`, `SidePreviewSection` oltre ai blocchi gia estratti (`icons`, `ConsultationForm`, `PathBreadcrumb`, `ColumnList`, `ProgressIndicator`); i file dominio restano adapter.

- [x] **Deduplica risorse identiche navigator**  
Scope: `icons.tsx`, `ConsulenzaForm*`, utility/shared CSS navigator  
Evidenza: file uguali o quasi uguali in entrambi i navigator.  
Azione: consolidare in shared/core con re-export locali solo dove serve.  
Stato batch 6: completato. `icons.tsx` unificato in `navigators/core/icons.tsx` con migrazione consumer a import diretto core e rimozione alias locali; `ConsulenzaForm.tsx` rifattorizzato su `navigators/core/ConsultationForm.tsx`; stylesheet unico condiviso in `navigators/core/ConsultationForm.module.css`; centralizzati anche `ProgressIndicator.module.css`, `EmptyState.module.css`, `PathBreadcrumb.module.css` e `CenterImageDisplay.module.css` in `navigators/core` con rimozione dei duplicati locali.
Aggiornamento batch 7: `ConsultationForm` spostato da `navigators/core` a `src/components/forms/ConsultationForm.tsx` con stylesheet dedicato in `src/components/forms/ConsultationForm.module.css`; consumer service/shop collegati direttamente al componente shared.

- [x] **Cleanup finale alias e path obsoleti**  
Scope: alias legacy e import path pre-riorganizzazione  
Evidenza: alias previsti solo come transizione.  
Azione: rimuovere alias deprecati dopo migrazione completa dei consumer.
Stato batch 2: completata rimozione alias navigator (`service-navigator/icons.tsx`, `shop-navigator/icons.tsx`) e alias root `src/components/*`; consumer migrati a path feature/core.

- [x] **Gate di verifica tecnica per ogni batch**  
Scope: codebase frontend + admin import map  
Evidenza: rischio regressioni su path/risoluzione componenti.  
Azione: batch 1-2 verificati con `pnpm -s tsc --noEmit` e `pnpm exec payload generate:importmap`.

## Media Governance (operativo)

- `media/`: storage upload runtime di Payload (configurato come `staticDir` in `src/collections/Media.ts`).
- `public/media/`: fallback statici legacy ancora referenziati da path hardcoded `/media/...`.
- Decisione corrente: mantenere `public/media` fino a migrazione completa dei fallback su asset gestiti da Payload.
- Regola cleanup: non eliminare file in `public/media` se referenziati da fallback attivi.

## Aggiornamento storico 2026-02-18 (spostato da file active)

- [x] **Split section convergence**  
Scope: split layout in `sections`, `shop`, `services`, `service detail`, `product detail`.  
Esito: adozione estesa `SplitSection` + convergenza su service/product detail.

- [x] **SplitSection styles centralized**  
Scope: `src/components/ui/SplitSection.*`, `src/styles/globals.css`.  
Esito: rimosso `SplitSection.module.css`, stili shared consolidati.

- [x] **Swiper deduplica tecnica (batch 1)**  
Scope: `UIC_Carousel`, `UIHeroGallery`, `StoryValuesSection`, `RoutineBuilderSplitSection`, `ServiceBuilderSplitSection`.  
Esito: creato `src/components/ui/swiper/index.ts`, import Swiper CSS/exports centralizzati.

- [x] **HeroGallery deduplica completa**  
Scope: `shop/[slug]`, `services/service/[slug]`, `ui`.  
Esito: componente shared `src/components/ui/HeroGallery.tsx`, rimossi wrapper locali.

- [x] **Cleanup legacy UI glass/pill + heroes legacy**  
Scope: `globals.css`, hero CTA legacy, `ui/glass-card.tsx`, `HeroScrollSnap.tsx`, `ConsultationForm`.  
Esito: rimossi stili/componenti legacy e API obsolete; CTA hero convergono su `kind="hero"`.

- [x] **Hardening coerenza button states (light/dark + motion)**  
Scope: `src/components/ui/button*` + consumer CTA/filter/pill.  
Esito: matrice stati consolidata e contrasto verificato.

- [x] **Pulizia typography locale residua**  
Scope: componenti frontend con override tipografici locali.  
Esito: chiusa con eccezioni deliberate tracciate (`UIC_CarouselCard`, `Header`, `StoryHeroNote`, `product-detail`, `RoutineTemplateBuilder` admin).

- [x] **Media Governance (operativo) - completata**  
Esito: fallback legacy `/media/...` migrati a `/api/media/file/...`; `public/media/` rimosso; regola futura su fallback solo da asset Payload.

## Estensione piano: deduplica strutturale stili/componenti (storico 2026-02-18)

- [x] Batch A - Input shared (`ui/input` + `input-theme`)
- [x] Batch B - Button-only per pill/tag/filter
- [x] Batch C - Section header shared (`SectionTitle` + `SectionSubtitle`)
- [x] Batch D - Cleanup wrapper/alias legacy
  - [x] D1: rimossi `src/components/carousel/ServicesCarousel.tsx`, `src/components/carousel/ShopCarousel.tsx`
  - [x] D2: rimossi `src/components/shop/ProductTabs.tsx`, `src/components/layout/CinematicBackground.tsx`, `src/components/layout/CinematicBackground.module.css`
- Verifiche batch: `rg` consumer check + `pnpm -s tsc --noEmit` + `pnpm -s build`
