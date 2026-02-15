CODEX — Refactor Globale CSS (DOB)  
Obiettivo: passare da stylesheet monolitico (2000+ righe) a:
✅ CSS globale = Foundations + Tokens
✅ Componenti = tutto il resto (Tailwind + Variants)
Per TUTTO il sito, senza cambiare il layout visivo.

CONTESTO
Il progetto DOB usa Next.js + Tailwind. Attualmente il sito ha un file CSS enorme con regole ripetute per sezioni e componenti.
Voglio trasformarlo in un design system professionale e mantenibile:
- globals.css deve contenere SOLO tokens, reset, tipografia base, themes
- tutte le regole specifiche (cards, buttons, tabs, carousel, hero, sections) devono vivere nei componenti React, usando Tailwind + cva (o class-variance-authority)
- Dove servono effetti speciali (glow, noise, mask), usare CSS Modules per singolo componente
- Il risultato finale deve essere IDENTICO visivamente alla versione attuale.

VINCOLI
- Non cambiare UI, spaziature, font-size o allineamenti finali
- Refactor incrementale: non riscrivere tutto in un colpo solo
- Nessun CSS globale per componenti specifici
- Niente duplicazione di classi
- Usare spacing scale coerente (multipli di 4/8)
- Supporto Dark/Light (preferibilmente con class="dark" e CSS variables)

STACK
- Next.js (app router se presente)
- TailwindCSS
- class-variance-authority (cva) + clsx
- opzionale: tailwind-merge

OUTPUT RICHIESTO
Codex deve:
1) Creare una nuova struttura per styles
2) Ripulire globals.css e ridurlo a tokens/foundations
3) Mappare i tokens su Tailwind (theme.extend)
4) Creare un sistema component-first con variants (cva)
5) Migrare progressivamente tutte le pagine mantenendo design identico
6) Eliminare (o svuotare) il CSS monolitico finale

------------------------------------------------------------
1) CREAZIONE STRUTTURA FILES
------------------------------------------------------------
Crea (o aggiorna) questa struttura:

/src/styles/
  globals.css            -> SOLO foundations + tokens
  tokens.css             -> SOLO CSS variables (colors, radius, shadow, easing)
  themes.css             -> mapping light/dark (separato)
  typography.css         -> solo font + text defaults (max 50 righe)

Facoltativo, se vuoi usare @layer components:
  components.css         -> SOLO 10-15 classi base ripetute (NO componenti specifici)

/src/lib/
  cn.ts                  -> helper classnames + twMerge
  ui-variants.ts         -> variants condivisi (cva)

/src/components/ui/
  button.tsx
  card.tsx
  tabs.tsx
  section.tsx
  container.tsx
  divider.tsx

------------------------------------------------------------
2) GLOBALS.CSS — REGOLA ASSOLUTA
------------------------------------------------------------
globals.css deve contenere SOLO:

- @tailwind base/components/utilities
- import dei file tokens/themes/typography
- base body background + text color
- reset base e selection style
- niente .btn, .card, .tabs, .hero, .services etc.

Esempio struttura:

@import "./tokens.css";
@import "./themes.css";
@import "./typography.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { height: 100%; }
body { background: var(--bg); color: var(--text-primary); }

------------------------------------------------------------
3) TOKENS CSS (DOB)
------------------------------------------------------------
Crea tokens in tokens.css come CSS variables:

:root {
  --container: 1280px;

  --bg: #07070A;
  --bg-2: #0B0B10;
  --panel: #11111A;

  --ivory: #F6F2EA;
  --paper: #FFFFFF;

  --gold: #D4AF37;
  --tech-blue: #7AE7FF;

  --radius-card: 20px;
  --radius-pill: 999px;

  --shadow-lux: 0 24px 80px rgba(0,0,0,0.25);
  --ease-lux: cubic-bezier(0.2,0.8,0.2,1);

  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-40: 40px;
  --space-48: 48px;
  --space-64: 64px;
  --space-96: 96px;
  --space-120: 120px;
  --space-160: 160px;
}

------------------------------------------------------------
4) THEMES (LIGHT/DARK) SENZA ROMPERE LAYOUT
------------------------------------------------------------
In themes.css imposta semantic variables:

:root {
  --text-primary: rgba(246,242,234,0.92);
  --text-secondary: rgba(246,242,234,0.70);
  --stroke: rgba(255,255,255,0.10);
}

.dark { ... } (se vuoi invertire, ma DOB può avere dark default)

.light {
  --bg: #F6F2EA;
  --text-primary: rgba(7,7,10,0.92);
  --text-secondary: rgba(7,7,10,0.70);
  --stroke: rgba(7,7,10,0.08);
}

Nota: non lasciare che il browser applichi auto dark-mode, deve essere controllato dal sito.

------------------------------------------------------------
5) TAILWIND CONFIG (MAPPING TOKENS)
------------------------------------------------------------
Aggiorna tailwind.config.ts:

theme.extend = {
  colors: {
    bg: "var(--bg)",
    panel: "var(--panel)",
    ivory: "var(--ivory)",
    paper: "var(--paper)",
    gold: "var(--gold)",
    tech: "var(--tech-blue)",
  },
  borderRadius: {
    card: "var(--radius-card)",
    pill: "var(--radius-pill)",
  },
  boxShadow: {
    lux: "var(--shadow-lux)",
  },
  transitionTimingFunction: {
    lux: "var(--ease-lux)",
  }
}

------------------------------------------------------------
6) COMPONENT-FIRST: CREA UI PRIMITIVES
------------------------------------------------------------
Crea componenti riusabili e piccoli:

1) <Container> 
  - max-w-[var(--container)] mx-auto px-6 md:px-10 lg:px-[72px]

2) <Section> 
  - py-16 md:py-24

3) <Card> 
  - rounded-card bg-paper shadow-lux border border-black/5

4) <Button> (cva variants)
  - primary / secondary / ghost
  - size sm/md/lg
  - state hover/focus
  - supporto dark/light

5) <Tabs> (cva)
  - pill base
  - active gold + micro glow
  - height 44px

6) <Divider> 
  - 1px stroke con variabile

------------------------------------------------------------
7) VARIANTS CON CVA (OBBLIGATORIO PER COERENZA)
------------------------------------------------------------
Installa class-variance-authority e crea:
- buttonVariants
- cardVariants
- tabsVariants

Obiettivo: niente classi duplicate.
Tutto ciò che varia deve essere una Variant.

------------------------------------------------------------
8) MIGRAZIONE PAGINA PER PAGINA (SENZA BUG)
------------------------------------------------------------
Procedura:

A) Prendi una pagina (es. Services)
B) Identifica i blocchi ripetuti (Hero, SectionHeader, CardGrid)
C) Sostituisci CSS legacy con componenti <Section>, <Container>, <Card>, <Button>
D) Sposta eventuali regole specifiche in un CSS Module SOLO se sono effetti (mask, noise, gradient)
E) Verifica che il risultato sia IDENTICO
F) Passa alla pagina successiva

Ordine consigliato:
1) Home
2) Services
3) Service Detail
4) About
5) Contact / Booking

------------------------------------------------------------
9) CSS MODULES SOLO PER EFFETTI SPECIALI
------------------------------------------------------------
Consentito SOLO per:
- glow controllato
- gradient overlay
- noise texture
- mask-image / blend-mode
Tutto ciò che è layout/spaziatura resta in Tailwind.

------------------------------------------------------------
10) PULIZIA FINALE
------------------------------------------------------------
Quando tutte le pagine sono migrate:
- elimina il vecchio file CSS monolitico
- se alcune classi globali servono ancora, portale in:
  /src/styles/components.css (max 10–15 utility base)
ma NON per componenti singoli, solo patterns.

------------------------------------------------------------
11) CHECKLIST QA (OBBLIGATORIA)
------------------------------------------------------------
Prima di chiudere:
- globals.css < 200 righe
- tokens.css < 120 righe
- typography.css < 80 righe
- nessuna classe “random” duplicata
- ogni componente con variants coerenti
- layout identico a prima
- dark/light invariati
- Lighthouse ok, niente CLS

------------------------------------------------------------
DELIVERABLE CHE DEVI PRODURRE ORA
------------------------------------------------------------
1) Commit 1:
   - crea /styles/ tokens/themes/typography
   - pulisci globals.css

2) Commit 2:
   - tailwind config mapping tokens
   - cn.ts + cva setup

3) Commit 3:
   - costruisci primitives UI (Container/Section/Card/Button/Tabs/Divider)

4) Commit 4+:
   - migrazione pagine una alla volta, partendo da Services

FINE.