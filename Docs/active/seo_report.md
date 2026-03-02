# SEO Report (Working File)

Ultimo aggiornamento: 2026-03-02
Scope: `src/frontend/page-domains/services`
Owner: Team DOB Milano

## Decisione
- Esito: `NO-GO`
- Motivo: SEO gates bloccanti non soddisfatti su metadata/canonical/hreflang e sitemap coverage delle route services dinamiche.

## Evidenze Dirette (code-level)
1. Route services in `src/app/(frontend)/[locale]/services/**/page.tsx` esportano solo il page component, senza `generateMetadata` dedicata.
2. In `src/app/(frontend)`, l'unica metadata dichiarata e' in `src/app/(frontend)/layout.tsx` (title/description globali), quindi riuso non differenziato su template multipli.
3. `src/app/sitemap.ts` include solo path localizzati statici (`/services`) e non include route dinamiche services (`/services/service/[slug]`, `/services/treatment/[slug]`, `/services/goal/[slug]`, `/services/area/[slug]`, `/services/[category]`).

## Inferenze (esplicitate)
1. Canonical e hreflang page-specific non risultano gestiti per le route services dinamiche (da verificare runtime, ma non presenti nel codice route metadata).
2. Alta probabilita' di title/description duplicati tra pagine services per assenza di metadata per-template.

## Findings (con severita)
- S1: Missing metadata strategy per route services (generateMetadata assente sulle route services) -> blocca GO.
- S1: Sitemap coverage incompleta per le route services dinamiche -> blocca GO.
- S2: Canonical/hreflang non esplicitati a livello route services; rischio cluster locale incompleto.
- S2: OpenGraph/Twitter metadata non specializzati per template services.

## SEO Gate Status
- Canonical page-level: `FAIL`
- Hreflang cluster per locale: `FAIL`
- Robots/indexation: `PASS` (robots base presente)
- Sitemap consistency: `FAIL`
- Metadata uniqueness (title/description): `FAIL`
- Structured data validity: `NOT EVALUATED` (nessun blocco diretto rilevato nel dominio)

## SEO Monitor (0-10)
- Technical SEO Integrity: `6`
- Information Architecture: `7`
- Content Discoverability: `6`
- SERP Readiness: `6`

## Azioni immediate (bloccanti)
1. Implementare `generateMetadata` su tutte le route `services/*` con title/description/canonical/alternates per locale.
2. Estendere `src/app/sitemap.ts` per includere URL dinamiche services (slug/categoria/area/goal/treatment) per tutte le locale supportate.
3. Definire policy canonical per pagine filtrate/dinamiche services e uniformare `alternates.languages`.

## Azioni differite (non bloccanti)
1. Aggiungere metadata OG/Twitter specifici per template services.
2. Valutare schema.org mirato (Service/FAQPage dove coerente).

