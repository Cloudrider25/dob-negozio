# New Style Guide

## Scopo
Definire regole visive condivise e allineate all'implementazione corrente frontend.

## Tipografia
- Label/caption: uppercase, tracking alto (`0.16em`-`0.24em`).
- Body: `0.9rem`-`0.95rem`, line-height `1.6`, colore `--text-secondary`.
- Titoli: gerarchia chiara, evitare mix casuale upper/lowercase tra sezioni simili.

## Colori
- Pannelli dark: `var(--bg)`.
- Pannelli light: `#f7f6f3` / `#f7f5f2`.
- Placeholder media: `#e9e6e2`.
- Bordi: `1px solid color-mix(in srgb, var(--stroke) 60%, transparent)`.

## Spaziature
- Gap verticale sezioni pagina: `3rem`.
- Split 2 colonne: `2.5rem` (via `--split-gap` dove possibile).
- Padding pannelli principali: `2.2rem`-`2.6rem`.

## Radius / Border
- Radius pannelli medi: `16px`-`18px`.
- Radius hero/split grandi: `22px`.
- Border sempre soft, no outline pesanti di default.

## Regole Split System (attive)
- Breakpoint standard split: `1024px`.
- Desktop: 2 colonne, mobile: 1 colonna.
- Preferire token locali:
  - `--split-gap`
  - `--split-min-height`
  - `--split-radius`

## Immagini Responsive
- `sizes` allineato ai breakpoint CSS (`max-width: 1024px` per split principali).
- Evitare `sizes` con breakpoint diversi dal layout reale del componente.

## Component Patterns
- Hero split: media + panel con altezze coerenti.
- FAQ/Inside/Treatment grids: stessa logica di collapse.
- Account split: sidebar fluida (`minmax`) + content, collapse a 1 colonna su mobile.

## Note
- Se una variazione rompe la coerenza split/layout, aggiornare prima `Docs/style-design-audit.md` e poi questo file.
