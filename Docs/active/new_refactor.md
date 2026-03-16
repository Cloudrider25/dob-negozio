# New Refactor

Alias operativo nei messaggi futuri: `nr`

Questo file resta il riferimento rapido per il refactor ancora aperto.

## Stato rapido

- `Task 1`: completato.
- `Task 2`: completato.
- `Task 3`: completato.
- `Task 4`: completato.
- `Task 5`: completato / consolidato.
- `Task 6`: aperto.

## Nota di struttura

- La mappa architetturale aggiornata del checkout, incluse pipeline condivise, invarianti operative, runtime status e file responsabili, vive ora in [checkout-system-map.md](/Users/ale/Progetti/DOBMilano/Docs/active/checkout-system-map.md).
- I dettagli storici e implementativi dei `Task 1-5` non restano piu' qui per evitare duplicazioni.
- Questo file mantiene solo il task ancora aperto.

## Task 6: Completamento `serviceNavigatorFields`

- Modificare o completare `serviceNavigatorFields`.

### Stato attuale

- Il file `src/payload/fields/serviceNavigatorFields.ts` espone oggi solo il gruppo `serviceNavigator`.
- All'interno del gruppo risultano definiti solo i campi dello `step0`.
- La configurazione e' usata nella tab `Service Navigator` della collection `Pages` quando `pageKey === 'services'`.

### Specifica tecnica Task 6

#### Obiettivo

- Completare la struttura editoriale del `Service Navigator` nel CMS.
- Permettere la gestione di tutti gli step necessari del flusso, non solo dello `step0`.
- Rendere il contenuto del navigator coerente, localizzato e facilmente manutenibile in admin.

#### Obiettivi funzionali

- Consentire al team contenuti di configurare ogni step del `Service Navigator` dalla pagina `services`.
- Mantenere una struttura chiara tra contenuti introduttivi, step intermedi, CTA e media associati.
- Evitare configurazioni parziali o ambigue che rendano incompleto il flusso frontend.

#### Ambito minimo da completare

- Estendere `serviceNavigatorFields` oltre `step0`.
- Definire gli step successivi necessari al flusso reale del `Service Navigator`.
- Per ogni step, valutare la presenza di:
  - heading;
  - description;
  - media;
  - placeholder media;
  - label CTA;
  - eventuali opzioni o selezioni richieste dal frontend.

#### Principi di modellazione CMS

- I campi devono restare coerenti con gli altri field factory del progetto.
- I contenuti testuali destinati al frontend devono essere `localized` dove necessario.
- La struttura deve privilegiare chiarezza editoriale prima di compattezza tecnica.
- Se gli step condividono la stessa forma, va valutata una modellazione ripetibile invece di copiare campi quasi identici senza criterio.

#### Struttura dati da definire

- Mantenere il gruppo radice `serviceNavigator`.
- Definire se gli step successivi devono essere modellati come:
  - campi espliciti `step1`, `step2`, `step3`, ecc.;
  - oppure una struttura ripetibile come `array` di step.
- La scelta va fatta in base a:
  - numero fisso o variabile di step;
  - bisogno di ordine controllato;
  - semplicita' d'uso in admin;
  - semplicita' di rendering nel frontend.

#### Contenuti da supportare per step

- Titolo dello step.
- Descrizione dello step.
- Media associato.
- Testo placeholder o fallback del media.
- Etichetta della CTA o pulsante di avanzamento, se prevista.
- Eventuali label di risposta o opzioni selezionabili, se il navigator e' decisionale.
- Eventuali contenuti finali o riepilogo, se l'ultimo step porta a una raccomandazione o destinazione.

#### Regole UI admin

- L'editor deve capire con chiarezza quale contenuto appartiene a ciascuno step.
- I campi devono avere descrizioni admin esplicite e consistenti.
- Se uno step dipende da una CTA o da opzioni, il naming deve riflettere l'ordine del flusso.
- La struttura non deve costringere l'editor a interpretare campi tecnicamente ambigui.

#### Regole dati e dominio

- Il `Service Navigator` deve avere una forma dati stabile per il frontend.
- Va evitata una struttura che richieda trasformazioni fragili lato rendering.
- Se il frontend si aspetta step ordinati, il dato deve renderne esplicito l'ordine.
- Se esistono step obbligatori, i relativi campi devono essere `required` dove opportuno.

#### Note implementative

- Se vengono introdotti nuovi campi schema, va eseguito `generate:types`.
- Se la modifica impatta componenti admin custom, va rigenerato anche l'import map se necessario.
- Va verificato il renderer frontend che consuma `serviceNavigator` per evitare regressioni.
- Se la struttura cambia da campi fissi ad `array`, va verificato l'impatto sui dati gia' presenti.

#### Rischi da controllare

- Completare i campi senza allineare il renderer frontend puo' creare contenuti non letti o non mostrati.
- Modellare step fissi quando il flusso e' destinato a cambiare puo' introdurre rigidita' inutile.
- Modellare uno `array` troppo generico senza regole puo' rendere il CMS piu' difficile da usare.

#### Acceptance criteria frontend

- Il frontend riceve una struttura `serviceNavigator` completa e coerente con il flusso previsto.
- Tutti gli step previsti dal navigator possono essere renderizzati senza fallback improvvisati.
- I contenuti media e testuali degli step risultano allineati ai dati del CMS.

#### Acceptance criteria backend / CMS

- La collection `Pages` per `pageKey === 'services'` espone una configurazione completa del `Service Navigator`.
- Gli editor possono compilare tutti gli step necessari senza usare workaround.
- I campi del navigator hanno naming e descrizioni sufficientemente chiari.
- La struttura dati risulta stabile e tipizzata correttamente.

#### Dipendenze

- Chiarire il numero reale di step del `Service Navigator`.
- Verificare il componente frontend che consuma questi campi.
- Allineare naming editoriale e naming tecnico dei campi.
- Rigenerare tipi Payload dopo modifiche schema.

## Checklist staging

### Stato operativo

- [x] Commit e push eseguiti su `dev` al commit `73d1521`.
- [x] Branch di promozione creato e pushato: `promote/dev-to-staging-20260316-checkout-attempts-waitlist`.
- [x] PR `promote/dev-to-staging-20260316-checkout-attempts-waitlist` -> `staging` aperta e mergiata.
- [x] Deploy `staging` completato.
- [x] Verifica che staging stia girando sul merge della promozione `a70f0f4` con incluso il fix `3edc9ed`.
- [x] `pnpm migrate:staging`.
- [ ] Verifica migration applicate:
  - [x] `20260315_100500`
  - [x] `20260315_183500`
  - [x] `20260316_110000`
  - [x] `20260316_111500`
  - [x] `20260316_112500`
- [x] `pnpm seed:email-templates`.
- [x] Verifica template `product_waitlist_back_in_stock`.

### Smoke test checkout

- [x] Accesso pubblico a home/shop/product page.
- [x] Checkout prodotto semplice.
- [x] Checkout `payment_element` con successo.
- [x] Verifica success page e materializzazione ordine.
- [x] Test ramo `payment.failed` o pagamento interrotto, con verifica rilascio stock.

### Smoke test waitlist

- [x] Verifica CTA `Waitlist`.
- [x] Da anonimo: redirect a `signin?redirect=...`.
- [x] Da utente autenticato: registrazione waitlist riuscita.
- [x] Verifica waitlist in cart drawer / cart page con checkout disabilitato.
- [ ] Riporta il prodotto disponibile e verifica invio notifica.

### Smoke test auth continuity

- [x] `signin` preserva `redirect`.
- [x] `signup` preserva `redirect`.
- [x] `verify-email` preserva `redirect`.
- [x] Dopo login consentito, ritorno alla product page originaria.

### Check finale

- [ ] Nessun errore applicativo nei log checkout/webhook.
- [ ] Nessun problema su `checkout-attempts`, `product-waitlists`, `shop-webhook-events`.
- [ ] Nessuna dipendenza staging che punti a DB non corretto.

### Log esecuzione

- `2026-03-16`: checklist staging trasformata in formato operativo con check box.
- `2026-03-16`: `pnpm migrate:staging` eseguito con successo.
  - Payload ha chiesto conferma per precedente schema push dinamico su staging; conferma fornita esplicitamente.
  - Applicate in output le migration `20260316_110000`, `20260316_111500`, `20260316_112500`.
- `2026-03-16`: `payload migrate:status` eseguito su staging.
  - Verificate come presenti anche `20260315_100500` e `20260315_183500`.
  - Stato migration staging ora allineato fino a `20260316_112500`.
- `2026-03-16`: seed template staging eseguito con env preview esplicito.
  - `scripts/upsert-email-templates.ts` ha creato `123` template.
  - Verificata in output la creazione di:
    - `product_waitlist_back_in_stock:it:customer`
    - `product_waitlist_back_in_stock:en:customer`
    - `product_waitlist_back_in_stock:ru:customer`
  - Nessun template saltato.
- `2026-03-16`: creato e pushato il branch di promozione `promote/dev-to-staging-20260316-checkout-attempts-waitlist`.
  - URL PR suggerita da GitHub:
    - `https://github.com/Cloudrider25/dob-negozio/pull/new/promote/dev-to-staging-20260316-checkout-attempts-waitlist`
  - Il deploy applicativo su staging resta pendente fino a merge della PR verso `staging`.
- `2026-03-16`: PR di promozione aperta:
  - `https://github.com/Cloudrider25/dob-negozio/pull/75`
  - stato: `OPEN`
  - target: `staging`
  - source: `promote/dev-to-staging-20260316-checkout-attempts-waitlist`
- `2026-03-16`: merge non ancora possibile.
  - `mergeStateStatus`: `BEHIND`
  - il ramo di promozione non e' ancora mergiabile direttamente su `staging`
  - quality gate ha mostrato due blocker:
    - errore schema CI su `product_waitlists_id does not exist` nel run vecchio, coerente con staging non ancora migrato al momento del test;
    - test applicativo reale fallito in `tests/int/checkout-submit-payload.int.spec.ts`
      - aspettativa: `productFulfillmentMode === 'shipping'`
      - risultato ottenuto: `none`
  - finche' i check non sono verdi, il deploy staging applicativo resta pendente.
- `2026-03-16`: correzione applicata sul fail reale `checkout-submit-payload.int.spec.ts`.
  - fix in `src/frontend/page-domains/checkout/shared/checkout-submit.ts`
  - il payload submit ora separa:
    - semantica stretta di `checkout eligibility` per il gating;
    - normalizzazione submit delle righe per il payload finale.
  - `hasProducts` e `hasServices` tornano a derivare dalle righe normalizzate del submit, evitando il falso `productFulfillmentMode = none` nel caso prodotto con quantity non valida ma normalizzata a `1`.
  - verifica locale:
    - `pnpm exec vitest run tests/int/checkout-submit-payload.int.spec.ts --config ./vitest.config.mts` verde.
- `2026-03-16`: PR `#75` mergiata in `staging`.
  - merge commit: `a70f0f4f78210de576c044386eb2c7664d5fdb6e`
  - `origin/staging` aggiornato al merge della promozione.
- `2026-03-16`: workflow `Deploy Staging` partito sul push a `staging`.
  - run: `23141619449`
  - stato corrente verificato:
    - `Install dependencies`: verde
    - `Lint`: verde
    - `Typecheck`: verde
    - `Integration tests`: verde
    - `Build`: verde
  - gli smoke test applicativi su staging restano pendenti fino a deploy completato.
- `2026-03-16`: deploy staging completato.
  - workflow `Deploy Staging` concluso `success`
  - verify job `Verify Staging Build`: verde
  - deploy job `Deploy Staging`: verde
  - il deploy webhook e' stato realmente triggerato e ha restituito job id esterno `AGdg5SfmHnJdDiXxCRoM`
- `2026-03-16`: tentativo di smoke test browser sul deployment URL disponibile da commento Vercel PR.
  - preview URL PR recuperato:
    - `https://dob-negozio-git-promote-dev-t-99f692-alessios-projects-403ec24f.vercel.app`
  - esito:
    - accesso bloccato da `Vercel SSO`
    - redirect a `https://vercel.com/login?...`
- `2026-03-16`: smoke test browser eseguito sul dominio condiviso:
  - URL usato:
    - `https://dob-negozio.vercel.app?_vercel_share=cNsL4W4tnlMo1ai6RnvPUacIkoKS1aPD`
  - verifiche positive:
    - home pubblica raggiungibile;
    - shop pubblico raggiungibile;
    - product page pubblica raggiungibile;
    - product page `Sinecell kit leggings cellulite refill` mostra CTA `Waitlist`;
    - click anonimo su `Waitlist` reindirizza a:
      - `/en/signin?redirect=%2Fen%2Fshop%2Fsinecell-kit-leggings-cellulite-refill`
    - `signin -> signup` preserva `redirect`;
    - `signup -> signin` preserva `redirect`;
    - `verify-email?token=fake-token&redirect=...` espone CTA verso `signin?redirect=...`.
- `2026-03-16`: smoke test browser autenticato completato sul dominio condiviso.
  - credenziali staging usate:
    - `alessio@dobmilano.com`
  - verifiche positive:
    - login riuscito;
    - ritorno automatico alla stessa product page originaria dopo login;
    - click autenticato su `Waitlist` riuscito;
    - cart drawer mostra la sezione `Waitlist`, subtotal `EUR0.00` e checkout disabilitato;
    - cart page `/en/cart` mostra la stessa sezione `Waitlist` e checkout disabilitato.
  - residui effettivi:
    - manca il test di ritorno stock con invio notifica email;
    - manca un test pagamento reale o sandbox guidato per chiudere checkout `payment_element`, success page e `payment.failed`.
- `2026-03-16`: primo smoke test checkout reale avanzato fino al `PaymentElement`.
  - prodotto acquistabile usato:
    - `Delay Infinity Crema Giorno`
  - verifiche positive:
    - inserimento nel carrello riuscito mantenendo la waitlist separata;
    - accesso al checkout riuscito;
    - step `Information` completato;
    - step `Shipping` completato;
    - `PaymentElement` Stripe caricato correttamente.
  - tentativo `success` eseguito con:
    - Visa `4242424242424242`
  - tentativo `failure` eseguito con:
    - Generic decline `4000000000000002`
  - esito reale in entrambi i casi:
    - pagamento non testabile su staging con carte Stripe di test;
    - Stripe risponde con errore:
      - `Your card was declined. Your request was in live mode, but used a known test card.`
    - il checkout resta sulla pagina di pagamento e mostra l'errore utente.
  - conclusione:
    - non e' stato possibile chiudere il ramo `payment_element` success, success page, materializzazione ordine e `payment.failed` per configurazione Stripe staging in `live mode`;
    - per completare questi smoke test serve:
      - staging con chiavi Stripe test, oppure
      - un ambiente sandbox dedicato, oppure
      - una carta reale autorizzata per un test controllato.
- `2026-03-16`: staging Stripe riallineato a sandbox e smoke test checkout completati.
  - tentativo `success` eseguito con:
    - Visa `4242424242424242`
  - esito positivo:
    - pagamento confermato;
    - redirect a success page:
      - `/en/checkout/success?order=DOB-20260316-61324`
    - success page renderizzata correttamente con order reference `DOB-20260316-61324`;
    - area account `Prodotti` aggiornata con il nuovo ultimo acquisto `Delay Infinity Crema Giorno` del `03/16/2026` a `EUR22.00`;
    - il carrello acquistabile e' stato svuotato, lasciando invariata la sola waitlist.
  - tentativo `failure` eseguito con:
    - Generic decline `4000000000000002`
  - esito positivo del test di fallimento:
    - Stripe ha restituito il decline atteso:
      - `Your card was declined.`
    - il checkout e' rimasto sulla pagina pagamento con errore utente visibile;
    - nessun nuovo acquisto e' comparso in area account `Prodotti`;
    - il prodotto acquistabile e' rimasto nel carrello dopo il fallimento, quindi il flusso e' ritentabile.
