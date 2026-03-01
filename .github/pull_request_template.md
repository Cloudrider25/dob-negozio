## Summary
- 

## Scope
- [ ] Frontend UI
- [ ] Backend/API
- [ ] Payload schema/config
- [ ] Docs only

## Validation
- [ ] `pnpm tsc --noEmit --incremental false`
- [ ] `pnpm build`
- [ ] `pnpm lint`
- [ ] `pnpm test:int`
- [ ] `pnpm test:e2e:smoke` (se disponibili variabili env CI)

## Definition of Done (Account)
- [ ] Performance check eseguito sulle pagine toccate (no regressioni evidenti su LCP/CLS).
- [ ] Accessibilità base verificata (keyboard navigation, focus, label/input, contrasto minimo).
- [ ] Zero warning nuovi introdotti in lint/typecheck/test.

## Typography Checklist
- [ ] Ho usato classi semantiche `typo-*` nei consumer TSX dove applicabile.
- [ ] Non ho aggiunto tipografia custom in `*.module.css` (`font-size`, `line-height`, `letter-spacing`, `font-family`, `text-transform`) senza motivazione.
- [ ] Se ho aggiunto un'eccezione tipografica, è locale, motivata e documentata in `Docs/style-design-audit.md`.
- [ ] Ho verificato heading hierarchy (`h1/h2/h3`) nelle pagine toccate.
- [ ] Ho verificato leggibilità minima su light/dark nelle pagine toccate.

Riferimento esteso: `Docs/pr-checklist-typography.md`
