# DOB Milano - Master Navigator Checklist

Ultimo aggiornamento: 2026-02-15  
Owner: Team DOB Milano

## Stato Globale

- [ ] `Ready for QA` Tutte le aree principali validate in ambiente dev
- [ ] `Ready for Production` Go-live checklist completata

## Milestones Globali

### M1 - User Account

- [x] Dominio customer implementato e validato
- [x] Auth journey (`signin/signup/forgot/reset/verify`) funzionante
- [x] Area account (`overview/orders/addresses`) operativa
- [x] Hardening sicurezza account completato
- [x] Evidenza: documento aggiornato in `Docs/user-account.md`

### M2 - Shop Journey

- [x] Checkout Stripe Payment Element integrato
- [x] Webhook + ordini + stock + Sendcloud operativi
- [x] Thumbnail cart/checkout/recommendations normalizzate con regola unica
- [x] PDP buy flow corretto (niente fallback non funzionanti)
- [x] PDP cross-sell su stessa `brandLine` con hide se assente
- [x] Free shipping `>= 70€` implementato end-to-end:
- [x] Drawer: progress bar + messaggio dinamico (sbloccata / importo mancante)
- [x] Checkout quote: shipping a `0` sopra soglia
- [x] Stripe/checkout backend: shipping non addebitato sopra soglia
- [ ] QA smoke completo `shop -> cart -> checkout -> success` su `it/en/ru`
- [ ] Evidenza: aggiornamento stato in `Docs/shop-journey-monitor.md`

### M3 - Services

- [ ] Audit completo servizi (routing, contenuti, UX responsive)
- [ ] Review layout services navigator
- [ ] Verifica regressioni post-refactor (shop/account)
- [ ] Evidenza: nuovo documento checklist dedicato Services

### M4 - Payload Admin

- [x] Riorganizzazione navigation admin
- [x] Allineamento layout pagine admin
- [x] Ordine gruppi nav applicato:
- [x] `Vendite`
- [x] `Servizi`
- [x] `Catalogo Shop`
- [x] `Routine Engine`
- [x] `Contenuti`
- [x] `Sistema`
- [x] Icone gruppo nav aggiunte e uniformate (monocromatiche)
- [x] Split `Site Settings` in sezioni tabbed:
- [x] Generale
- [x] Social
- [x] SMTP
- [x] Stripe
- [x] Sendcloud
- [x] Creazione gruppo `Catalogo Shop` con:
- [x] `Brands`
- [x] `BrandLines`
- [x] `Badges`
- [x] Gruppo `Vendite` validato:
- [x] `orders` con tabbed view (`General`, `Shipping Address`, `Sendcloud`)
- [x] `customer` + `notes` mantenuti in sidebar destra
- [ ] Evidenza: documento admin + checklist migrazioni/typegen

### M5 - Style System / Frontend

- [ ] Piano migrazione mobile-first (ordine pagine + criteri DoD)
- [ ] Standardizzazione stile (strategia ibrida o Tailwind-first da confermare)
- [ ] Riduzione inconsistenze CSS Modules vs token globali
- [ ] Evidenza: piano migrazione stile condiviso

## Navigator Priorità (Prossimo Sprint)

- [ ] P1 Shop: QA finale + rifiniture UI navigator/cart
- [ ] P2 Services: audit + backlog operativo
- [ ] P3 Payload Admin: refactor nav/settings
- [ ] P4 Style System: pilot mobile-first su 1-2 pagine
- [ ] P5 Production Prep: attivare solo quando richiesto

## Decisioni Aperte

- [ ] Decidere prossimo blocco: `Services` oppure `Payload Admin`
- [ ] Confermare strategia stile: `CSS Modules + Tailwind` oppure `Tailwind-first`
- [ ] Confermare modello `Site Settings`: global unica tabbed o globals separate

## Note di Uso

- Questo file è il navigator master cross-area.
- I dettagli tecnici restano nei documenti verticali:
- `Docs/user-account.md`
- `Docs/shop-journey-monitor.md`
