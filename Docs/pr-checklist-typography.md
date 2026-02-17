# PR Checklist - Typography

Usare questa checklist in ogni PR con impatto UI.

- [ ] Ho usato classi semantiche `typo-*` nei consumer TSX dove applicabile.
- [ ] Non ho aggiunto tipografia custom in `*.module.css` (`font-size`, `line-height`, `letter-spacing`, `font-family`, `text-transform`) senza motivazione.
- [ ] Se ho aggiunto un'eccezione tipografica, è locale, motivata e documentata in `Docs/style-design-audit.md`.
- [ ] Ho verificato che non ci siano regressioni su heading hierarchy (`h1/h2/h3`) nelle pagine toccate.
- [ ] Ho verificato leggibilità minima su light/dark nelle pagine toccate.
- [ ] Ho eseguito:
  - [ ] `pnpm tsc --noEmit --incremental false`
  - [ ] `pnpm build`

Controllo veloce opzionale:

```bash
rg -n "font-size|line-height|letter-spacing|font-family|text-transform" src --glob "**/*.module.css"
```
