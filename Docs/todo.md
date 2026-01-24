aggiungere 


brands bunner bottom home page before header, vagheggi, elestique, is clinical, mediostar, icoone

---

## Style System Audit (2026-01-24)

### Problemi / Conflitti rilevati
- Tailwind `theme.extend.colors` usa variabili **non definite**: `--ivory`, `--gold`, `--tech-blue`. (`tailwind.config.ts`)
- `themes.css` contiene override **specifici** per `.service-navigator` con `!important` → rischio conflitto e incoerenza tra temi.
- Molte classi Tailwind hardcoded (es. `bg-white/5`, `border-white/10`, `text-white/60`) → in light theme risultano incoerenti.
- `globals.css` contiene classi custom (`navigator-box`, `navigator-column`) mentre altri componenti usano classi Tailwind hardcoded → doppio sistema.
- Presenza di CSS inline (es. `ServicesCarousel.tsx` `style={{ overflowX: 'auto' }}`) — minore ma da evitare per coerenenza.
- Mancanza di un **singolo punto di verità** per semantic tokens (bg/paper/stroke/text).

### Strategia consigliata (approccio moderno e coerente)
1) **Unificare i token**: mantenere `tokens.css` come fonte unica + `themes.css` per mappatura light/dark.
2) **Data-theme**: usare `data-theme="light|dark"` su `body` per evitare selettori sparsi.
3) **Tailwind semantic tokens**:
   - Aggiornare `tailwind.config.ts` per usare **solo** variabili definite (`--bg`, `--paper`, `--stroke`, `--text-*`).
   - Rimuovere `ivory/gold/tech-blue` o definirli in `tokens.css`.
4) **Eliminare override specifici** in `themes.css` (es. `.service-navigator .text-white` con `!important`).
5) **Component class standard**:
   - Standardizzare card/box con classi `@layer components` (`.card`, `.panel`, `.tag`, `.button`) usando tokens.
   - Eliminare differenze di stile tra componenti che dovrebbero essere uguali.
6) **Pulizia classi hardcoded**:
   - Sostituire `bg-white/..`, `text-white/..`, `border-white/..` con utility basate su token (es. `bg-paper`, `text-primary`, `border-stroke`).
7) **Rimuovere inline style** e spostare in classi condivise.
8) **Refactor graduale**:
   - Fase 1: Service Navigator + Header + Hero (già molto toccati).
   - Fase 2: Shop/Services list + Cards.
   - Fase 3: Pages statiche + footer.
9) **Checklist finale**:
   - Nessun `!important` per override tema.
   - Nessun colore hardcoded fuori da `tokens.css`.
   - Coerenza light/dark verificata su tutte le pagine principali.
