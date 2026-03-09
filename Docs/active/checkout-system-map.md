# Checkout System Map

Ultimo aggiornamento: 9 marzo 2026, update checkout summary extraction

## Scopo

Mappa operativa dei file che toccano il checkout in questo repository, raggruppati per responsabilita'.

Serve come riferimento rapido per:
- modifiche al flusso checkout
- debug prezzi / sconti / spedizione
- debug Stripe / webhook / ordine
- debug Payload admin / ordine / promo code

## 1. Entry Points

Questi sono i punti di ingresso principali del flusso checkout.

### Route checkout

- [src/app/(checkout)/[locale]/checkout/page.tsx](/Users/ale/Progetti/DOBMilano/src/app/(checkout)/[locale]/checkout/page.tsx)
  - route principale checkout
  - legge eventuale contenuto editoriale Payload per la pagina `checkout`
  - monta `CheckoutClient`

- [src/app/(checkout)/[locale]/checkout/success/page.tsx](/Users/ale/Progetti/DOBMilano/src/app/(checkout)/[locale]/checkout/success/page.tsx)
  - pagina di conferma finale post pagamento

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
  - crea l'ordine
  - decide la modalita' `payment_element` / redirect

- [src/app/api/shop/checkout/confirm-payment/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/checkout/confirm-payment/route.ts)
  - conferma best-effort del pagamento in alcuni ambienti

- [src/app/api/shop/shipping-quote/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/shipping-quote/route.ts)
  - endpoint preventivo spedizione

- [src/app/api/shop/webhook/route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/webhook/route.ts)
  - webhook Stripe / aggiornamento ordine

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

- [src/payload/collections/PromoCodes.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/PromoCodes.ts)
  - schema promo code / partner

- [src/payload/collections/Pages.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/Pages.ts)
  - pagina CMS `checkout`

- [src/payload/fields/checkoutFields.ts](/Users/ale/Progetti/DOBMilano/src/payload/fields/checkoutFields.ts)
  - campi editoriali dedicati al checkout

- [src/payload/config.ts](/Users/ale/Progetti/DOBMilano/src/payload/config.ts)
  - registrazione collection / globals / env targeting

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
  - `Orders`
- Il recap laterale e' ora isolato dal container principale:
  - `CheckoutClient` = orchestration layer
  - `CheckoutSummaryPanel` = recap / sidebar / recommendations
- I contenuti editoriali della pagina checkout sono gestiti da Payload tramite `Pages.pageKey = checkout`.
