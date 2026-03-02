# Button Contrast & Motion Governance

Ultimo aggiornamento: 2026-02-17  
Owner: Team DOB Milano

## Obiettivo
Garantire leggibilità e coerenza dei pulsanti in light/dark con comportamento motion sicuro e uniforme.

## Stato Programma
Programma completato (batch 1→4, 2026-02-17).

### Batch 1 - Contrasto testo/sfondo (light + dark)
Scope: `button`, `button-link`, CTA/filter/card/hero buttons.

Implementazione:
- matrice palette centralizzata in `src/components/ui/button-theme.ts`:
  - `getButtonBasePalette`
  - `getInteractivePalette`
- applicazione via CSS variables:
  - `--btn-bg`
  - `--btn-text`
  - `--btn-border`
  in `src/components/ui/button.tsx`, `src/components/ui/button-link.tsx`, `src/lib/ui-variants.ts`.

### Batch 2 - Stati interattivi unificati
Scope: `default`, `hover`, `active`, `focus-visible`, `disabled`.

Implementazione:
- matrice stati centralizzata in `src/components/ui/button-theme.ts`:
  - `getButtonStatePalette`
- applicazione unificata in:
  - `src/lib/ui-variants.ts`
  - `src/components/ui/button.tsx`
  - `src/components/ui/button-link.tsx`

### Batch 3 - Motion safety
Scope: overlay Framer Motion dei pulsanti.

Implementazione:
- contrasto mantenuto anche in fase di uscita overlay (`enter/exit`)
- reset stato su fine animazione (no state lock)
- fallback senza motion con `useReducedMotion` (`prefers-reduced-motion`)

File:
- `src/components/ui/button.tsx`
- `src/components/ui/button-link.tsx`

### Batch 4 - QA finale pulsanti
Scope: regressioni tecniche su layer condiviso button.

Esito tecnico:
- `pnpm build` OK
- `pnpm tsc --noEmit --incremental false` OK

Nota:
- validazione visuale manuale cross-page/light-dark resta in handoff UAT/design signoff.
