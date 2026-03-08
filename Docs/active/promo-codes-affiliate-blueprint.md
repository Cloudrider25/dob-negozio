# Promo Codes + Partner Commission Blueprint

## Obiettivo

Introdurre un sistema di codici promo gestito in Payload che:

- applichi uno sconto al cliente in checkout
- attribuisca il codice a un partner / influencer
- calcoli una commissione partner sul netto dopo sconto
- salvi su ordine sia i riferimenti relazionali sia uno snapshot economico immutabile
- permetta di gestire validità, scope prodotti/servizi e limiti d'uso

Questo documento ora descrive sia il blueprint sia lo stato reale di avanzamento dell'implementazione.

## Stato implementazione

### Fatto

- aggiunto role `partner` a `users`
- creata collection `promo-codes`
- registrata `promo-codes` in Payload config
- estesa collection `orders` con:
  - `promoCode`
  - `promoCodeValue`
  - `partner`
  - `commissionAmount`
  - `commissionStatus`
  - `promoCodeSnapshot`
- implementata validazione promo code nel checkout backend
- implementato calcolo sconto su scope prodotti / servizi
- implementato calcolo commissione sul netto dopo sconto
- implementato salvataggio promo / partner / snapshot su ordine
- implementato `commissionStatus = void` su `cancelled` / `refunded`
- collegato il codice sconto alla UI checkout
- implementata rimozione del codice applicato dalla UI checkout
- aggiornato il riepilogo checkout con:
  - subtotale netto
  - riga sconto
  - totale coerente con spedizione e sconto
- corretto il riuso degli ordini / payment intent includendo anche il promo code
- normalizzati gli importi monetari a 2 decimali nel checkout

### Verificato

- typecheck: `pnpm exec tsc --noEmit` passa
- UI checkout:
  - applicazione codice
  - rimozione codice
  - aggiornamento subtotale / sconto / totale
  - aggiornamento totale con spedizione
- persistenza ordine locale:
  - nuovo ordine test salvato correttamente con promo fields valorizzati

### Ancora da fare

- generare una migration tracciata pulita per schema `promo-codes` + nuovi campi `orders`
- applicare esplicitamente la migration su `staging`
- promuovere poi su `prod`
- verificare end-to-end refund / cancel con annullamento commissione su caso reale
- implementare reporting / payout partner in admin
- eventualmente aggiungere quote live lato checkout prima della creazione sessione Stripe

## Scelte fissate

- nuova collection dedicata `promo-codes`
- anagrafica partner riusando `users`
- utenti partner identificati tramite role `partner`
- codici unici globalmente
- commissione calcolata sul netto dopo sconto
- validità regolata da `startsAt`, `endsAt`, `usageLimit`
- applicabilità su:
  - solo prodotti
  - solo servizi
  - entrambi
- supporto ordini misti prodotti + servizi
- in caso di annullamento o rimborso, la commissione va annullata
- su ordine vanno salvati:
  - `promoCode`
  - `promoCodeValue`
  - `discountAmount`
  - `commissionAmount`
  - `commissionStatus`

## Stato attuale del repo

### Checkout

Il checkout ora applica sconti reali e salva i dati promo sugli ordini nuovi.

Punti rilevanti:

- [route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/checkout/route.ts)
  - il payload di checkout include `discountCode`
  - il backend valida promo, calcola sconto e commissione
  - il checkout Stripe riceve il totale scontato

### Modello ordini

La collection ordini esiste già e contiene i campi economici principali del checkout.

Punto rilevante:

- [Orders.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/Orders.ts)

### Promotions

Esiste già una collection `promotions`, ma è troppo limitata per il caso affiliate / partner commission.

Punto rilevante:

- [Promotions.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/Promotions.ts)

### Users

La collection `users` ora include anche il role `partner`.

Punto rilevante:

- [Users.ts](/Users/ale/Progetti/DOBMilano/src/payload/collections/Users.ts)

## Architettura proposta

### 1. Users

Estendere `users.roles` aggiungendo il nuovo valore:

- `partner`

Uso previsto:

- il partner è un normale utente Payload
- i codici promo punteranno a `users`
- il relationship nella collection `promo-codes` verrà filtrato ai soli utenti con role `partner`

Nota:

- tipi generati aggiornati localmente

### 2. Nuova collection `promo-codes`

Slug proposto:

- `promo-codes`

Scopo:

- definire il codice
- associare un partner
- definire sconto e commissione
- definire scope e validità
- permettere reporting e governance admin

### Campi proposti

#### Identità e stato

- `code`
  - `text`
  - required
  - unique
  - index
  - normalizzato uppercase + trim
- `active`
  - `checkbox`
  - default `true`
- `internalLabel`
  - `text`
  - opzionale
  - utile per admin se il codice non coincide con il nome commerciale

#### Assegnazione

- `partner`
  - `relationship`
  - `relationTo: 'users'`
  - required
  - `filterOptions` limitato a utenti con role `partner`

#### Sconto cliente

- `discountType`
  - `select`
  - valori: `percent`, `amount`
  - required
- `discountValue`
  - `number`
  - required
  - `min: 0`

#### Commissione partner

Per coerenza e flessibilità conviene rendere configurabile anche la commissione:

- `commissionType`
  - `select`
  - valori: `percent`, `amount`
  - required
- `commissionValue`
  - `number`
  - required
  - `min: 0`

Regola di business fissata:

- la base di calcolo è il netto dopo sconto

#### Scope applicativo

- `appliesToProducts`
  - `checkbox`
  - default `true`
- `appliesToServices`
  - `checkbox`
  - default `true`

Vincolo:

- almeno uno dei due deve essere `true`

#### Validità e limiti

- `startsAt`
  - `date`
  - opzionale
- `endsAt`
  - `date`
  - opzionale
- `usageLimit`
  - `number`
  - opzionale
  - `min: 1`

#### Governance

- `notes`
  - `textarea`
  - opzionale

### Admin proposto

- group: `Marketing`
- `useAsTitle: 'code'`
- colonne di default:
  - `code`
  - `partner`
  - `discountType`
  - `discountValue`
  - `active`
  - `startsAt`
  - `endsAt`

## Modello ordini: estensione proposta

L'ordine deve conservare sia il riferimento relazionale sia i valori economici congelati al momento dell'acquisto.

### Campi da aggiungere a `orders`

- `promoCode`
  - `relationship`
  - `relationTo: 'promo-codes'`
  - opzionale
- `promoCodeValue`
  - `text`
  - snapshot del codice applicato
- `partner`
  - `relationship`
  - `relationTo: 'users'`
  - opzionale
- `discountAmount`
  - già esistente, da valorizzare davvero
- `commissionAmount`
  - `number`
  - default `0`
- `commissionStatus`
  - `select`
  - valori proposti:
    - `pending`
    - `approved`
    - `paid`
    - `void`
  - default `pending`

### Snapshot consigliato

Per evitare incoerenze storiche quando un codice cambia nel tempo, conviene aggiungere anche un piccolo gruppo snapshot:

- `promoCodeSnapshot.code`
- `promoCodeSnapshot.discountType`
- `promoCodeSnapshot.discountValue`
- `promoCodeSnapshot.commissionType`
- `promoCodeSnapshot.commissionValue`
- `promoCodeSnapshot.appliesToProducts`
- `promoCodeSnapshot.appliesToServices`
- `promoCodeSnapshot.partnerName`

Questo gruppo non sostituisce i campi concordati sopra; li completa.

## Flusso checkout proposto

### Input frontend

Il payload inviato dal checkout ora include:

- `discountCode?: string`

Punti aggiornati:

- [CheckoutClient.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/page/CheckoutClient.tsx)
- [CheckoutOrderSummary.tsx](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/ui/CheckoutOrderSummary.tsx)
- [paymentSession.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/client-api/paymentSession.ts)
- [checkout-submit.ts](/Users/ale/Progetti/DOBMilano/src/frontend/page-domains/checkout/shared/checkout-submit.ts)
- [route.ts](/Users/ale/Progetti/DOBMilano/src/app/api/shop/checkout/route.ts)

### Validazione codice

Nel backend checkout:

1. leggere `discountCode`
2. normalizzare il valore:
   - trim
   - uppercase
3. cercare il record in `promo-codes`
4. verificare:
   - `active === true`
   - `startsAt <= now` se presente
   - `endsAt >= now` se presente
   - `usageLimit` non superato
   - partner assegnato valido
   - scope compatibile con il contenuto del carrello

### Scope su ordini misti

Su carrelli misti:

- le linee prodotto concorrono solo se `appliesToProducts === true`
- le linee servizio concorrono solo se `appliesToServices === true`
- il codice può quindi scontare:
  - una sola porzione del carrello
  - entrambe le porzioni

### Calcolo economico

Il calcolo raccomandato è:

1. calcolare subtotale prodotti eleggibili
2. calcolare subtotale servizi eleggibili
3. sommare i subtotali eleggibili
4. applicare il discount sul solo subtotale eleggibile
5. ripartire lo sconto sulle linee eleggibili se serve reporting analitico
6. calcolare la commissione sul netto dopo sconto

### Regole di calcolo consigliate

- sconto `percent`:
  - `eligibleSubtotal * percent / 100`
- sconto `amount`:
  - `min(amount, eligibleSubtotal)`
- commissione `percent`:
  - `eligibleNetAfterDiscount * percent / 100`
- commissione `amount`:
  - `min(amount, eligibleNetAfterDiscount)`

### Totale finale

Il totale finale ordine / Stripe deve usare:

- subtotale merce / servizi
- meno `discountAmount`
- più eventuale shipping

Nota consigliata:

- lo sconto dovrebbe agire su prodotti/servizi, non sulla spedizione

## Conteggio utilizzi

`usageLimit` deve essere verificato sul numero di ordini validi che hanno effettivamente applicato il codice.

Approccio consigliato:

- non salvare un contatore manuale come fonte primaria
- derivare il conteggio dagli ordini con `promoCode`
- opzionalmente introdurre un campo cache/denormalizzato in futuro solo per performance

Per evitare race condition in checkout ad alto traffico:

- la verifica del limite va fatta il più vicino possibile alla creazione ordine
- se necessario si potrà introdurre una lock o una reservation logic in fase 2

## Stati commissione

### Stato iniziale

Quando l'ordine viene creato con codice valido:

- `commissionStatus = pending`

### Evoluzione suggerita

- `pending`
  - ordine creato / pagato ma non ancora pronto per payout
- `approved`
  - validato internamente e pronto da liquidare
- `paid`
  - commissione già pagata al partner
- `void`
  - commissione annullata per ordine cancellato / rimborsato / invalido

## Regola su annullamenti e rimborsi

Scelta fissata:

- in caso di annullamento o rimborso, la commissione va annullata

Implementazione proposta:

- hook su `orders.beforeChange` o `orders.afterChange`
- quando lo stato ordine o pagamento entra in stato incompatibile con payout:
  - aggiornare `commissionStatus` a `void`

Serve definire l'elenco preciso degli stati applicativi che fanno scattare il void in base agli stati già usati in `orders`.

## Admin reporting minimo

### Collection `promo-codes`

Serve come pannello di gestione operativa:

- creazione codice
- modifica parametri
- attivazione / disattivazione
- assegnazione partner

### Reporting partner

Nella prima fase non serve una custom admin page complessa.

È sufficiente poter interrogare gli ordini filtrando:

- `partner`
- `promoCode`
- `commissionStatus`

Metriche ricavabili:

- numero ordini attribuiti
- totale sconti concessi
- totale commissioni maturate
- totale commissioni da pagare
- totale commissioni pagate

Fase successiva opzionale:

- custom admin dashboard / custom view per payout partner

## Sicurezza e accesso

### `promo-codes`

Accesso consigliato:

- read: admin only
- create: admin only
- update: admin only
- delete: admin only

Motivo:

- i codici sono asset di business, non contenuti pubblici

### Query Local API

Quando il checkout cerca un codice promo nel backend e passa un utente, ricordarsi:

- usare sempre `overrideAccess: false` se si vuole rispettare access control

Nel caso specifico checkout server-side, se la lettura promo è una business operation interna controllata dal server, si può usare un accesso amministrativo intenzionale. Va però fatto in modo esplicito e consistente.

## Tipi e generazione

Dopo le modifiche schema servirà eseguire:

```bash
pnpm exec tsc --noEmit
pnpm payload generate:types
```

Se verranno aggiunti componenti admin custom, servirà anche:

```bash
pnpm payload generate:importmap
```

## Ordine di implementazione consigliato

### Fase 1

1. aggiungere role `partner` a `users`
2. creare collection `promo-codes`
3. estendere `orders` con relazione + snapshot + commission fields
4. estendere payload del checkout con `discountCode`
5. implementare validazione e calcolo sconto/commissione in checkout route
6. persistere i dati su ordine
7. usare il totale scontato per Stripe

Stato:

- completata localmente
- verificata su nuovo ordine locale

### Fase 2

1. annullamento automatico commissione su refund/cancel
2. reporting admin partner / promo code
3. eventuale custom view payout
4. eventuali export CSV o strumenti di riconciliazione

Stato:

- `refund/cancel -> commissionStatus = void` implementato a livello schema
- resto ancora da fare

## Decisioni aperte minori

Queste non bloccano la fase 1, ma vanno fissate durante l'implementazione:

- la commissione diventa disponibile per payout su ordine pagato, evaso o completato?
- `usageLimit` conta solo ordini pagati oppure anche ordini creati e poi falliti?
- il codice deve essere case-insensitive lato validazione? Raccomandazione: sì
- conviene vietare modifiche a `code` dopo il primo uso? Raccomandazione: sì

## Raccomandazione finale

La soluzione corretta per questo progetto è:

- `users` come anagrafica partner tramite role dedicato
- nuova collection `promo-codes`
- calcolo server-side in checkout
- snapshot economico su `orders`

Questo approccio è coerente con il modello Payload esistente, minimizza il rischio di regressioni sul checkout e mantiene tracciabilità storica per marketing, amministrazione e payout partner.
