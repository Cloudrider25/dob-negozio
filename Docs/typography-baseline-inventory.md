# Typography Baseline & Inventory (Fase 0)

Ultimo aggiornamento: 2026-02-17  
Scope: `src/` frontend (`app`, `components`, `styles`)

## Metodo
- Scan automatico su CSS/SCSS: `font-size`, `font-family`, `letter-spacing`, `line-height`
- Scan automatico su TS/TSX: classi Tailwind arbitrarie tipografiche (`text-[...]`, `tracking-[...]`, `leading-[...]`)
- Classificazione priorita per refactor:
- `critico`: molte occorrenze / alto impatto cross-page
- `legacy`: medio impatto / da convergere gradualmente
- `eccezione accettata`: pochi casi locali, non bloccanti

## Baseline tecnica (snapshot)
- Occorrenze tipografiche in CSS/SCSS: **617**
- Top file con override tipografici:
- `src/app/(frontend)/[locale]/shop/[slug]/product-detail.module.css` (99)
- `src/app/(frontend)/[locale]/services/service/[slug]/service-detail.module.css` (90)
- `src/app/(checkout)/[locale]/checkout/checkout.module.css` (59)
- `src/components/account/AccountDashboardClient.module.css` (37)
- `src/components/shop/RoutineBuilderSplitSection.module.css` (30)
- `src/styles/globals.css` (27)
- `src/components/services/ServiceRoutineBuilderSplitSection.module.css` (25)
- `src/components/shop/RoutineBuilderSection.module.css` (23)
- `src/components/layout/Header.module.css` (20)
- `src/components/admin/RoutineTemplateBuilder.module.css` (19)

## Tailwind typography arbitraria (TS/TSX)
- `src/app/(frontend)/[locale]/layout.tsx` (26)
- `src/components/layout/Header.tsx` (10)
- `src/app/(frontend)/[locale]/services/[category]/page.tsx` (8)
- Altri casi sparsi (<=3) su pagine/feature minori

## Classificazione priorita

### Critico
- `src/app/(frontend)/[locale]/shop/[slug]/product-detail.module.css`
- `src/app/(frontend)/[locale]/services/service/[slug]/service-detail.module.css`
- `src/app/(checkout)/[locale]/checkout/checkout.module.css`
- `src/components/account/AccountDashboardClient.module.css`
- `src/components/shop/RoutineBuilderSplitSection.module.css`
- `src/styles/globals.css`

### Legacy
- `src/components/services/ServiceRoutineBuilderSplitSection.module.css`
- `src/components/shop/RoutineBuilderSection.module.css`
- `src/components/layout/Header.module.css`
- `src/components/cart/CartDrawer.module.css`
- `src/components/carousel/UIC_CarouselCard.module.css`
- `src/components/sections/ProgramsSplitSection.module.css`
- `src/components/forms/ConsultationForm.module.css`

### Eccezione accettata (fase iniziale)
- File con <= 6 occorrenze locali, legati a micro-layout o componenti isolati.
- Valutazione puntuale in Fase 3/Fase 4, mantenendo priorita su aree critiche.

## Baseline visuale da usare per QA typography
- Home (`/[locale]`)
- Shop listing (`/[locale]/shop`)
- Shop product detail (`/[locale]/shop/[slug]`)
- Services listing (`/[locale]/services`)
- Services detail (`/[locale]/services/service/[slug]`)
- Checkout (`/[locale]/checkout`)
- Account (`/[locale]/account`)

## Output Fase 0
- Inventario creato e classificato.
- Aree critiche identificate per fase successiva (scala tipografica unica + migrazione token/clamp).
