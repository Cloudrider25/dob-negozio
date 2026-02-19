# Style & Design Audit (Active)

Ultimo aggiornamento: 2026-02-19  
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
- 2026-02-18 | Blocco CSS-008 (`AuthSplitLayout` mobile UX + branding + CMS control)
  - Scope: revisione completa layout auth (signin/signup/forgot/reset/verify) su mobile e desktop, con gestione contenuti visual da Payload.
  - Decisione: nascondere visual media su mobile, mantenere colonna form full-height e centrata; introdurre brand block coerente con header; rendere configurabili da admin testo+immagine visual auth.
  - Implementazione:
  - `src/components/account/AuthSplitLayout.module.css`: `.visual` nascosto sotto `1024px`; `.shell` mobile a full-height utile; `.formCol` centrata verticalmente; brand block centrato con spacing responsive; `page/shell` resi theme-aware (`--page-bg`, `--bg`); swap logo dark/light coerente col tema.
  - `src/components/account/AuthSplitLayout.tsx`: aggiunto brand (logo + wordmark) in testa alla form column; `AuthSplitLayout` convertito ad async server component con fetch `site-settings`.
  - `src/globals/SiteSettings.ts`: nuova tab `Auth` con gruppo `authLayout` e campi admin `visualOverlay` (localized), `visualImage` (upload media), `visualImageAlt` (localized).
  - Tipi e runtime: `locale` tipizzato con `Locale` in `AuthSplitLayout`.
  - Verifica: `pnpm -s generate:types` ok; `pnpm -s generate:importmap` ok; `pnpm -s tsc --noEmit` ok.
- 2026-02-18 | Blocco CSS-009 (`UIC_CarouselCard` cleanup strutturale + token colors)
  - Scope: review del componente card carousel shared (`src/components/carousel/UIC_CarouselCard.*`).
  - Decisione: mantenere struttura/layout invariati, rimuovere proprietà CSS legacy ridondanti e migrare hardcoded colore a token.
  - Implementazione:
  - `src/components/carousel/UIC_CarouselCard.module.css`: semplificato blocco `.card` (rimozione proprietà non necessarie da computed style); `media` background migrato da `#fff` a `var(--paper)`; badge text/background migrati a token (`var(--pearl-1)` + `color-mix` token-based); fix formattazione `object-position`.
  - Verifica: `pnpm -s tsc --noEmit` ok; ricerca hardcoded `#...` nel modulo non restituisce match.
- 2026-02-18 | Blocco CSS-010 (`UIC_Carousel` token-only + robustness)
  - Scope: review del container carousel shared (`src/components/carousel/UIC_Carousel.*`).
  - Decisione: allineare il CSS alla policy token-only (no `color-mix`), mantenendo comportamento invariato; rafforzare il markup dei controlli.
  - Implementazione:
  - `src/components/carousel/UIC_Carousel.module.css`: rimossi `color-mix` dai controlli nav (`border/background`) sostituiti con token diretti (`--stroke`, `--paper`, `--bg`).
  - `src/components/carousel/UIC_Carousel.tsx`: aggiunto `type=\"button\"` ai pulsanti prev/next; key slide resa più robusta (`href/title + index`) per ridurre collisioni su titoli duplicati.
  - Verifica: `pnpm -s tsc --noEmit` ok; ricerca `rg` conferma assenza `color-mix` e hardcoded `#...` nei file del blocco.
- 2026-02-18 | Blocco CSS-011 (`CartDrawer` token migration + visual parity)
  - Scope: review di `src/components/cart/CartDrawer.module.css`.
  - Decisione: migrare totalmente i colori hardcoded (`#...`, `rgba(...)`) ai token globali esistenti, preservando layout e comportamento UI.
  - Implementazione:
  - sostituiti colori testo/sfondo/bordi con token (`--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`, `--stroke`, `--paper`, `--bg`);
  - overlay/backdrop convertito a token (`background: var(--bg)`) con opacità gestita nello stato `open`;
  - bottoni principali (`routineButton`, `checkoutButton`) allineati a palette token-based;
  - shadow pannello allineata a token (`--shadow-soft`).
  - Verifica: `pnpm -s tsc --noEmit` ok; `rg` conferma assenza di `#...` e `rgba(...)` nel modulo.
- 2026-02-18 | Blocco CSS-012 (`CartDrawer` thumbnail fallback routine recommendations)
  - Scope: fix visuale `CartDrawer_routine__...` quando il prodotto consigliato non espone `coverImage` ma solo gallery `images`.
  - Decisione: applicare lo stesso fallback media già adottato in altri flussi cart/checkout.
  - Implementazione:
  - `src/app/api/shop/recommendations/route.ts`: aggiunto `images` nel `select`; `coverImage` response ora risolve `doc.coverImage` con fallback a `doc.images[0]`.
  - Verifica: `pnpm -s tsc --noEmit` ok.
- 2026-02-18 | Blocco CSS-013 (`CartDrawer` refactor mobile-first)
  - Scope: inversione breakpoint strategy del modulo `src/components/cart/CartDrawer.module.css`.
  - Decisione: base CSS mobile-first e override desktop con `@media (min-width: 701px)`.
  - Implementazione:
  - base mobile: drawer `100vw`, item grid `120px 1fr`, thumb `120x120`, price full-row;
  - desktop override: drawer `min(50vw)`, item grid `144px 1fr auto`, thumb `144x144`, price inline.
  - Verifica: `pnpm -s tsc --noEmit` ok.
- 2026-02-18 | Blocco CSS-014 (`checkout.module.css` cleanup + token migration)
  - Scope: review e pulizia di `src/components/checkout/CheckoutClient.module.css`.
  - Decisione: rimuovere classi non usate/no-op, consolidare duplicati e migrare i colori hardcoded esclusivamente su token già presenti in `src/styles`.
  - Implementazione:
  - unificata la doppia definizione di `.form` in un unico blocco;
  - rimosse classi inutilizzate: `.checkboxRow`, `.paymentMethodCard`, `.paymentBadges`, `.paymentFields`, `.billingNote`, `.cookieLink`, `.checkoutButton` e relativo selector discendente;
  - sostituiti `#...` e `rgba(...)` con token globali (`--paper`, `--stroke`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`, `--bg`, `--panel`, `--sand`, `--ui-accent`);
  - aggiornato anche il `background` mobile della `.page` da hardcoded a token.
  - Verifica: `rg` su `checkout.module.css` conferma assenza di `#...`, `rgba(...)`, `color-mix(...)` e assenza delle classi rimosse.
- 2026-02-18 | Blocco CSS-015 (`CheckoutClient` UX checkout + theme/layout + typography)
  - Scope: review completa di `src/components/checkout/CheckoutClient.tsx`, `src/components/checkout/CheckoutClient.module.css`, `src/styles/globals.css`, `src/app/api/shop/checkout/route.ts`.
  - Decisione: consolidare checkout theme-aware desktop/mobile, integrare Express Checkout Stripe reale, allineare CTA ai componenti shared e ridurre gerarchia tipografica.
  - Implementazione:
  - Express checkout: rimozione bottoni custom e integrazione `ExpressCheckoutElement` con fallback/error state (`Riprova`), prefetch sessione in step informazioni e blocco loop retry automatici;
  - backend checkout: policy aggiornata per consentire creazione sessione `payment_element` anche con form shipping incompleto (supporto wallet data), mantenendo validazioni standard per il flusso non-express;
  - theme-aware desktop: gradiente checkout in `src/styles/globals.css` migrato da `#fff` a `var(--paper)` per coerenza dark/light;
  - summary checkout: resa desktop-only (non renderizzata su mobile in TSX + regole CSS coerenti);
  - CTA shared: `Vai alla spedizione`, `Continua al pagamento`, `Paga ora` migrati a `Button` shared (`kind="main"`);
  - typography pass: ridotti livelli heading nel checkout (`shippingMethodTitle`, `paymentTitle`, `billingTitle`, `totalRow`, `summaryRecoTitle` a `typo-h3`).
  - Verifica: `pnpm -s tsc --noEmit` ok dopo ciascun batch; regressioni `POST /api/shop/checkout` in loop risolte con guard frontend.
- 2026-02-18 | Blocco CSS-016 (`ConsultationForm` token-only pass + cleanup)
  - Scope: review di `src/components/forms/ConsultationForm.module.css`.
  - Decisione: rimuovere `color-mix`/hardcoded colore, usare solo token esistenti in `src/styles` e ripulire classi legacy non usate.
  - Implementazione:
  - `heroBadge` e `contactIconWrap` migrati da `color-mix(...)` a token (`--sand`, `--stroke`);
  - `contactIconWhatsapp` migrata da hardcoded `#22c55e` a `--tech-cyan`;
  - `submitSuccess`/`submitError` migrati da hardcoded (`#0f766e`, `#b91c1c`) a token (`--tech-cyan`, `--neon-red`);
  - rimossa classe `.contactLink` (non usata) e relativo override responsive.
  - Verifica: `rg` su `ConsultationForm.module.css` conferma assenza di `#...`, `rgba(...)`, `color-mix(...)`; `pnpm -s tsc --noEmit` ok.
- 2026-02-18 | Blocco CSS-017 (`Forms + Shop UX` refinement pass)
  - Scope: `src/components/forms/ConsultationForm.*`, `src/components/sections/SectionSwitcher.*`, `src/components/heroes/Hero.*`, `src/app/(frontend)/[locale]/shop/page.tsx`.
  - Decisione: ridurre complessità CSS locale, migliorare leggibilità mobile e semplificare CTA/hero.
  - Implementazione:
  - `ConsultationForm`: submit migrato a `Button` shared (`kind="main"`), rimozione blocchi CSS custom submit (`submitButton`, `submitContent`, `submitIcon`, `submitGlow`); rimosso hero badge (`heroBadge/heroIcon`) lato TSX+CSS; migliorato contrasto icone contatto in light mode; section titles da `h3` a `h4`; aggiunto margine inferiore a `heroSubtitle`.
  - `SectionSwitcher`: mobile su singola riga con scroll orizzontale, pills width fit-content (`width: max-content`, `nowrap`), comportamento desktop invariato (wrap/center).
  - `Hero` shop: rimossi i CTA dall’hero di `shop/page.tsx`; in `Hero` mantenuto solo tuning size CTA mobile per altri consumer.
  - Verifica: `pnpm -s tsc --noEmit` ok; riduzione `ConsultationForm.module.css` da 299 a 254 linee.
- 2026-02-18 | Blocco CSS-018 (`Heroes` pass 1: StoryHero token migration)
  - Scope: review iniziale `src/components/heroes/*` con fix applicato su `src/components/heroes/StoryHero.module.css`.
  - Decisione: migrare subito i hardcoded “sicuri” su token globali senza alterare il layout; lasciare `Hero.module.css` a un batch successivo dedicato (ha molte scelte visual creative da preservare).
  - Implementazione:
  - `.card` in `StoryHero.module.css`: `background`, `border`, `box-shadow`, `text color` migrati a token (`--paper`, `--stroke`, `--shadow-soft`, `--text-secondary`) rimuovendo hardcoded `rgba/#...`.
  - Verifica: `pnpm -s tsc --noEmit` ok.
- 2026-02-18 | Blocco CSS-019 (`Heroes` pass 2: token-only completion)
  - Scope: `src/components/heroes/Hero.module.css`, `src/components/heroes/StoryHeroNote.module.css`.
  - Decisione: completare migrazione token-only rimuovendo `#...`, `rgba(...)`, `color-mix(...)` mantenendo struttura/animazioni.
  - Implementazione:
  - `Hero.module.css`:
  - `hero::before` migrato a `--pearl-highlight`;
  - `style1 .content` e override dark migrati a token (`--paper`/`--panel`, `--stroke`, `--shadow-soft`);
  - overlay gradient semplificato a token (`--obsidian`, `--panel`) con opacità dedicata;
  - `text-shadow` del titolo migrato a `--shadow-soft`;
  - cleanup formattazione (`object-position`).
  - `StoryHeroNote.module.css`:
  - `noteCard` migrata a token (`--paper`, `--stroke`, `--shadow-soft`);
  - `signatureName` color migrato a `--text-primary`;
  - rimosso `color-mix` residuo e cleanup formattazione.
  - Verifica: `rg` su `src/components/heroes/**/*.css` conferma assenza di `#...`, `rgba(...)`, `color-mix(...)`; `pnpm -s tsc --noEmit` ok.
- 2026-02-18 | Blocco CSS-020 (`Layout/Header` token refinement pass)
  - Scope: review `src/components/layout/Header.module.css`.
  - Decisione: applicare migrazione token sui residui hardcoded “safe” senza alterare UX del menu/header.
  - Implementazione:
  - `menuOverlay` desktop shadow migrata da `color-mix(in srgb, #000 ...)` a `--shadow-lux`;
  - dark theme `header/topBar` background migrati da `#1b1b1b` a `--graphite`;
  - dark theme top bar text migrato da `rgba(255,255,255,0.72)` a `--text-secondary`;
  - cleanup formattazione (`padding` header).
  - Verifica: `pnpm -s tsc --noEmit` ok.
- 2026-02-19 | Blocco CSS-021 (`Theme` auto mode + footer relocation)
  - Scope: `src/components/theme/ThemeToggle.*`, `src/components/theme/ThemeHydrator.tsx`, `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/[locale]/layout.tsx`, `src/components/layout/Header.tsx`.
  - Decisione: rendere il tema automatico rispetto a `prefers-color-scheme`, mantenendo override manuale opzionale nel toggle; spostare il toggle dall’header al footer.
  - Implementazione:
  - `ThemeToggle` aggiornato a 3 stati (`auto | light | dark`) con label dinamica e sync con cambio tema OS/browser;
  - `ThemeHydrator` aggiornato per supportare `auto` e applicazione coerente di `data-theme` su `html/body`;
  - `ThemeHydrator` montato anche nel frontend root layout;
  - `ThemeToggle` rimosso da header e aggiunto nel footer;
  - ridotto font del toggle (`ThemeToggle.module.css`).
  - Verifica: `pnpm exec tsc --noEmit` ok.
- 2026-02-19 | Blocco CSS-022 (`Locale/Country/Currency` auto-detection + modal)
  - Scope: `src/lib/user-preferences.ts`, `src/components/layout/PreferencesConfirmModal.*`, `src/app/(frontend)/[locale]/layout.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Header.module.css`, `src/app/(checkout)/[locale]/layout.tsx`.
  - Decisione: rimuovere selector lingua dall’header; introdurre rilevamento automatico preferenze utente (lingua/paese/valuta) con conferma esplicita tramite popup.
  - Implementazione:
  - nuovo helper centralizzato preferenze con regole: `ITA=IT/€`, `RU=RU/€`, `EN=EN/€`, altre lingue -> `EN/€`;
  - rimozione completa del language selector header (desktop + overlay menu);
  - footer `Country/Region` reso dinamico da preferenze salvate/rilevate;
  - nuovo modal conferma con copy localizzata (`it/en/ru`) e CTA `CONTINUE WITH EUR`;
  - estensione del medesimo flusso anche ai layout checkout locale.
  - Verifica: `pnpm exec tsc --noEmit` ok.
- 2026-02-19 | Blocco CSS-023 (`Footer control` reopen + edit flow)
  - Scope: `src/components/layout/PreferencesFooterControl.tsx`, `src/components/layout/PreferencesConfirmModal.*`, `src/app/(frontend)/[locale]/layout.tsx`.
  - Decisione: il selettore footer deve essere interattivo e riaprire il popup con possibilità di modifica reale.
  - Implementazione:
  - introdotto trigger client nel footer (`PreferencesFooterControl`) con apertura modal on click;
  - `PreferencesConfirmModal` reso controllabile (`open/onOpenChange`) e arricchito con language picker (`IT/EN/RU`);
  - salvataggio preferenze aggiornate su cookie/localStorage + redirect locale coerente dopo conferma.
  - Verifica: `pnpm exec tsc --noEmit` ok; verifica tecnica completa: `pnpm run -s lint` (solo warning preesistenti), `pnpm run -s build` ok.
- 2026-02-19 | Blocco CSS-024 (`Header desktop` nav actions + Search trigger)
  - Scope: `src/components/layout/Header.tsx`, `src/components/layout/Header.module.css`.
  - Decisione: completare la sezione desktop eliminando CTA e icone account/cart in favore di voci testuali nav; aggiungere trigger `Search` dedicato.
  - Implementazione:
  - rimossa CTA `Prenota ora` dall’header;
  - in desktop sostituiti bottoni icona account/cart con voci testuali (`Search`, `Account|Sign in`, `Cart`);
  - mantenute icone account/cart nel menu overlay mobile;
  - aggiunte classi nav dedicate (`rightNav`, `rightNavLink`).
  - Verifica: `pnpm exec tsc --noEmit` ok.
- 2026-02-19 | Blocco CSS-025 (`Search Drawer` shared shell + live multi-group results)
  - Scope: `src/components/ui/SideDrawer.*`, `src/components/cart/CartDrawer.tsx`, `src/components/layout/SearchDrawer*`, `src/lib/searchDrawer.ts`, `src/app/api/search/drawer/route.ts`, `src/app/api/search/live/route.ts`, `src/components/shop/ShopSectionSwitcher.tsx`, `src/components/services/ListinoTradizionale.tsx`, `src/app/(frontend)/[locale]/services/page.tsx`, `src/app/(frontend)/[locale]/layout.tsx`.
  - Decisione: riusare la stessa infrastruttura drawer per cart e search; implementare ricerca live (>=2 caratteri) con risultati eterogenei/tag e redirect specifici per gruppo.
  - Implementazione:
  - estratto shell shared `SideDrawer` e migrato `CartDrawer` al nuovo wrapper;
  - creato `SearchDrawer` con trigger/lazy loader/event bus dedicati;
  - endpoint `search/drawer` per suggested + recommendation block;
  - endpoint `search/live` con gruppi: `service-detail`, `service-list`, `product-detail`, `product-list`, `brand-list`, `line-list`;
  - aggiunti tag multipli per risultato (es. `Servizi`, `Pacchetto`, `Brand`, `Prodotti`, `N risultati`);
  - redirect differenziati:
  - service detail -> `/${locale}/services/service/[slug]`
  - all services filtered -> `/${locale}/services?view=listino&q=...`
  - product detail -> `/${locale}/shop/[slug]`
  - product/brand/line list -> `/${locale}/shop?section=shop-all&q=...`
  - supporto filtro `q` lato destinazione:
  - `ShopSectionSwitcher` filtra per titolo/slug/brand/linea
  - `ListinoTradizionale` filtra per titolo/descrizione/slug/trattamenti/aree
  - pagina services con `q` apre direttamente vista `listino`.
  - Verifica: `pnpm run -s build` ok; `pnpm exec tsc --noEmit` ok.
- 2026-02-19 | Blocco CSS-026 (`Header mobile menu` complete review)
  - Scope: `src/components/layout/Header.tsx`, `src/components/layout/Header.module.css`, `src/components/theme/ThemeToggle.*`, `src/app/(frontend)/[locale]/layout.tsx`, `src/app/(frontend)/[locale]/contact/page.tsx`, `src/app/sitemap.ts`, `src/app/(frontend)/[locale]/location/page.tsx`.
  - Decisione: consolidare il menu mobile come pattern primario (mobile-first), con struttura contenuti coerente al sito, CTA utili e pulizia totale dei riferimenti legacy `location`.
  - Implementazione:
  - menu overlay mobile-first stabilizzato sotto header (animazione verticale `clip-path`), layering corretto e chiusura a fine animazione;
  - restyling completo interno menu: rimozione titolo “Menu”, sezioni con gerarchia chiara, spacing/divider coerenti e radius inferiore visibile;
  - integrazione preferenze nel menu (`ThemeToggle` + `Country/Region`), con fix contrasto colori su light/dark nel contesto overlay;
  - sezione social/contact rivista: icone brand (`react-icons/si` per WhatsApp/Instagram/Facebook + phone), disposizione full-width su unica riga icone;
  - aggiunti 2 card highlight stile `CartDrawer_routine` (ultimo prodotto + ultimo servizio) con badge `New` e link dinamici;
  - aggiunti blocco indirizzo e CTA full-width `Get directions` verso Google Maps (Via Giovanni Rasori 9, 20145 Milano, Italia);
  - riordinato nav menu mobile (`Account`, `Services`, `Shop`, poi resto) e rinomina label “Our Story” -> “About” (path invariato `/our-story`);
  - rimosso link `location` dal nav e distrutta route `src/app/(frontend)/[locale]/location/page.tsx`;
  - pulizia riferimenti `location` in sitemap/footer/contact per evitare link rotti.
  - Verifica: `pnpm -s tsc --noEmit` ok sui batch finali; comportamento menu validato nelle varianti tema/light-dark.
- 2026-02-19 | Blocco CSS-027 (`ProgramsSplitSection` cleanup + token pass)
  - Scope: `src/components/sections/ProgramsSplitSection.module.css`, `src/components/sections/ProgramsSplitSection.tsx`.
  - Decisione: rimuovere regole no-op/legacy, mantenere `object-fit` inline sul consumer `Image`, migrare residui hardcoded dei dots su token globali.
  - Implementazione:
  - rimossa classe ridondante `.counterLarge` e relativo uso nel TSX (resta `.counter`);
  - rimossa regola discendente `.stepMedia img { object-fit: cover; }` e applicato `object-cover` inline al secondo `Image` in `ProgramsSplitSection.tsx`;
  - dots migrati da `rgba(...)` a token (`--pearl-2`/`--pearl-1` + ring `--obsidian`);
  - cleanup formattazione/righe vuote nel module.
  - Verifica: `pnpm -s tsc --noEmit` ok.
- 2026-02-19 | Blocco CSS-028 (`ProgramsSplitSection` mobile layout refactor)
  - Scope: `src/components/sections/ProgramsSplitSection.tsx`, `src/components/sections/ProgramsSplitSection.module.css`, `src/styles/globals.css`.
  - Decisione: uniformare completamente la struttura mobile tra step 0 e step successivi (stesse classi/slot), riducendo al minimo il layout shift e mantenendo CTA sempre ancorata in basso.
  - Implementazione:
  - strategia split mobile global: `ui-split-section` con `gap: 0` e `ui-split-column` con `min-height: 0` sotto `1024px`;
  - `ProgramsSplitSection` refactor a markup unico per tutti gli step (niente branch strutturali separati step0/stepN): stessa sequenza `titleRow -> stepMediaRow -> stepFooter`;
  - step 0 ora usa gli stessi slot/classi degli altri step e cambia solo i dati (`badge: "descrizione"`, testo centrale nel media slot);
  - `stepSubtitle` nascosto su mobile; testo descrittivo dello step 0 spostato nello slot centrale (`stepMediaText`) con allineamento sinistro;
  - media step mobile ridimensionata e centrata tra frecce; navigazione mobile passata a `display:flex; align-items:center;`;
  - frecce allineate verso i bordi esterni con colonna/slot centrale allargata;
  - CTA resa coerente tra step (stessa classe `programCta`, stessa larghezza in mobile) e ancorata in basso con `margin-top: auto` sul footer;
  - altezza pannello destro mobile stabilizzata (`min-height: 380px`).
  - Verifica: `pnpm -s tsc --noEmit` ok dopo i batch di refactor.
- 2026-02-19 | Blocco CSS-029 (`ProgramsSplitSection` desktop parity + final cleanup)
  - Scope: `src/components/sections/ProgramsSplitSection.tsx`, `src/components/sections/ProgramsSplitSection.module.css`.
  - Decisione: completare la parita` visiva/strutturale anche in desktop tra step 0 e step successivi, mantenendo stesso schema classi e variando solo i dati.
  - Implementazione:
  - counter desktop unificato (`typo-h2`) tra step 0 e altri;
  - step 0 desktop: descrizione spostata nello slot media (classe dedicata `stepMediaTextDesktop`) invece che nel footer;
  - `stepBadge` ridimensionato da `h2` a `h3` (`SectionTitle size="h3"`);
  - subtitle legacy rimossa completamente dal render (`stepSubtitle`) e dal CSS;
  - `stepInfo/stepTitle` riallineati sotto area media con spacing superiore coerente;
  - pulizia finale variabili/classi non usate nel TSX (rimossa variabile `stepSubtitle`).
  - Verifica: `pnpm -s tsc --noEmit` ok.
- 2026-02-19 | Blocco CSS-030 (`Program detail [slug]` redesign + CTA + mobile-first + i18n)
  - Scope: `src/app/(frontend)/[locale]/programs/[slug]/page.tsx`, `src/app/(frontend)/[locale]/programs/[slug]/program-detail.module.css`.
  - Decisione: sostituire la resa monolitica tipo home con una pagina dettaglio a split multipli per step, alternanza media/info desktop e ordine media-first su mobile, usando componenti shared per i CTA.
  - Implementazione:
  - pagina ridisegnata con `SplitSection` per ogni step (`media left/right` alternato desktop, sempre `media -> info` su mobile);
  - hero prezzo aggiornato con doppio livello: totale prezzi step barrato + prezzo programma come acconto;
  - CTA hero `Prenota {programma}` migrata a `ButtonLink` shared;
  - CTA step: principale con prezzo barrato + “incluso nel prezzo” e CTA secondaria `Dettagli` (`ButtonLink` shared) con link dinamico a service detail o shop product;
  - responsive CTA/azioni rifinito tra desktop e mobile (`fit-content` / full-width dove richiesto nei vari passaggi);
  - CSS del file convertito a approccio mobile-first (`base mobile`, desktop in `@media (min-width: 1025px)`);
  - pass finale testi hardcoded nel TSX sostituiti con copy locale-aware (`it/en/ru`) per label hero/step/cta/alt.
  - Verifica: `pnpm -s tsc --noEmit` ok sui batch finali.
- 2026-02-19 | Blocco CSS-031 (`ProtocolSplit` token-only cleanup + image fit inline)
  - Scope: `src/components/sections/ProtocolSplit.tsx`, `src/components/sections/ProtocolSplit.module.css`.
  - Decisione: allineare il blocco alla policy token-only (niente `color-mix`/hardcoded colore) e mantenere `object-fit` direttamente sul consumer `Image`.
  - Implementazione:
  - `ProtocolSplit.module.css`: border `panel/media` migrati da `color-mix(...)` a `var(--stroke)`;
  - `ProtocolSplit.module.css`: background `media` migrato da hardcoded `#e9e6df` a `var(--paper)`;
  - `ProtocolSplit.module.css`: rimossa regola discendente `.media img { object-fit: cover; }`;
  - `ProtocolSplit.tsx`: aggiunto `className="object-cover"` all’`Image` del media slider.
  - Verifica: `pnpm -s tsc --noEmit` ok.
