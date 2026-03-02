# New Layout Style Guide (Frontend Split System)

## Scope
Regole layout consolidate dai componenti e pagine frontend implementati:
- service detail
- product detail
- section split editoriali
- account dashboard split

Esclusi per ora: `service-navigator` e `shop-navigator`.

## Standard Split 2 Colonne

### Regola base
- Desktop: layout 2 colonne.
- Mobile/tablet: collapse a 1 colonna a `<= 1024px`.
- Gap standard split: `2.5rem` (o token locale equivalente).

### Pattern CSS consigliato
- Definire token locali:
  - `--split-gap`
  - `--split-min-height` (se serve altezza minima coerente)
  - `--split-radius` (se necessario)
- Riutilizzare selettori condivisi per evitare duplicazione (`display`, `grid-template-columns`, `gap`).

Esempio:

```css
.hero,
.insideGrid,
.faqGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--split-gap);
}

@media (max-width: 1024px) {
  .hero,
  .insideGrid,
  .faqGrid {
    grid-template-columns: 1fr;
  }
}
```

## Regole Attive Per Area

### Service / Product Detail
- `.page`: flex column, gap `3rem`, `--header-height: 140px`.
- Griglie principali (`.hero`, `.insideGrid`, `.faqGrid`, `.treatmentGrid`) uniformate con gap condiviso.
- Collapse unificato a `1024px` in media query centralizzata.
- Product detail include anche `.lineGrid` nello stesso standard split.

### Editorial Split
- `StoryValuesSection`:
  - split 2 colonne con `--split-gap` e `--split-min-height`.
  - mobile: 1 colonna + gap esplicito.
- `ProgramsSplitSection`:
  - split 2 colonne con `--split-gap`, `--split-radius`, `--split-min-height`.
  - radius/min-height coerenti tra pannello sinistro e destro.

### Account Dashboard
- Layout sidebar + content:
  - desktop: `grid-template-columns: minmax(260px, 320px) minmax(0, 1fr)`.
  - mobile (`<=1024px`): 1 colonna.

## Responsive Images
- Allineare `sizes` allo stesso breakpoint dei layout split.
- Standard usato nei componenti aggiornati:
  - `(max-width: 1024px) 100vw, ...`

## Checklist Layout
- [ ] Ogni nuovo split usa breakpoint `1024px` (salvo eccezioni documentate).
- [ ] Gap split definito via token locale (`--split-gap`) o valore standard.
- [ ] Nessuna duplicazione non necessaria delle stesse regole grid tra blocchi simili.
- [ ] `sizes` delle immagini coerenti con i breakpoint CSS.
