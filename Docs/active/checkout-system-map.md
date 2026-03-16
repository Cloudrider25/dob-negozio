# Checkout System Map

Ultimo aggiornamento: 16 marzo 2026, attempt-first flow consolidato + quote live + waitlist + auth redirect flow

## Scopo

Mappa operativa dei file che toccano il checkout in questo repository, raggruppati per responsabilita'.

Serve come riferimento rapido per:
- modifiche al flusso checkout
- debug prezzi / sconti / spedizione
- debug Stripe / webhook / ordine
- debug Payload admin / ordine / promo code

## Stato attuale del sistema

- Il checkout usa ormai la pipeline `cart -> checkout-attempt -> order`.
- Il flusso `payment_element` e' `attempt-first`: il server crea o riusa `checkout-attempts`, Stripe conferma il pagamento, poi `confirm-payment` o webhook materializzano l'ordine una sola volta.
- La quote live server-side e' la fonte di verita' economica finale prima del pagamento.
- Il gating checkout usa una semantica condivisa di `item acquistabile`, `empty cart` e `checkout allowed`.
- La reservation inventory e il rilascio automatico sono attivi e allineati con `checkout-attempts`.
- La waitlist prodotto e' attiva e separata dal checkout pagabile.

## Invarianti operative

- I prezzi mostrati in UI non sono la fonte di verita': il totale autorevole viene dal server checkout.
- Gli item non acquistabili, inclusi gli item waitlist, non abilitano il checkout e non entrano nel totale.
- `expiresAt` e' la semantica primaria di scadenza dei `checkout-attempts`.
- La conversione `checkout-attempt -> order` deve restare idempotente e serializzata.
- La policy ambienti database va preservata:
  - `dev` solo DB locale;
  - `staging` solo DB staging;
  - `prod` solo DB production.

## Aree implementate nel branch

### Pricing e quote live

- La risposta checkout restituisce una `quote` completa e autorevole.
- La stessa semantica economica e' allineata tra UI checkout, `checkout-attempt`, ordine e Stripe.
- Il supporto copre i rami `payment_element`, `redirect`, `embedded` e `manual`.

### Cart gating e checkout eligibility

- Pagina carrello e cart drawer non aprono il checkout senza item checkout-eligible.
- Frontend e backend condividono la stessa definizione minima di `empty cart`.
- La route checkout continua a rifiutare payload senza item validi.

### Inventory reservation

- `checkout-attempts` gestisce riserva e rilascio inventory nel flusso `payment_element`.
- Il cleanup usa `expiresAt` come fonte primaria di scadenza.
- E' presente una policy tecnica minima per `low stock` con finestra piu' corta.

### Waitlist e auth flow collegato

- I prodotti `out of stock` espongono CTA `Waitlist` invece di `Compra`.
- La waitlist vive separata dal checkout economico e compare in cart page / cart drawer senza abilitare il pagamento.
- Quando l'utente anonimo tenta `Waitlist`, il redirect a `signin` preserva il path prodotto tramite `redirect`.
- Il parametro `redirect` viene preservato anche in `signup` e `verify-email`, cosi' il ritorno al prodotto resta disponibile dopo autenticazione/verifica.
- L'auto-login post-signup dipende dalla policy auth del progetto; con email non verificata il ramo corretto resta `verify-email -> signin?redirect=...`.

## Regression e verifica runtime

- Regression pass shop verde:
  - `pnpm test:shop:cart-validation`
  - `pnpm test:shop:concurrency`
  - `pnpm test:shop:admin-alignment`
  - `pnpm test:shop:failed-payment`
  - `pnpm test:shop:waitlist`
- `pnpm exec tsc --noEmit` verde.
- Verifiche browser confermate:
  - CTA `Waitlist` su product page `out of stock`;
  - redirect anonimo a `signin?redirect=...`;
  - ritorno automatico al prodotto dopo login;
  - preservazione `redirect` tra `signin`, `signup` e `verify-email`;
  - sezione waitlist visibile in cart drawer / cart page con checkout disabilitato.

## 1. Entry Points

Questi sono i punti di ingresso principali del flusso checkout.

### Route checkout

- [src/app/(checkout)/[locale]/checkout/page.tsx](/Users/ale/Progetti/DOBMilano/src/app/(checkout)/[locale]/checkout/page.tsx)
  - route principale checkout
  - legge eventuale contenuto editoriale Payload per la pagina `checkout`
  - monta `CheckoutClient`

- [src/app/(checkout)/[locale]/checkout/success/page.tsx](/Users/ale/Progetti/DOBMilano/src/app/(checkout)/[locale]/checkout/success/page.tsx)
  - pagina di conferma finale post pagamento

- [src/frontend/page-domains/checkout/ui/CheckoutSuccessContent.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutSuccessContent.tsx)
  - contenuto client della success page
  - risolve l'ordine a posteriori quando il flusso `payment_element` arriva con `attempt` + `payment_intent`
  - chiama `POST /api/shop/checkout/confirm-payment` in polling leggero finche' l'ordine non e' materializzato

- [src/app/(checkout)/layout.tsx](/Users/ale/Progetti/DOBMilano/src/app/(checkout)/layout.tsx)
- [src/app/(checkout)/[locale]/layout.tsx](/Users/ale/Progetti/DOBMilano/src/app/(checkout)/[locale]/layout.tsx)
  - layout e shell del dominio checkout

### Ingresso dal carrello

- [src/app/(frontend)/[locale]/cart/page.tsx](/Users/ale/Progetti/DOBMilano/src/app/(frontend)/[locale]/cart/page.tsx)
- [src/frontend/components/cart/ui/CartPageClient.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/ui/CartPageClient.tsx)
- [src/frontend/components/cart/ui/CartDrawer.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/ui/CartDrawer.tsx)
  - punti da cui l'utente entra nel checkout

## 2. Checkout UI Core

Questi file governano il comportamento frontend principale del checkout.

- [src/frontend/page-domains/checkout/page/CheckoutClient.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/page/CheckoutClient.tsx)
  - orchestratore del checkout
  - gestisce step, stato cliente, shipping, payment session, codice sconto, redirect finale

- [src/frontend/page-domains/checkout/page/CheckoutClient.module.css](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/page/CheckoutClient.module.css)
  - styling principale del layout e del flusso checkout
  - non contiene piu' il CSS del recap laterale

- [src/frontend/page-domains/checkout/ui/CheckoutSummaryPanel.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutSummaryPanel.tsx)
  - recap / sidebar del checkout
  - mostra subtotale, spedizione, sconto, totale
  - gestisce UI del promo code
  - contiene anche recommendations e riepilogo linee ordine

- [src/frontend/page-domains/checkout/ui/CheckoutSummaryPanel.module.css](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutSummaryPanel.module.css)
  - CSS dedicato al recap laterale
  - visibilita' desktop/mobile della sidebar summary

- [src/frontend/page-domains/checkout/ui/CheckoutStepHeader.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutStepHeader.tsx)
  - header di navigazione degli step

- [src/frontend/page-domains/checkout/ui/CheckoutFooterLinks.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutFooterLinks.tsx)
  - link di supporto / legali del checkout

## 3. Step del Checkout

### Information

- [src/frontend/page-domains/checkout/ui/steps/InformationStep.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/steps/InformationStep.tsx)
  - dati cliente iniziali
  - eventuale express checkout

### Shipping

- [src/frontend/page-domains/checkout/ui/steps/ShippingStep.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/steps/ShippingStep.tsx)
  - scelta metodo di spedizione
  - visualizzazione shipping options

### Payment

- [src/frontend/page-domains/checkout/ui/steps/PaymentStep.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/steps/PaymentStep.tsx)
  - step finale di pagamento

- [src/frontend/page-domains/checkout/ui/payment/PaymentElementForm.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/payment/PaymentElementForm.tsx)
  - Stripe Payment Element

- [src/frontend/page-domains/checkout/ui/payment/ExpressCheckoutQuickForm.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/payment/ExpressCheckoutQuickForm.tsx)
  - fast path / express checkout

## 4. Checkout State, Hooks e Contratti

Questi file contengono la logica di stato client e i contratti condivisi.

- [src/frontend/page-domains/checkout/hooks/useCheckoutPaymentSession.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/hooks/useCheckoutPaymentSession.ts)
  - crea / aggiorna payment session
  - snodo principale per refresh prezzi e promo code

- [src/frontend/page-domains/checkout/hooks/useShippingQuote.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/hooks/useShippingQuote.ts)
  - recupera il preventivo spedizione

- [src/frontend/page-domains/checkout/hooks/useCheckoutRecommendations.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/hooks/useCheckoutRecommendations.ts)
  - prodotti consigliati nel checkout

- [src/frontend/page-domains/checkout/hooks/useCheckoutStepActions.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/hooks/useCheckoutStepActions.ts)
  - transizioni fra step

- [src/frontend/page-domains/checkout/hooks/useDesktopViewport.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/hooks/useDesktopViewport.ts)
  - comportamento responsive

- [src/frontend/page-domains/checkout/shared/contracts.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/shared/contracts.ts)
  - tipi condivisi del checkout
  - `PaymentSession`, `ShippingOption`, `CheckoutCopy`, ecc.

- [src/frontend/page-domains/checkout/shared/checkout-submit.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/shared/checkout-submit.ts)
  - payload inviato alla API checkout

- [src/frontend/page-domains/checkout/shared/step-machine.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/shared/step-machine.ts)
  - macchina di stato degli step

- [src/frontend/page-domains/checkout/shared/format.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/shared/format.ts)
  - formattazione prezzi / stringhe del dominio checkout

## 5. API Server del Checkout

Questi sono i file piu' critici lato server.

- [src/app/api/shop/checkout/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/checkout/route.ts)
  - endpoint centrale checkout
  - crea / riusa sessione pagamento
  - calcola subtotale, sconto, commissione partner, totale
  - per `redirect` / `embedded` crea l'ordine subito
  - per `payment_element` crea / riusa `checkout-attempts`, riserva inventario sull'attempt e crea il `PaymentIntent`
  - decide la modalita' `payment_element` / redirect / embedded

- [src/app/api/shop/checkout/confirm-payment/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/checkout/confirm-payment/route.ts)
  - conferma server-side del pagamento `payment_element`
  - nel flusso attempt-first materializza l'ordine da `checkout-attempts` solo quando il `PaymentIntent` e' `succeeded`
  - resta anche fallback best-effort per ambienti locali / race con webhook

- [src/app/api/shop/shipping-quote/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/shipping-quote/route.ts)
  - endpoint preventivo spedizione

- [src/app/api/shop/webhook/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/webhook/route.ts)
  - webhook Stripe / aggiornamento ordine
  - per `payment_element` puo' materializzare l'ordine da `checkout-attempts`
  - su `payment.failed` / `payment.cancelled` rilascia inventory dell'attempt o dell'ordine

- [src/app/api/sendcloud/webhook/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/sendcloud/webhook/route.ts)
  - webhook Sendcloud

## 6. Prezzi, Sconti, Shipping e Inventory

Questi file sono il layer di business logic.

- [src/lib/server/shop/promoCodes.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/shop/promoCodes.ts)
  - validazione promo code
  - ambito prodotti / servizi
  - calcolo discount e commissione

- [src/lib/shared/shop/shipping.ts](/Users/ale/Progetti/DOBMilano/src/lib/shared/shop/shipping.ts)
  - logica condivisa spedizione

- [src/lib/server/sendcloud/getShippingQuote.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/sendcloud/getShippingQuote.ts)
  - pricing / quote verso Sendcloud

- [src/lib/server/sendcloud/createParcel.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/sendcloud/createParcel.ts)
  - creazione spedizione / parcel

- [src/lib/server/shop/orderInventory.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/shop/orderInventory.ts)
  - commit / release inventario ordine

- [src/lib/server/shop/checkoutAttempts.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/shop/checkoutAttempts.ts)
  - business logic del flusso `payment_element` attempt-first
  - reserve / release inventario per `checkout-attempts`
  - converte `checkout-attempts` in `orders`
  - serializza la conversione con advisory lock per evitare doppi ordini in race fra webhook e confirm-payment

- [src/lib/server/shop/shopIntegrationsConfig.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/shop/shopIntegrationsConfig.ts)
  - configurazione integrazioni Stripe + Sendcloud

## 7. Cart e Pre-Checkout

Questi file influenzano direttamente cio' che arriva al checkout.

- [src/frontend/components/cart/hooks/useCartState.ts](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/hooks/useCartState.ts)
- [src/lib/frontend/cart/storage.ts](/Users/ale/Progetti/DOBMilano/src/lib/frontend/cart/storage.ts)
- [src/frontend/components/cart/shared/operations.ts](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/shared/operations.ts)
- [src/frontend/components/cart/shared/types.ts](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/shared/types.ts)
- [src/frontend/components/cart/shared/normalize.ts](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/shared/normalize.ts)
- [src/frontend/components/cart/shared/itemKind.ts](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/shared/itemKind.ts)
- [src/frontend/components/cart/shared/format.ts](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/shared/format.ts)
- [src/frontend/components/cart/shared/recommendations.ts](/Users/ale/Progetti/DOBMilano/src/frontend/components/cart/shared/recommendations.ts)

## 8. Payload CMS: Admin, Schema e Contenuto

Questi file toccano il checkout lato CMS / backoffice.

- [src/payload/collections/Orders.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/Orders.ts)
  - schema ordine
  - stati, importi, payout partner, integrazione admin

- [src/payload/collections/OrderItems.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/OrderItems.ts)
  - righe prodotto ordine

- [src/payload/collections/OrderServiceItems.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/OrderServiceItems.ts)
  - righe servizio ordine

- [src/payload/collections/OrderServiceSessions.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/OrderServiceSessions.ts)
  - appuntamenti / fulfillment servizi

- [src/payload/collections/CheckoutAttempts.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/CheckoutAttempts.ts)
  - stato transitorio del flusso `payment_element`
  - contiene fingerprint checkout, snapshot linee, importi, metadata Stripe e stato conversione

- [src/payload/collections/ShopWebhookEvents.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/ShopWebhookEvents.ts)
  - log eventi webhook
  - ora puo' riferire sia `order` sia `checkoutAttempt`

- [src/payload/collections/PromoCodes.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/PromoCodes.ts)
  - schema promo code / partner

- [src/payload/collections/Pages.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/Pages.ts)
  - pagina CMS `checkout`

- [src/payload/fields/checkoutFields.ts](/Users/ale/Progetti/DOBMilano/src/payload/fields/checkoutFields.ts)
  - campi editoriali dedicati al checkout

- [src/payload/config.ts](/Users/ale/Progetti/DOBMilano/src/payload/config.ts)
  - registrazione collection / globals / env targeting

- [src/migrations/20260315_100500.ts](/Users/ale/Progetti/DOBMilano/src/migrations/20260315_100500.ts)
  - migration principale che introduce `checkout_attempts` e i riferimenti collegati

- [src/migrations/20260315_183500.ts](/Users/ale/Progetti/DOBMilano/src/migrations/20260315_183500.ts)
  - migration di completamento per gli indici mancanti su `checkout_attempts`

- [src/migrations/index.ts](/Users/ale/Progetti/DOBMilano/src/migrations/index.ts)
  - registry migrations
  - `20260315_100500` deve precedere `20260315_183500`

## 9. Account e Post-Checkout

Questi file non eseguono il checkout, ma mostrano o consumano i suoi risultati.

- [src/frontend/page-domains/account/tabs/orders/AccountOrdersTab.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/account/tabs/orders/AccountOrdersTab.tsx)
- [src/frontend/page-domains/account/hooks/orders/useAccountOrders.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/account/hooks/orders/useAccountOrders.ts)
- [src/frontend/page-domains/account/hooks/orders/orders-domain.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/account/hooks/orders/orders-domain.ts)

## 10. Traduzioni e Copy

- [src/lib/i18n/core.ts](/Users/ale/Progetti/DOBMilano/src/lib/i18n/core.ts)
  - stringhe checkout
  - testi promo code
  - messaggi errore
  - success page

## 11. Pagine Correlate ma Non Core Checkout

- [src/app/(frontend)/[locale]/shipping/page.tsx](/Users/ale/Progetti/DOBMilano/src/app/(frontend)/[locale]/shipping/page.tsx)
- [src/frontend/page-domains/legal/shipping/ShippingPage.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/legal/shipping/ShippingPage.tsx)
- [src/frontend/page-domains/legal/shipping/ShippingPage.module.css](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/legal/shipping/ShippingPage.module.css)

## 12. Core Files da Aprire per Qualsiasi Task Checkout

Se devi lavorare sul checkout e vuoi aprire subito i file giusti, parti da questi:

### A. Flusso principale

- [src/frontend/page-domains/checkout/page/CheckoutClient.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/page/CheckoutClient.tsx)
- [src/app/api/shop/checkout/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/checkout/route.ts)
- [src/frontend/page-domains/checkout/ui/CheckoutSummaryPanel.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutSummaryPanel.tsx)
- [src/frontend/page-domains/checkout/ui/CheckoutSummaryPanel.module.css](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutSummaryPanel.module.css)
- [src/frontend/page-domains/checkout/hooks/useCheckoutPaymentSession.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/hooks/useCheckoutPaymentSession.ts)

### B. Prezzi / promo / shipping

- [src/lib/server/shop/promoCodes.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/shop/promoCodes.ts)
- [src/app/api/shop/shipping-quote/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/shipping-quote/route.ts)
- [src/lib/server/sendcloud/getShippingQuote.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/sendcloud/getShippingQuote.ts)

### C. Persistenza ordine

- [src/payload/collections/Orders.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/Orders.ts)
- [src/payload/collections/OrderItems.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/OrderItems.ts)
- [src/payload/collections/OrderServiceItems.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/OrderServiceItems.ts)

### D. Integrazioni

- [src/app/api/shop/webhook/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/webhook/route.ts)
- [src/lib/server/shop/shopIntegrationsConfig.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/shop/shopIntegrationsConfig.ts)
- [src/lib/server/sendcloud/createParcel.ts](/Users/ale/Progetti/DOBMilano/src/lib/server/sendcloud/createParcel.ts)

## 13. Note Operative

- Il checkout e' un dominio misto `frontend + api + payload`.
- I prezzi mostrati in UI non vanno trattati come fonte di verita': la fonte reale e' il server in [route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/checkout/route.ts).
- Promo code, commissioni partner e totale ordine vivono principalmente nella pipeline:
  - `CheckoutClient`
  - `useCheckoutPaymentSession`
  - `/api/shop/checkout`
  - `Orders` per `redirect` / `embedded`
  - `CheckoutAttempts -> confirm-payment / webhook -> Orders` per `payment_element`
- Il recap laterale e' ora isolato dal container principale:
  - `CheckoutClient` = orchestration layer
  - `CheckoutSummaryPanel` = recap / sidebar / recommendations
- I contenuti editoriali della pagina checkout sono gestiti da Payload tramite `Pages.pageKey = checkout`.
- Il flusso `payment_element` e' ora `attempt-first`:
  - `/api/shop/checkout` crea o riusa `checkout-attempts`
  - il browser conferma Stripe con `return_url`
  - `confirm-payment` o il webhook materializzano l'ordine una sola volta
  - la success page puo' risolvere l'ordine post redirect usando `attempt` + `payment_intent`
