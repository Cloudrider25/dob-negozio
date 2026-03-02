# Shop Journey E2E - Documentation Reference

Ultimo aggiornamento: 2026-02-13  
Owner: Team DOB Milano

## 1) Scope

Questo documento descrive lo stato implementativo reale del journey e-commerce DOB:

- shop
- cart
- checkout
- pagamento
- conferma ordine
- sincronizzazione logistica (Sendcloud)
- notifiche email e webhook

Uso previsto: riferimento tecnico e operativo pre/post rilascio.

## 2) Stato Attuale

Il dominio shop risulta implementato end-to-end su frontend + backend, con:

- checkout server-side con validazioni
- integrazione Stripe (Payment Element)
- webhook pagamento con idempotenza
- persistenza ordini e righe ordine
- gestione stock con controlli concorrenza
- integrazione Sendcloud su ordini pagati
- pagine legali collegate dal checkout
- ottimizzazioni performance principali già applicate

## 3) Architettura Funzionale

### 3.1 Frontend Journey

- `/{locale}/shop`
- `/{locale}/cart`
- `/{locale}/checkout`
- `/{locale}/checkout/success`

Componenti principali:

- `src/components/shop/*`
- `src/components/cart/*`
- `src/components/checkout/CheckoutClient.tsx`

### 3.2 Backend Shop

Endpoint principali:

- `POST /api/shop/checkout`
- `POST /api/shop/webhook`
- `POST /api/shop/shipping-quote`
- `GET /api/shop/recommendations`
- `POST /api/sendcloud/webhook`

Collezioni principali:

- `orders`
- `order-items`
- `shop-webhook-events`
- `shop-inventory-locks`

### 3.3 Integrazioni

- Stripe: creazione sessione pagamento + conferma via webhook
- Sendcloud: creazione parcel e aggiornamento stato tracking
- SMTP/Payload email: invio comunicazioni transazionali

## 4) Sicurezza e Integrità Dati

Implementato:

- prezzo/valuta/quantità validati server-side (mai trusted dal client)
- verifica disponibilità stock prima del pagamento
- decremento stock su evento pagamento confermato
- webhook firmati e idempotenti
- error handling senza leakage di dettagli sensibili

Pattern Payload rispettati:

- `req` passato alle nested operations in hook/flow transazionali
- attenzione a access control Local API dove applicabile

## 5) Performance e Media

Interventi già applicati:

- font self-hosted (`next/font`)
- query shop alleggerite e fetch lazy per sezioni pesanti
- caching server-side per data provider shop
- conversione e derivati immagine (`webp`)
- pipeline background su upload media (immagini/video)

## 6) Configurazione Operativa

Configurazioni usate nel progetto:

- Stripe (secret/publishable/webhook secret)
- Sendcloud (public/secret key + webhook secret opzionale)
- SMTP
- Payload secret
- Database URL

Nota: per il go-live verificare che i valori di ambiente siano configurati nell’ambiente target.

## 7) Runbook Verifiche

### 7.1 Smoke tecnico

- apertura pagine `shop`, `cart`, `checkout`, `checkout/success`
- test endpoint critici (`checkout`, webhook, shipping quote)
- build produzione (`next build`)
- avvio produzione (`next start`)

### 7.2 Verifica business flow

- creazione ordine da checkout
- pagamento completato
- aggiornamento stato ordine
- ricezione evento webhook
- creazione/aggiornamento spedizione Sendcloud
- email conferma ordine

### 7.3 Verifica contenuti multilingua (IT/EN/RU)

- controllo copy su `shop -> cart -> checkout -> success`
- coerenza testi, label, CTA, messaggi errore
- assenza mix lingua nello stesso step

## 8) Test e Script disponibili

Script già presenti per validazioni chiave (convenzione `test:shop:*`):

- webhook/idempotenza
- concorrenza stock
- manomissione payload client
- pagamento fallito e recovery
- validazione carrello
- allineamento admin

Disponibili anche test:

- E2E journey shop
- test integrità storage carrello client

## 9) Changelog sintetico

- Implementato order domain completo (`orders`, `order-items`)
- Introdotti webhook pagamento robusti con idempotenza
- Aggiunti lock inventario e gestione race conditions
- Integrazione Stripe checkout/payment flow stabilizzata
- Integrazione Sendcloud per fulfillment ordini paid
- Ottimizzazioni performance su shop e delivery media
- Refactor copy journey con base i18n centralizzata

## 10) Riferimenti file chiave

- `src/components/checkout/CheckoutClient.tsx`
- `src/components/cart/CartPageClient.tsx`
- `src/components/cart/CartDrawer.tsx`
- `src/components/shop/ShopSectionSwitcher.tsx`
- `src/app/api/shop/checkout/route.ts`
- `src/app/api/shop/webhook/route.ts`
- `src/app/api/shop/shipping-quote/route.ts`
- `src/app/api/shop/recommendations/route.ts`
- `src/app/api/sendcloud/webhook/route.ts`
- `src/lib/i18n.ts`
- `src/lib/shop/*`
