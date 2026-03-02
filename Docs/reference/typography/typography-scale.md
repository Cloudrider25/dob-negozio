# Typography Scale (Fase 1)

Ultimo aggiornamento: 2026-02-17

Scala tipografica unica definita in `src/styles/typography.css` con approccio mobile-first e `clamp()`.

## Livelli semantici

- `display`: `clamp(2rem, 1.55rem + 2.2vw, 4rem)` / line-height `1.03` / tracking `0.22em`
- `h1`: `clamp(1.75rem, 1.35rem + 1.6vw, 3rem)` / line-height `1.08` / tracking `0.18em`
- `h2`: `clamp(1.5rem, 1.2rem + 1.15vw, 2.35rem)` / line-height `1.14` / tracking `0.14em`
- `h3`: `clamp(1.25rem, 1.08rem + 0.8vw, 1.75rem)` / line-height `1.2` / tracking `0.1em`
- `body-lg`: `clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)` / line-height `1.5`
- `body`: `clamp(0.95rem, 0.92rem + 0.16vw, 1.05rem)` / line-height `1.58`
- `small`: `clamp(0.8125rem, 0.79rem + 0.1vw, 0.9rem)` / line-height `1.5` / tracking `0.04em`
- `caption`: `clamp(0.7rem, 0.68rem + 0.08vw, 0.8rem)` / line-height `1.42` / tracking `0.08em`

## Font family

- display: `var(--font-display)`
- body: `var(--font-body)`

## Nota

Fase 1 definisce la scala e i token.

## Integrazione Tailwind (Fase 2)

- Base tags via `@layer base` in `src/styles/typography.css`:
- `h1..h3` su scala display
- `h4..h6` su scala body-lg
- `p`, `li`, `small`, `label` su scala body/small

- Utility semantiche in `tailwind.config.ts`:
- `text-display`, `text-h1`, `text-h2`, `text-h3`
- `text-body-lg`, `text-body`, `text-small`, `text-caption`
- `font-display`, `font-body`
