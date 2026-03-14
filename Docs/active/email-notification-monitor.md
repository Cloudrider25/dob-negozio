# Email Notification Audit And Monitor

## Obiettivo

Definire:

- quali email vengono inviate oggi
- quali template sono gestiti da Payload
- quali eventi sono coperti realmente
- cosa manca ancora per chiudere il sistema

## Stato Attuale

### Infrastruttura

- Trasporto SMTP centralizzato via Nodemailer
- Config SMTP letta da `site-settings.smtp` con fallback env
- Adapter Payload email attivo via `siteSettingsSMTPAdapter`
- Delivery policy per `eventKey + locale` letta da `site-settings.emailDeliveryPolicies`
- Sender unico business attivo:
  - `src/lib/server/email/sendBusinessEventEmail.ts`
- Registry eventi attiva:
  - `src/lib/server/email/events.ts`
- Collection monitor attiva:
  - `email-delivery-events`
- Collection template attiva:
  - `email-templates`

### Admin UX

- `Available Variables` live in base a `eventKey`
- warning live se `channel` o `locale` non sono supportati
- `HTML Preview` renderizzata nel form admin
- tab `Site Settings -> Email Delivery` con matrice per evento:
  - blocco `SMTP` collassabile all'inizio del tab
  - colonna `Type` letta dal registry eventi
  - seconda colonna `Recipient` per override admin/internal
  - colonne `IT / EN / RU` indipendenti
  - ogni colonna usa `Template / Fallback / Disabled`
  - `Template` è disabilitato se il template attivo per quella lingua non esiste
  - copertura template `IT / EN / RU` letta live dal sistema
  - bulk edit disponibile su righe selezionate:
    - `Recipient`
    - `IT`
    - `EN`
    - `RU`
- `testDataExample` mantenuto tecnico ma nascosto
- renderer placeholder con fallback sicuro:
  - se un template attivo usa placeholder mancanti, il sistema fa downgrade automatico al fallback code-defined
  - se mancano ancora dati anche nel fallback, inserisce marker espliciti `[missing: ...]`
  - i diagnostici vengono loggati in `email-delivery-events`

### Seed template

- script disponibile:
  - `pnpm seed:email-templates`
- comportamento:
  - idempotente
  - crea solo i template mancanti
  - non sovrascrive template già personalizzati

### Template presenti

- totale record `email_templates` nel DB locale:
  - `120`

- copertura per lingua:
  - `it`: `40`
  - `en`: `40`
  - `ru`: `40`

- template verify account customer attivo:
  - `email_verification_requested:it:customer`

- template business IT seedati:
  - `user_registered:it:admin`
  - `user_registered:it:customer`
  - `user_verified:it:admin`
  - `password_reset_requested:it:customer`
  - `password_reset_requested:it:admin`
  - `password_reset_completed:it:admin`
  - `login_success_admin_notice:it:admin`
  - `login_failed_admin_notice:it:admin`
  - `consultation_lead_created:it:customer`
  - `consultation_lead_created:it:admin`
  - `newsletter_service_created:it:customer`
  - `newsletter_service_created:it:admin`
  - `newsletter_product_created:it:customer`
  - `newsletter_product_created:it:admin`
  - `order_created:it:customer`
  - `order_created:it:admin`
  - `order_paid:it:customer`
  - `order_paid:it:admin`
  - `order_payment_failed:it:admin`
  - `order_payment_failed:it:customer`
  - `order_cancelled:it:customer`
  - `order_cancelled:it:admin`
  - `order_refunded:it:customer`
  - `order_refunded:it:admin`
  - `appointment_requested:it:customer`
  - `appointment_requested:it:admin`
  - `appointment_alternative_proposed:it:customer`
  - `appointment_alternative_proposed:it:admin`
  - `appointment_confirmed:it:customer`
  - `appointment_confirmed:it:admin`
  - `appointment_confirmed_by_customer:it:customer`
  - `appointment_confirmed_by_customer:it:admin`
  - `appointment_cancelled:it:customer`
  - `appointment_cancelled:it:admin`
  - `shipment_created:it:customer`
  - `shipment_created:it:admin`
  - `tracking_available:it:customer`
  - `tracking_available:it:admin`
  - `email_delivery_failed:it:admin`

## Email realmente inviate oggi

### Auth utente

- Verifica account
  - trigger: signup Payload auth
  - template: `email_verification_requested:*:customer` con fallback hardcoded
  - localizzazione: `it/en/ru` fallback disponibile

- Reset password
  - trigger: forgot password Payload auth
  - template: `password_reset_requested:*:customer` con fallback hardcoded
  - localizzazione: `it/en/ru` fallback disponibile

### Auth admin

- Login riuscito
  - trigger: `auth-audit-events`
  - template IT seedato

- Login fallito
  - trigger: `auth-audit-events`
  - template IT seedato

- Reset password richiesto
  - trigger: `auth-audit-events`
  - template IT seedato per admin

- Reset password completato
  - trigger: `auth-audit-events`
  - template IT seedato per admin

- Nuovo utente registrato
  - trigger: `Users.afterChange`
  - customer: attivo
  - admin: attivo
  - template IT seedati

- Utente verificato
  - trigger: `Users.afterChange`
  - template IT seedato per admin

### Business

- Richiesta consulenza
  - customer: attiva
  - admin: attiva
  - template IT seedati

- Newsletter nuovo servizio
  - customer: attiva
  - admin: attiva
  - trigger: `Services.afterChange` su creazione record attivo
  - audience customer: utenti verificati con `preferences.marketingOptIn = true`
  - template IT seedati

- Newsletter nuovo prodotto
  - customer: attiva
  - admin: attiva
  - trigger: `Products.afterChange` su creazione record attivo
  - audience customer: utenti verificati con `preferences.marketingOptIn = true`
  - template IT seedati

- Ordine creato
  - customer: attivo
  - admin: attivo
  - trigger: checkout alla creazione del record ordine
  - template IT seedati

- Ordine pagato
  - customer: attiva
  - admin: attiva
  - centralizzata in `sendOrderPaidNotifications`
  - template IT seedati

- Ordine pagamento fallito
  - customer: attivo
  - admin: attivo
  - template IT seedati

- Ordine cancellato
  - customer: attivo
  - admin: attivo
  - template IT seedati

- Ordine rimborsato
  - customer: attivo
  - admin: attivo
  - template IT seedati

- Richiesta appuntamento
  - customer: attiva
  - admin: attiva
  - template IT seedati

- Proposta alternativa appuntamento
  - customer: attiva
  - admin: attiva
  - template IT seedati

- Appuntamento confermato
  - customer: attivo
  - admin: attivo
  - template IT seedati

- Appuntamento confermato da cliente
  - customer: attivo
  - admin: attivo
  - template IT seedati

- Appuntamento annullato
  - customer: attivo
  - admin: attivo
  - trigger runtime cablato quando `appointmentStatus` torna a `none`
  - template IT seedati

- Spedizione creata
  - customer: attiva
  - admin: attiva
  - template IT seedati

- Tracking disponibile
  - customer: attiva
  - admin: attiva
  - template IT seedati

- Email delivery failed
  - admin: attiva
  - template IT seedato
  - log anche in `email-delivery-events`

## Eventi supportati in codice

- `email_verification_requested`
- `user_registered`
- `user_verified`
- `password_reset_requested`
- `password_reset_completed`
- `login_success_admin_notice`
- `login_failed_admin_notice`
- `consultation_lead_created`
- `newsletter_service_created`
- `newsletter_product_created`
- `order_created`
- `order_paid`
- `order_payment_failed`
- `order_cancelled`
- `order_refunded`
- `appointment_requested`
- `appointment_alternative_proposed`
- `appointment_confirmed`
- `appointment_confirmed_by_customer`
- `appointment_cancelled`
- `shipment_created`
- `tracking_available`
- `email_delivery_failed`

## Review Rapida Template IT

### Valutazione generale

- Il layout base è coerente
- I template sono leggibili e riusabili
- Il seed è utile e non distruttivo
- La preview admin riduce molto il rischio editoriale

### Osservazioni da tenere

- `email_verification_requested`
  - corretto
  - già allineato al template custom inserito in admin

- `order_paid:customer`
  - corretto ma essenziale
  - migliorabile con un blocco più chiaro su appointment / pickup / shipping

- `appointment_*`
  - corretti
  - conviene differenziare meglio il tone of voice tra:
    - `appointment_confirmed`
    - `appointment_confirmed_by_customer`

- `shipment_created` e `tracking_available`
  - funzionano
  - oggi sono molto simili nel copy
  - si possono differenziare meglio

- `email_delivery_failed:admin`
  - utile
  - manca ancora una dashboard admin oltre al solo elenco collection

## Gap Reali Residui

### Funzionali

- Nessuna gestione di `appointment_request_cleared`
- Nessuna gestione di proposta alternativa rifiutata o scaduta
- Nessuna copertura template `en`
- Nessuna copertura template `ru`

### Architetturali

- non esiste ancora una dashboard admin dedicata ai failure email
- non esiste ancora una preview plain-text nel form template
- l'email admin di destinazione resta gestita da env, non da Payload

## Checklist Monitor

### Setup

- [x] SMTP configurato in `site-settings` o env
- [x] `from` address valido e verificato
- [x] admin email di destinazione configurata
- [x] policy `deliveryMode` per `eventKey + lingua` configurabile in `site-settings`
- [x] collection `email-templates` creata
- [x] collection `email-delivery-events` creata
- [x] registry `eventKey` definita in codice
- [x] seed template IT disponibile
- [x] preview HTML disponibile in admin
- [x] available variables live in admin
- [x] recipient override admin/internal disponibile in `Site Settings -> Email Delivery`
- [x] bulk edit disponibile in `Site Settings -> Email Delivery`

### Copertura eventi

- [x] email verifica account -> customer
- [x] nuovo utente registrato -> customer
- [x] nuovo utente registrato -> admin
- [x] utente verificato -> admin
- [x] reset password richiesto -> customer
- [x] reset password richiesto -> admin
- [x] reset password completato -> admin
- [x] lead consulenza -> customer
- [x] lead consulenza -> admin
- [x] ordine creato -> customer
- [x] ordine creato -> admin
- [x] ordine pagato -> customer
- [x] ordine pagato -> admin
- [x] ordine pagamento fallito -> customer
- [x] ordine pagamento fallito -> admin
- [x] ordine cancellato -> customer
- [x] ordine cancellato -> admin
- [x] ordine rimborsato -> customer
- [x] ordine rimborsato -> admin
- [x] richiesta appuntamento -> customer
- [x] richiesta appuntamento -> admin
- [x] proposta alternativa appuntamento -> customer
- [x] proposta alternativa appuntamento -> admin
- [x] appuntamento confermato -> customer
- [x] appuntamento confermato -> admin
- [x] conferma appuntamento da cliente -> customer
- [x] conferma appuntamento da cliente -> admin
- [x] annullamento appuntamento -> customer
- [x] annullamento appuntamento -> admin
- [x] spedizione creata -> customer
- [x] spedizione creata -> admin
- [x] tracking disponibile -> customer
- [x] tracking disponibile -> admin
- [x] email fallita -> admin

### Qualità template

- [x] subject presente per ogni template IT seedato
- [x] versione `html` presente per ogni template IT seedato
- [x] versione `text` presente per ogni template IT seedato
- [x] placeholder documentati
- [x] placeholder validati per evento
- [x] fallback sicuro se placeholder mancante
- [x] lingua `it` coperta
- [x] lingua `en` coperta
- [x] lingua `ru` coperta

### Monitoraggio

- [x] ogni invio genera un log
- [x] ogni failure genera log con errore
- [x] ogni failure importante genera email admin
- [x] dashboard admin per ultimi failure
- [x] filtro dedicato per `eventKey`
- [x] filtro dedicato per `status`
- [x] filtro dedicato per destinatario

## Cosa Manca Davvero

- introdurre `appointment_request_cleared`
- popolare template `en`
- popolare template `ru`
- portare `notificationAdminEmail` in `site-settings`
- aggiungere dashboard / saved views su `email-delivery-events`
