# Style & Design Audit (Active)

Ultimo aggiornamento: 2026-02-18  
Owner: Team DOB Milano

## Obiettivo
Mantenere coerenza visuale e di interaction design sul frontend, riducendo custom CSS locali e convergendo su standard condivisi (token, componenti UI, varianti button, typography).

## Stato corrente (snapshot)
- Riorganizzazione `src/components` completata per domini principali.
- Navigator legacy rimossi; i tipi sono stati migrati in `src/components/shop` e `src/components/services`.
- Sistema button consolidato su `kind: main | card | hero` con motion condiviso.
- Sistema label consolidato su `src/components/ui/label.tsx` + `label-theme.ts` con palette/varianti condivise.
- Sezioni switcher allineate con spacing verticale coerente (`2.5vw`).
- Form consulenza convergente su componente shared (`src/components/services/ConsulenzaSection.tsx`).
- `SplitSection` unificata in classi globali (`.ui-split-section`, `.ui-split-column`) con adozione estesa nelle split principali.
- `HeroGallery` unificata su componente shared (`src/components/ui/HeroGallery.tsx`) con consumer diretti in shop/service detail.
- Layer Swiper centralizzato (`src/components/ui/swiper/index.ts`) con import CSS unificati.

## Standard attivi
- Breakpoint split/layout: `1024px`.
- Spacing verticale baseline tra blocchi sotto switcher: `2.5vw`.
- Button policy:
- default `main`
- `card` solo per card prodotto/servizio e CTA acquisto
- `hero` solo per CTA hero
- Carousel policy: `UIC_Carousel` + `UIC_CarouselCard` come base shared.

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
- Ogni blocco chiuso viene registrato in `Log blocchi chiusi` qui sotto (data, scope, decisione, file toccati, verifica).

## Log blocchi chiusi

- 2026-02-18 | Metodo operativo deduplica CSS attivato
  - Scope: workflow decisionale `module/global/component/tailwind` con inclusione inline styles
  - Esito: protocollo definito e adottato come standard operativo per i prossimi blocchi
- 2026-02-18 | Blocco CSS-001 (`ProgramsSplitSection.module.css` -> `.left`)
  - Input: `position: relative; overflow: hidden;`
  - Ricerca: pattern molto ricorrente nel codebase, ma istanza `.left` legata a consumer singolo (`SplitSection leftClassName`) con override responsive locale.
  - Inline/Tailwind: trovate istanze utility `relative overflow-hidden`, ma con semantica diversa (media wrappers/cards), non consolidabili su componente shared.
  - Decisione: mantenere locale nel module (single-use), nessuno spostamento in global/layer/component.
  - Implementazione: cleanup minimo formattazione (rimozione riga vuota nel blocco).
- 2026-02-18 | Rollback `object-fit` (richiesta utente, opzione 1)
  - Scope: annullata completamente la migrazione object-fit verso utility Tailwind (`@apply object-cover/object-contain`).
  - Esito: ripristinate le dichiarazioni `object-fit` locali nei CSS module e ripristinato `ProgramsSplitSection` allo stato pre-migrazione object-fit.
- 2026-02-18 | Blocco CSS-002 (`ProgramsSplitSection` object-fit -> Tailwind inline)
  - Scope: rimozione regole locali `object-fit` in `src/components/sections/ProgramsSplitSection.module.css` su `.left img` e `.productMedia img`.
  - Decisione: applicare utility Tailwind inline sul consumer attivo (`Image` della colonna sinistra) con `object-cover`; nessuna migrazione `object-contain` per `.productMedia img` per assenza di consumer attivo nel TSX.
  - Implementazione: aggiunta `object-cover` in `src/components/sections/ProgramsSplitSection.tsx`; rimozione dei due blocchi CSS dal module.
  - Verifica: ricerca selector/declaration conferma assenza di `.left img` e `.productMedia img` nel file module.
- 2026-02-18 | Blocco CSS-003 (Circle step/button visual style centralizzato)
  - Scope: uniformare l'aspetto dei circle controls in `RoutineBuilderSplitSection`, `ServiceBuilderSplitSection`, `ProtocolSplit` mantenendo locali solo dimensione/posizione.
  - Decisione: centralizzare lo stile visuale/stati (`hover`, `active`, `selected`, `dimmed`) in `src/components/ui/StateCircleButton.module.css` e riusare `StateCircleButton` come wrapper unico.
  - Implementazione: aggiornato `src/components/ui/StateCircleButton.tsx`; alleggeriti i CSS module locali mantenendo solo `width/height/min/padding`; rimossi modifier locali duplicati (`circleItemActive/Selected/Dim`, `stepBtnActive`) dai consumer.
  - Verifica: `pnpm -s tsc --noEmit` ok, `pnpm -s generate:importmap` ok.
- 2026-02-18 | Blocco CSS-004 (`ProgramsSplitSection` dots visibility/accessibility)
  - Scope: migliorare visibilità dei dot indicators nello slider sinistro.
  - Decisione: mantenere stile locale nel module e aumentare contrasto/stacking del blocco dots.
  - Implementazione: in `src/components/sections/ProgramsSplitSection.module.css` aggiunti `z-index: 2` su `.dots`, aumento size `.dot` (`9px`), contrasto su `.dot`/`.dotActive` tramite `background` + `box-shadow`.
  - Verifica: controllata associazione classi nel consumer `src/components/sections/ProgramsSplitSection.tsx` (`styles.dots`, `styles.dot`, `styles.dotActive`).
- 2026-02-18 | Blocco CSS-005 (`ProgramsSplitSection` cleanup legacy + binding)
  - Scope: rimozione regole legacy/non usate e allineamento class binding nel TSX.
  - Decisione: eliminare classi inutilizzate locali (`.productMedia`, `.price`), rimuovere riferimento mancante `styles.subtitleCentered`, normalizzare stacking dots a livello locale.
  - Implementazione: aggiornati `src/components/sections/ProgramsSplitSection.module.css` (rimossi `.productMedia` e `.price`, `z-index` dots impostato a `2`) e `src/components/sections/ProgramsSplitSection.tsx` (subtitle con sola `styles.subtitle`).
  - Verifica: ricerca `rg` conferma assenza di `subtitleCentered`, `.productMedia`, `.price` CSS e `z-index: 9999` nel blocco.
- 2026-02-18 | Blocco CSS-006 (`AccountDashboardClient` cleanup + token migration)
  - Scope: review e allineamento di `src/components/account/AccountDashboardClient.module.css` e relativo TSX.
  - Decisione: rimozione classi no-op nel TSX, rimozione CSS legacy inutilizzato, migrazione hardcoded color a token/variabili locali, cleanup regole ridondanti.
  - Implementazione:
  - `src/components/account/AccountDashboardClient.tsx`: rimossi riferimenti a classi inesistenti (`styles.menuButtonLabel`, `styles.logoutButton`).
  - `src/components/account/AccountDashboardClient.module.css`: rimossa `.orderEmpty`; introdotte variabili locali token-based (`--account-text`, `--account-divider`, `--account-dot-active`, `--account-success`, `--account-error`); convertiti i colori hardcoded a token/`color-mix`; eliminata regola duplicata `.input` nel media query.
  - Verifica: `rg` conferma assenza classi no-op/legacy e hardcoded `#...` nel file; check classi CSS↔TSX allineato; `pnpm -s tsc --noEmit` ok.
- 2026-02-18 | Blocco CSS-007 (`AccountDashboardClient` typography pass + token-only policy)
  - Scope: rifinitura tipografica account e allineamento definitivo alla regola "solo token da `src/styles`".
  - Decisione: nessuna variabile colore locale nei module CSS; uso esclusivo di token globali (`--text-*`, `--stroke`, `--tech-cyan`, `--neon-red`).
  - Implementazione:
  - `src/components/account/AccountDashboardClient.module.css`: rimossi i custom color vars locali introdotti nel batch precedente; mantenuti solo token globali.
  - `src/components/account/AccountDashboardClient.tsx`: allineati heading e label (`styles.title` su `h2`, `styles.subHeading` su `h3` + `uppercase`, menu button da `typo-h3` a `typo-body-lg`, `styles.value` da `typo-h3` a `typo-body-lg`).
  - `src/styles/typography.css`: aumentato tracking globale `--type-h3-track` (`0.1em` -> `0.12em`).
  - Verifica: `pnpm -s tsc --noEmit` ok; controlli `rg` su account css confermano assenza di `#...`, `--account-*` e `color-mix(...)` locali.
