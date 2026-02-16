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
- `src/components/StoryValuesSection.tsx`
- `src/components/account/AccountDashboardClient.tsx`
- `src/components/ProtocolSplit.tsx`
- `src/components/shop/RoutineBuilderSplitSection.tsx`
- `src/components/ProgramsSplitSection.tsx`
- `src/components/shop-navigator/ShopNavigatorSection.tsx`
- `src/components/shop-navigator/components/ConsulenzaForm.tsx`
- `src/components/shop-navigator/components/columns/ColumnProducts.tsx`
- `src/components/service-navigator/components/ConsulenzaForm.tsx`

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
   - `src/components/StoryValuesSection.module.css`
   - `src/components/ProgramsSplitSection.module.css`
   - `src/components/account/AccountDashboardClient.module.css`
2. Token locali introdotti nei componenti split (`--split-gap`, `--split-min-height`, `--split-radius`).
3. `sizes` immagini aggiornato in `src/components/ProgramsSplitSection.tsx`.
4. Verifica: `pnpm -s tsc --noEmit` OK.

### Batch 4 completato
1. Riallineamento breakpoint residui `900/1100` a `1024` nei componenti condivisi:
   - `src/components/account/AuthForms.module.css`
   - `src/components/Header.module.css`
   - `src/components/ServicesProtocol.module.css`
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
Scope: `src/components/service-navigator/*` e `src/components/shop-navigator/*`  
Evidenza: componenti omonimi con differenze moderate (`NavigatorGrid.tsx`, `PathBreadcrumb.tsx`, `ColumnList.tsx`, ecc.)  
Azione: creare `UIC_NavigatorCore` + adapter per dominio (`service`/`shop`) e ridurre duplicazione.

- [ ] **File identici duplicati**  
Scope: `src/components/service-navigator/icons.tsx`, `src/components/shop-navigator/icons.tsx`  
Evidenza: file identici.  
Azione: unificare in `UIC_NavigatorIcons.tsx` + eventuali re-export locali.

- [ ] **Consulenza form duplicata con placeholder runtime**  
Scope: `src/components/service-navigator/components/ConsulenzaForm.tsx`, `src/components/shop-navigator/components/ConsulenzaForm.tsx`  
Evidenza: presenza `TODO` + `console.log`/placeholder submit.  
Azione: estrarre `UIC_ConsultationForm.tsx` con submit handler passato via props e integrazione backend reale.

### Priorita P2 (qualita architettura/stile)

- [x] **Riallineamento sizes e breakpoint condiviso**  
Scope iniziale: `UIC_CarouselCard`, `ValuesSection`, `AuthSplitLayout`, `UIC_Carousel`, `Header`, `ServicesProtocol`, `RoutineBuilderSection`, `AuthForms`  
Risultato: riallineato a `1024px` dove coerente (completato nei batch 1-4).

- [ ] **Riduzione CSS globale monolitico**  
Scope: `src/styles/globals.css`  
Evidenza: file ancora esteso con regole component-specific.  
Azione: proseguire migrazione in CSS module/componenti e mantenere `globals.css` su foundations/tokens/theme/reset.

### Priorita P3 (basso impatto / decisione API)

- [x] **Wrapper carousel legacy**  
Scope: `src/components/ServicesCarousel.tsx`, `src/components/ShopCarousel.tsx`, `src/components/UIC_Carousel.tsx`  
Evidenza: `ServicesCarousel` e `ShopCarousel` sono wrapper sottili su `UIC_Carousel`.  
Azione: consumer migrati a `UIC_Carousel` diretto nelle pagine frontend; alias legacy mantenuti e marcati `@deprecated` per compatibilita.
