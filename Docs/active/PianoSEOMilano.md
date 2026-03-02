# Piano SEO Milano

Basato su [seo_report.md](./seo_report.md).

## Obiettivo
Massimizzare la visibilita organica locale per query legate a servizi e prodotti estetici a Milano.

## Roadmap Operativa

### 1. Sblocca i Blocker Tecnici (Settimana 1-2)
- [x] Implementare `generateMetadata` su tutte le route `services` e `shop` (`title`, `description`, `canonical`, `alternates.languages`).
- [x] Estendere sitemap con tutte le route dinamiche `services` e `shop` (product detail, listing rilevanti, percorsi localizzati).
- [x] Uniformare policy canonical/hreflang per `slug`, `category`, `area`, `goal`, `treatment`, `product`.
- [x] Verificare e allineare anche frontend layout metadata (oltre a route services + shop e `sitemap.ts`).
- [x] Rendere il SEO gestibile da Payload (campi `seo` in collection + fallback in `generateMetadata`).
- [x] Risolvere `lang` HTML per locale con workaround coerente App Router (sync su layout `[locale]`).

### 2. Architettura Local SEO per Milano (Settimana 2-4)
- [x] Creare/ottimizzare pagine "servizio + Milano" (intent transazionale).
- [ ] Aggiungere varianti semantiche: "centro estetico Milano", "trattamento viso Milano", "epilazione laser Milano", ecc.
- [ ] Rafforzare internal linking: `home -> categorie -> servizio -> prenotazione`.
- [x] Garantire per ogni pagina: `H1` unico, CTA chiara, proof locali.

### 3. Schema Markup e SERP Features (Settimana 3-5)
- [x] Implementare JSON-LD: `LocalBusiness/BeautySalon`, `Service`, `FAQPage`, `BreadcrumbList`.
- [x] Validare schema e correggere warning/errori (validazione tecnica locale: lint + typecheck).
- [ ] Obiettivo: rich results + aumento CTR.

### 4. Contenuto ad Alta Intenzione (Mese 2)
- [ ] Definire piano editoriale cluster: `problema -> trattamento -> risultati -> post-trattamento`.
- [ ] Pubblicare 2-3 contenuti/settimana su query locali e commerciali.
- [ ] Aggiornare pagine servizi con FAQ reali e sezioni comparative.

### 5. Autorita Locale Off-Site (Mese 2-3)
- [ ] Ottimizzare Google Business Profile: categorie, servizi, foto, post, Q&A, offerte.  (analizza https://developers.google.com/my-business/content/overview)
- [ ] Gestire recensioni continue con keyword naturali e risposte strutturate.
- [ ] Consolidare citation coerenti (NAP identico ovunque) e backlink locali tematici.

### 6. Performance e UX Ranking-Critical (Continuo)
- [ ] Migliorare CWV (`LCP`/`INP`/`CLS`), priorita pagine servizi.
- [ ] Ridurre asset pesanti e ottimizzare immagini above-the-fold.
- [ ] Verificare mobile-first su tutto il funnel prenotazione.

### 7. Controllo KPI Settimanale (Dashboard)
- [ ] KPI principali: ranking `Top3/Top1` query target Milano, CTR, sessioni organiche locali, lead da organico, share-of-voice.
- [ ] KPI tecnici: copertura sitemap, errori indexing, CWV pass rate.
- [ ] Regola operativa: se una landing perde ranking per 2 settimane consecutive, aprire sprint correttivo dedicato.
