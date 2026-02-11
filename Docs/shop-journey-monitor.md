# Shop Journey E2E - Monitor Implementazione

Ultimo aggiornamento: 2026-02-11  
Owner: Team DOB Milano

## Stato globale

- [ ] `Not started` Avvio piano
- [x] `In progress` Implementazione core checkout
- [ ] `Blocked` Bloccanti aperti
- [ ] `Ready for QA` Pronto per test integrati
- [ ] `Ready for Production` Pronto al rilascio

## Milestone

- [x] M1 - Order domain e persistence completati
- [ ] M2 - Checkout API + Stripe integration completati
- [x] M3 - UX checkout/cart coerente e testata
- [ ] M4 - Hardening sicurezza/performance completato

## Checklist Findings (end-to-end)

### F1 - Checkout non conclude ordini (Bloccante)

- [x] Implementare submit reale dal checkout (`create order` / `create payment session`)
- [x] Gestire stati UI: loading, success, errore, retry
- [x] Redirect a pagina conferma ordine
- [x] Salvare ID ordine e stato pagamento
- [ ] Evidenza: test manuale pagamento E2E superato

Stato: `In progress`  
Dipendenze: F2, F3

### F2 - Backend e-commerce assente (Bloccante)

- [x] Creare collection `orders`
- [x] Creare collection `order-items`
- [x] Definire stati ordine (`pending`, `paid`, `failed`, `refunded`, `cancelled`)
- [x] Creare endpoint checkout server-side
- [ ] Creare webhook pagamento con idempotenza
- [ ] Evidenza: ordine persistito + update stato via webhook

Stato: `In progress`  
Dipendenze: nessuna

### F3 - Prezzi/quantità fidati dal client (Bloccante Security/Business)

- [x] Validazione server-side di prezzo/currency/quantità da DB
- [x] Ignorare prezzi inviati dal browser
- [x] Calcolo totale lato server (source of truth)
- [x] Validazione SKU/prodotto attivo prima del pagamento
- [ ] Evidenza: test manomissione carrello non altera importo pagato

Stato: `In progress`  
Dipendenze: F2

### F4 - Stock non applicato nel flusso acquisto (Bloccante Operativo)

- [x] Verifica disponibilità stock in checkout server-side
- [x] Bloccare acquisto se quantità richiesta > stock disponibile
- [ ] Decremento stock atomico al `paid` (webhook)
- [ ] Gestione concorrenza (race condition) con lock/version check
- [ ] Evidenza: test doppio acquisto simultaneo gestito correttamente

Stato: `In progress`  
Dipendenze: F2

### F5 - Journey incoerente cart/checkout

- [x] Implementare pagina `/{locale}/cart` reale (no redirect a shop)
- [x] Allineare CTA `Return to cart` e navigazione checkout
- [x] Sincronizzare drawer/cart page/checkout sugli stessi dati
- [ ] Evidenza: percorso utente lineare `shop -> cart -> checkout -> confirmation`

Stato: `In progress`  
Dipendenze: F1

### F6 - Messaggi prodotto non allineati al go-live

- [x] Aggiornare testi i18n che indicano checkout non disponibile
- [x] Verificare copy IT/EN/RU su shop/cart/checkout
- [ ] Evidenza: review contenuti completata

Stato: `In progress`  
Dipendenze: nessuna

### F7 - Link legali placeholder

- [x] Creare pagine reali: privacy, terms, shipping, refund, contact
- [x] Aggiornare link footer checkout
- [x] Validare presenza contenuti minimi legali
- [ ] Evidenza: nessun link `#` in checkout

Stato: `In progress`  
Dipendenze: nessuna

### F8 - Gestione errori JSON carrello

- [x] Aggiungere `try/catch` su parse localStorage cart
- [x] Fallback sicuro a carrello vuoto
- [ ] Logging errore non bloccante lato client
- [ ] Evidenza: carrello corrotto non rompe UI

Stato: `In progress`  
Dipendenze: nessuna

### F9 - Query shop pesanti (Performance)

- [ ] Ridurre payload query iniziali (limit/select mirati)
- [ ] Spostare dataset pesanti su fetch lazy/on-demand
- [ ] Introdurre caching dove appropriato
- [ ] Misurare TTFB/LCP prima e dopo ottimizzazione
- [ ] Evidenza: miglioramento Lighthouse e tempi server

Stato: `Not started`  
Dipendenze: nessuna

### F10 - Componente cart legacy non usato

- [x] Decidere: integrare `CartClient` o rimuoverlo
- [ ] Eliminare codice morto e stili non usati
- [ ] Evidenza: nessun componente cart duplicato/orfano

Stato: `In progress`  
Dipendenze: F5

## Security Gate (must-have pre go-live)

- [ ] Nessuna operazione critica basata su prezzo client-side
- [ ] Stock validato lato server prima di creare pagamento
- [ ] Webhook con firma verificata + idempotenza
- [ ] Access control verificato su collezioni ordine
- [ ] Error handling senza leakage dati sensibili

## QA Gate (must-have pre go-live)

- [ ] Happy path acquisto completato
- [ ] Pagamento fallito gestito con recovery
- [ ] Carrello vuoto/non valido gestito correttamente
- [ ] Prodotto out-of-stock gestito correttamente
- [ ] Conferma ordine e stato admin allineati

## Deploy Gate

- [ ] `.env` produzione completo (Stripe, SMTP, Payload, DB)
- [ ] Migrazioni DB applicate
- [x] Build produzione senza errori bloccanti
- [ ] Smoke test post-deploy (`shop`, `cart`, `checkout`, webhook)

## Log avanzamento

- 2026-02-11: creato monitor iniziale da findings verifica E2E.
- 2026-02-11: implementati order domain (`orders`, `order-items`), endpoint `POST /api/shop/checkout`, cart page reale, checkout submit, pagine legali base, validazione typecheck/build completata.
