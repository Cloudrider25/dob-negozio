# Typography Governance

Ultimo aggiornamento: 2026-02-17
Owner: Team DOB Milano

## Obiettivo
Evitare la reintroduzione di tipografia custom non standard e mantenere coerenza su tutto il frontend.

## Stato Programma
- Programma typography refactor completato (Fasi 0→6) in data 2026-02-17.
- Dettaglio baseline: `Docs/typography-baseline-inventory.md`
- Dettaglio scala/token: `Docs/typography-scale.md`
- Storico batch: `Docs/archive/style-design-audit-completed.legacy.md`

## Regole vincolanti
- Usare classi semantiche `typo-*` come prima scelta nei consumer (`.tsx`).
- Non introdurre `font-size`, `line-height`, `letter-spacing`, `font-family`, `text-transform` in `*.module.css` salvo eccezioni documentate.
- Per i nuovi livelli tipografici usare token in `src/styles/typography.css` con approccio mobile-first (`clamp()`).
- Evitare combinazioni sparse (`text-* + tracking-* + uppercase`) quando esiste una classe `typo-*` equivalente.
- Le eccezioni tipografiche micro-UI devono essere:
  - motivate (vincolo tecnico/visuale specifico)
  - locali (non riusabili)
  - annotate in `Docs/style-design-audit.md`

## Eccezioni deliberate attuali
- `src/components/admin/RoutineTemplateBuilder.module.css` (admin Payload in uso)
- `src/components/carousel/UIC_CarouselCard.module.css` (sizing prezzo responsive)
- `src/components/layout/Header.module.css` (`menuClose` glyph)
- `src/app/(checkout)/[locale]/checkout/checkout.module.css` (`returnIcon` line-height)
- `src/app/(frontend)/[locale]/shop/[slug]/product-detail.module.css` (`accordionIcon`)
- `src/components/sections/ProgramsSplitSection.module.css` (override responsive badge/counter)
- `src/components/heroes/StoryHeroNote.module.css` (firma display dedicata)

## Procedura per nuove modifiche
1. Definire il livello tipografico richiesto nella scala esistente.
2. Applicare classi `typo-*` in TSX.
3. Lasciare nei CSS module solo layout/stati visuali.
4. Eseguire validazione tecnica:
   - `pnpm tsc --noEmit --incremental false`
   - `pnpm build`
5. Aggiornare `Docs/style-design-audit.md` se si introduce o rimuove un'eccezione.

## Audit rapido consigliato
```bash
rg -n "font-size|line-height|letter-spacing|font-family|text-transform" src --glob "**/*.module.css"
```
