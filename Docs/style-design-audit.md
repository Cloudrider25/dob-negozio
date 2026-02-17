# Style & Design Audit (Active)

Ultimo aggiornamento: 2026-02-17  
Owner: Team DOB Milano

## Obiettivo
Mantenere coerenza visuale e di interaction design sul frontend, riducendo custom CSS locali e convergendo su standard condivisi (token, componenti UI, varianti button, typography).

## Stato corrente (snapshot)
- Riorganizzazione `src/components` completata per domini principali.
- Navigator legacy rimossi; i tipi sono stati migrati in `src/components/shop` e `src/components/services`.
- Sistema button consolidato su `kind: main | card | hero` con motion condiviso.
- Sezioni switcher allineate con spacing verticale coerente (`2.5vw`).
- Form consulenza convergente su componente shared (`src/components/services/ConsulenzaSection.tsx`).

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

- [ ] **Hardening coerenza button states (light/dark + motion)**  
Scope: `src/components/ui/button*` + consumer CTA/filter/pill  
Evidenza: rischio incoerenze di contrasto durante stati interattivi e motion.  
Azione: completare matrice stati unica e verifica contrasto AA su `default/hover/active/focus/disabled`.

- [ ] **Pulizia typography locale residua**  
Scope: componenti frontend con `font-size`/`font-family` hardcoded  
Evidenza: restano override tipografici non allineati alla scala globale.  
Azione: migrare progressivamente su layer tipografico condiviso e token `clamp()` mobile-first.

## Media Governance (operativo)
- `media/`: storage upload runtime di Payload (configurato come `staticDir` in `src/collections/Media.ts`).
- `public/media/`: fallback statici legacy ancora referenziati da path hardcoded `/media/...`.
- Decisione corrente: mantenere `public/media` fino a migrazione completa dei fallback su asset gestiti da Payload.
- Regola cleanup: non eliminare file in `public/media` se referenziati da fallback attivi.

## Storico completato
Le voci completate e i batch storici sono stati spostati in:
- `Docs/archive/style-design-audit-completed.legacy.md`
## Typography Refactor Site-Wide (Checklist monitor)

Obiettivo: uniformare la tipografia su tutto il progetto con pipeline Tailwind + token condivisi, rimuovendo custom CSS locali e usando `clamp()` in logica mobile-first.

- [x] **Fase 0 - Baseline e inventario**
Scope: intero `src/` frontend (route + components + module css)  
Evidenza: presenza di molti `font-size`, `font-family`, `letter-spacing`, `line-height` custom per componente.  
Azione:
- creare baseline visuale su pagine chiave (home, shop, services, detail, checkout, account)
- censire override tipografici nel codebase
- classificare per priorita (`critico`, `legacy`, `eccezione accettata`)
Stato: completata il 2026-02-17 con inventario in `Docs/typography-baseline-inventory.md` (617 occorrenze censite, classificazione priorita e baseline pagine QA).

- [x] **Fase 1 - Definizione scala tipografica unica**
Scope: `src/styles/tokens.css`, `src/styles/typography.css`, `tailwind.config.*`  
Evidenza: assenza di mapping globale coerente per heading/body tramite tailwind base.  
Azione:
- definire livelli (`display`, `h1`, `h2`, `h3`, `body-lg`, `body`, `small`, `caption`)
- fissare per livello: `font-family`, `font-weight`, `line-height`, `letter-spacing`
- definire `clamp(min, vw, max)` mobile-first per ogni livello
Stato: completata il 2026-02-17. Scala definita in `src/styles/typography.css` (token semantici) e documentata in `Docs/typography-scale.md`.

- [x] **Fase 2 - Integrazione Tailwind base + utilities**
Scope: `src/styles/typography.css`, `tailwind.config.*`  
Evidenza: heading HTML non governati da una policy tipografica centralizzata.  
Azione:
- aggiungere regole in `@layer base` per `h1..h6`, `p`, `small`, `label`
- estendere tailwind con classi semantiche (`text-h1`, `text-h2`, ecc.) e font (`font-display`, `font-body`)
- verificare che i tag senza classi custom ereditino correttamente
Stato: completata il 2026-02-17. Applicate regole `@layer base` in `src/styles/typography.css` e utility semantiche in `tailwind.config.ts`; documentazione aggiornata in `Docs/typography-scale.md`.

- [x] **Fase 3 - Migrazione componenti core (mobile-first)**
Scope: hero, sections, carousel, switcher, card, form principali  
Evidenza: componenti ad alta visibilita con sizing tipografico locale non allineato.  
Azione:
- sostituire custom typography con token/shared utilities
- mantenere solo eccezioni deliberate e documentate
- usare base mobile + override `min-width` solo se necessario
Stato: completata il 2026-02-17 (batch core) su `StoryHero`, `ValuesSection`, `UIC_Carousel`, `UIC_CarouselCard`, `ProgramsSplitSection` con migrazione a token `--type-*` e rimozione font locali (`Inter`) nei punti principali.

- [ ] **Fase 4 - Rimozione custom CSS e duplicati**
Scope: module css in `src/components/**` e `src/app/**`  
Evidenza: duplicazione di regole tipografiche e override locali confliggenti.  
Azione:
- eliminare `font-size`/`font-family` locali ridondanti
- consolidare stili ripetuti in scala globale
- preservare solo casi speciali giustificati
Stato: in corso (batch 1+2+3+4+5+6 completati il 2026-02-17) su `ServiceRoutineBuilderSplitSection`, `ServicesTreatmentReveal`, `ProtocolSplit`, `StoryValuesSection`, `ServicesProtocol`, `StoryTeamSection`, `ListinoTradizionale` + pagine `src/app/(frontend)/[locale]/services/[category]/page.tsx`, `src/app/(frontend)/[locale]/journal/page.tsx`, `src/app/(frontend)/[locale]/layout.tsx`, `src/app/(checkout)/[locale]/checkout/checkout.module.css` e convergenza tipografica estesa in `src/app/(frontend)/[locale]/services/service/[slug]/service-detail.module.css` con migrazione a token `--type-*` e rimozione font locali hardcoded.

- [ ] **Fase 5 - QA e regressioni**
Scope: verifica visuale e tecnica finale  
Evidenza: rischio regressioni cross-page / dark-light / responsive.  
Azione:
- QA visuale su breakpoint 320 / 375 / 768 / 1024 / 1440
- QA light/dark e gerarchia heading
- eseguire `tsc --noEmit` e build
Stato: in corso (tecnico completato il 2026-02-17): `pnpm build` OK e `tsc --noEmit` OK. Restano da completare i check visuali manuali cross-breakpoint e light/dark.

- [ ] **Fase 6 - Governance futura**
Scope: processo e controllo continuo  
Evidenza: rischio reintroduzione custom typography fuori standard.  
Azione:
- definire regola: niente `font-size` hardcoded fuori token salvo eccezioni documentate
- aggiornare doc con matrice tipografica finale
- aggiungere checklist PR per controllo typography

### Criteri di completamento

- [ ] heading/body principali allineati alla scala tipografica unica
- [ ] `clamp()` applicato ai livelli previsti in approccio mobile-first
- [ ] rimozione dei custom typography ridondanti nelle aree core
- [x] nessuna regressione tecnica (`tsc --noEmit` + build ok)

## Estensione piano: leggibilita e motion safety (solo pulsanti)

Obiettivo: garantire visibilita costante del testo nei pulsanti (light/dark) e comportamento coerente durante effetti Framer Motion.

- [ ] **Contrasto testo/sfondo pulsanti (light + dark)**
Scope: `button`, `button-link`, CTA, filter pill, card button, hero button  
Evidenza: rischio combinazioni `testo chiaro su sfondo chiaro` o `testo scuro su sfondo scuro`.  
Azione:
- vincolare colori button a token tema (`--text-primary`, `--text-inverse`, `--paper`, `--stroke`)
- eliminare colori hardcoded nei pulsanti
- mantenere coerenza tra `main` / `card` / `hero` e inversione dark

- [ ] **Stati interattivi button**
Scope: `default`, `hover`, `active`, `focus-visible`, `disabled`  
Evidenza: stati non omogenei tra light/dark e tra componenti.  
Azione:
- definire matrice unica stati per i pulsanti
- garantire contrasto WCAG AA in ogni stato
- verificare outline focus sempre visibile

- [ ] **Framer Motion sui button**
Scope: effetti di inversione colore e overlay motion nei pulsanti  
Evidenza: durante animazione il testo puo perdere contrasto.  
Azione:
- validare contrasto in stati intermedi (non solo inizio/fine)
- impedire opacita/transizioni che rendono il label illeggibile
- mantenere parita visuale tra light e dark durante l'effetto

- [ ] **QA finale pulsanti**
Scope: tutte le pagine con CTA e controlli interattivi  
Evidenza: rischio regressioni cross-page.  
Azione:
- test visuale su light/dark e breakpoint principali
- test con e senza motion (`prefers-reduced-motion`)
- blocco merge se contrasto button insufficiente
