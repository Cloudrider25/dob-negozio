# Localized SEO URLs

Ultimo aggiornamento: 18 marzo 2026

## Obiettivo

Uniformare gli URL pubblici delle pagine statiche principali con slug SEO localizzati per lingua, mantenendo inalterate le route interne dell'app Next.js.

Approccio adottato:

- route interne stabili, ad esempio `/[locale]/terms`
- URL pubblici localizzati, ad esempio `/it/termini-e-condizioni`
- redirect automatico dal vecchio path interno al path pubblico canonico
- rewrite interno dal path pubblico canonico alla route reale dell'app

## Architettura

Il sistema si appoggia a tre punti principali:

1. mapping alias in [routes.ts](/Users/ale/Progetti/DOBMilano/src/lib/frontend/seo/routes.ts)
2. canonical redirect e internal rewrite in [middleware.ts](/Users/ale/Progetti/DOBMilano/src/middleware.ts)
3. generazione canonical, alternates e sitemap tramite `toPublicSeoPath` e `toInternalSeoPath`

Helper introdotta:

- `buildLocalizedSeoHref(locale, path)`

Scopo:

- costruire link interni canonici già localizzati
- evitare redirect non necessari nella navigazione interna

## Mapping Attuale

### Italiano

- `/shop` -> `/negozio`
- `/services` -> `/servizi`
- `/programs` -> `/programmi`
- `/our-story` -> `/chi-siamo`
- `/dob-protocol` -> `/protocollo-dob`
- `/journal` -> `/editoriale`
- `/contact` -> `/contatti`
- `/privacy` -> `/informativa-privacy`
- `/cookie-policy` -> `/informativa-cookie`
- `/terms` -> `/termini-e-condizioni`
- `/shipping` -> `/spedizioni`
- `/refund` -> `/resi-e-rimborsi`
- `/cart` -> `/carrello`

Alias già esistenti o estesi anche sui servizi:

- `/services/service/:slug` -> `/servizi/servizio/:slug`
- `/services/treatment/:slug` -> `/servizi/trattamento/:slug`
- `/services/goal/:slug` -> `/servizi/obiettivo/:slug`
- `/services/area/:slug` -> `/servizi/area/:slug`

### Inglese

- `/shop` -> `/shop`
- `/services` -> `/services`
- `/programs` -> `/programs`
- `/our-story` -> `/our-story`
- `/dob-protocol` -> `/dob-protocol`
- `/journal` -> `/journal`
- `/contact` -> `/contact`
- `/privacy` -> `/privacy-policy`
- `/cookie-policy` -> `/cookie-policy`
- `/terms` -> `/terms-and-conditions`
- `/shipping` -> `/shipping-policy`
- `/refund` -> `/refund-policy`
- `/cart` -> `/cart`

### Russo

- `/shop` -> `/magazin`
- `/services` -> `/uslugi`
- `/programs` -> `/programmy`
- `/our-story` -> `/o-nas`
- `/dob-protocol` -> `/protokol-dob`
- `/journal` -> `/zhurnal`
- `/contact` -> `/kontakty`
- `/privacy` -> `/politika-konfidentsialnosti`
- `/cookie-policy` -> `/politika-cookie`
- `/terms` -> `/usloviya-i-polozheniya`
- `/shipping` -> `/dostavka`
- `/refund` -> `/vozvrat-i-vozmeshchenie`
- `/cart` -> `/korzina`

## Comportamento Runtime

### Redirect canonico

Esempio:

- richiesta a `/it/terms`
- redirect `308` verso `/it/termini-e-condizioni`

Questo avviene in [middleware.ts](/Users/ale/Progetti/DOBMilano/src/middleware.ts) tramite `toPublicSeoPath`.

### Rewrite interno

Esempio:

- richiesta a `/it/termini-e-condizioni`
- rewrite interno verso `/it/terms`

Questo permette di non duplicare file route in `app/`.

## File Coinvolti

### Core SEO

- [routes.ts](/Users/ale/Progetti/DOBMilano/src/lib/frontend/seo/routes.ts)
- [metadata.ts](/Users/ale/Progetti/DOBMilano/src/lib/frontend/seo/metadata.ts)
- [middleware.ts](/Users/ale/Progetti/DOBMilano/src/middleware.ts)
- [sitemap.ts](/Users/ale/Progetti/DOBMilano/src/app/sitemap.ts)
- [route.ts](/Users/ale/Progetti/DOBMilano/src/app/llms.txt/route.ts)

### Navigazione aggiornata ai path canonici

- [HeaderNavigation.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/layout/header/parts/HeaderNavigation.tsx)
- [HeaderMenuOverlay.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/layout/header/parts/HeaderMenuOverlay.tsx)
- [Header.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/layout/header/Header.tsx)
- [Footer.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/layout/footer/Footer.tsx)
- [CookieConsentBanner.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/layout/preferences/CookieConsentBanner.tsx)
- [CookiePreferencesDrawer.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/layout/preferences/CookiePreferencesDrawer.tsx)
- [LocalProofCtaStrip.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/layout/shell/LocalProofCtaStrip.tsx)
- [AccountDashboardSidebar.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/account/dashboard/AccountDashboardSidebar.tsx)
- [CheckoutFooterLinks.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutFooterLinks.tsx)
- [SearchDrawer.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/layout/search/SearchDrawer.tsx)
- [HomePage.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/home/page/HomePage.tsx)
- [OurStoryPage.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/our-story/page/OurStoryPage.tsx)

## Stato Attuale

Completato:

- slug SEO localizzati per le pagine statiche principali
- canonical redirect e internal rewrite
- navigazione condivisa aggiornata ai path canonici
- supporto corretto a sitemap e metadata SEO

Non ancora normalizzato al 100%:

- alcuni link dinamici provenienti da API server/search results
- alcuni URL hardcoded nelle email
- eventuali CTA CMS che salvano manualmente vecchi path interni

Questi casi restano comunque compatibili perché il middleware canonicalizza i path.

## Regola Operativa

Per nuovi link verso pagine statiche localizzate:

- non costruire manualmente `/${locale}/slug`
- usare `buildLocalizedSeoHref(locale, '/internal-path')`

Esempi:

- `buildLocalizedSeoHref(locale, '/terms')`
- `buildLocalizedSeoHref(locale, '/privacy')`
- `buildLocalizedSeoHref(locale, '/shop')`

## Validazione

Verifica eseguita:

- `pnpm typecheck`

## Nota

La route interna resta la fonte di verità applicativa.

Esempio:

- route interna: `/[locale]/terms`
- URL pubblico canonico:
  - `it` -> `/it/termini-e-condizioni`
  - `en` -> `/en/terms-and-conditions`
  - `ru` -> `/ru/usloviya-i-polozheniya`
