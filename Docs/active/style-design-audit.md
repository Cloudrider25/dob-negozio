# Style & Design Audit (Active)

Ultimo aggiornamento: 2026-03-02  
Owner: Team DOB Milano

## Obiettivo
Mantenere coerenza visuale e di interaction design sul frontend, riducendo custom CSS locali e convergendo su standard condivisi (token, componenti UI, varianti button, typography).

## Stato corrente (snapshot)
- Riorganizzazione frontend consolidata su namespace `src/frontend/*` (`components` + `page-domains`).
- Navigator legacy rimossi; i tipi sono stati migrati nei domini `src/frontend/page-domains/shop` e `src/frontend/page-domains/services`.
- Sistema button consolidato su `kind: main | card | hero` con motion condiviso.
- Sistema label consolidato su `src/frontend/components/ui/primitives/label.tsx` + `label-theme.ts` con palette/varianti condivise.
- Sezioni switcher allineate con spacing verticale coerente (`2.5vw`).
- Form consulenza convergente su sezione condivisa di page-domain (`src/frontend/page-domains/shared/sections/ConsulenzaSection.tsx`).
- `SplitSection` unificata in classi globali (`.ui-split-section`, `.ui-split-column`) con adozione estesa nelle split principali.
- Layer Swiper centralizzato (`src/frontend/components/ui/primitives/swiper/index.ts`) con import CSS unificati.
- Documentazione operativa riorganizzata in `Docs/active`, `Docs/reference`, `Docs/archive` con indice unico (`Docs/INDEX.md`).

## Standard attivi
- Breakpoint split/layout: `1024px`.
- Spacing verticale baseline tra blocchi sotto switcher: `2.5vw`.
- Button policy:
- default `main`
- `card` solo per card prodotto/servizio e CTA acquisto
- `hero` solo per CTA hero
- Carousel policy: `Carousel` + `CarouselCard` come base shared.

## Backlog attivo (solo aperti)

### P1 - Alta priorita

- [ ] **Riduzione CSS globale monolitico**  
Scope: `src/styles/globals.css`  
Evidenza: presenti regole component-specific che dovrebbero vivere nei rispettivi module/componenti.  
Azione: continuare migrazione verso CSS module/local scope e mantenere `globals.css` su foundations/reset/theme.

### P2 - Design system quality

- [ ] **Eliminazione colori hardcoded nelle pagine (`#...`)**  
Scope: `src/app/**` (`tsx` + `module.css`)  
Evidenza audit: hardcoded rilevati in `checkout.module.css` (73), `product-detail.module.css` (37), `service-detail.module.css` (26), `layout.tsx` (15).  
Azione: migrare a token globali (`--text-*`, `--bg`, `--paper`, `--stroke`) garantendo contrasto/stati in light+dark.  
Stato: in corso, batch completati `layout.tsx` + `service-detail.module.css` (hardcoded `#...` azzerati in entrambi i file).

## Storico completato
Le voci completate e i batch storici sono stati spostati in:
- `Docs/archive/style-design-audit-completed.legacy.md`

## Metodo di lavoro (operativo da ora)

Obiettivo: per ogni blocco CSS candidato, evitare duplicati/incoerenze tra module CSS, global CSS, classi Tailwind e inline style.

1. Input blocco
- Ricevo snippet CSS + file sorgente (module/path) come riferimento.

2. Ricerca istanze simili/uguali (scope completo frontend runtime)
- CSS module: selector e declaration simili/uguali.
- Global CSS: regole equivalenti o in conflitto.
- TSX/JSX: className Tailwind equivalenti.
- TSX/JSX: `style={{ ... }}` inline equivalenti.

3. Classificazione pattern
- `Single-use`: usato in un solo punto.
- `Repeated`: usato in piu consumer (stesso pattern o variante minima).
- `System-level`: regola base trasversale (reset/foundation/theme).

4. Decisione tecnica (decision tree)
- `Single-use`: resta locale nel module del componente.
- `Repeated` + semantica UI: creare/riusare componente shared (`ui/*` o `sections/*`).
- `Repeated` + utility visuale semplice: usare Tailwind utility (inline className) o utility condivisa.
- `System-level`: spostare in `globals.css` dentro layer appropriato:
  - `@layer base` per elementi HTML/foundation
  - `@layer components` per classi shared di componente
  - `@layer utilities` per utility globali riusabili

5. Implementazione
- Applico la decisione approvata.
- Aggiorno i consumer.
- Rimuovo CSS legacy/duplicato residuo (module, global, inline).

6. Verifica
- Ricerca post-migrazione (`rg`) per confermare rimozione duplicati/vecchi selector.
- Verifica tecnica: `pnpm -s tsc --noEmit` (e build quando richiesto dal blocco).

7. Log chiusura blocco
- Ogni blocco chiuso viene registrato in `Docs/active/log.md` (data, scope, decisione, file toccati, verifica).


## Log blocchi chiusi
Il log completo è stato spostato in `Docs/active/log.md`.
