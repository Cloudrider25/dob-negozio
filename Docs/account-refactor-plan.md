# Account Refactor Plan


## Direzione approvata

Facciamo un refactor single-file come avevamo già fatto in passato:

- manteniamo `AccountDashboardClient.module.css` unico
- lo riorganizziamo per sezioni (`layout`, `menu`, `products`, `services`, `addresses`, `aesthetic`, `modal`)
- portiamo il file a pattern coerente:
  - base mobile-first
  - un solo blocco desktop `@media (min-width: 1025px)`
- rimuoviamo duplicazioni e regole sparse tra blocchi

Confermo: ci sono pattern ripetuti e conviene estrarre qualche shared component, ma in modo mirato (non mega-refactor).

## Shared già disponibili ma non sfruttati abbastanza

1. `Button`
- già usato in altre parti (`src/components/ui/button`)
- in `AccountDashboardClient.tsx` ci sono tanti `<button>` con `pillButton`/`inlineActionButton` ripetuti
- qui ha senso usare `Button` con varianti coerenti

2. `Input/Select/Textarea`
- li usi già (`src/components/ui/input`), bene
- non vedo gap gravi qui

## Componenti ripetuti che ha senso estrarre

1. `AccountModal` (alto valore)
- oggi hai 3 modali quasi identici:
  - `src/components/account/AccountDashboardClient.tsx:2252`
  - `src/components/account/AccountDashboardClient.tsx:2336`
  - `src/components/account/AccountDashboardClient.tsx:2466`
- stesso wrapper/overlay/header/actions, cambia solo body
- estrazione consigliata: `src/components/account/AccountModal.tsx`

2. `AccountListHeader` (medio valore)
- header colonne ripetuto tra prodotti/servizi:
  - `ordersListHead` e `servicesListHead`
- può diventare piccolo shared interno account

3. `AccountPillButton` / `AccountIconAction`
- classi duplicate e usi multipli:
  - `pillButton` in molti punti
  - `inlineActionButton` in molti punti
- estrazione utile per coerenza e ridurre CSS duplicato

4. `SchedulePill`
- blocco data pill con icone/divider è specialistico ma riusabile nel tab servizi
- oggi è embedded in `renderServiceDataPill`

## Cose che NON estrarrei ora

- `orders/services/addresses/aesthetic` come componenti separati subito: rischio churn alto ora
- `city autocomplete` shared globale: troppo specifico account

## Conclusione pragmatica

Sì, ci sono shared mancanti.
Priorità giusta prima del refactor CSS:

1. `AccountModal`
2. `AccountPillButton` + `AccountIconAction`
3. poi riorganizzazione CSS single-file mobile-first.

## Aggiornamento stato (post modifica modal)

### Completato

1. Servizi: refactor interazioni card
- card servizio singolo full-click (apre modal unico dettagli + cambio data)
- parent pacchetto full-click per expand/collapse
- child sessioni full-click con stesso comportamento del singolo
- rimosse action icon ridondanti nella lista servizi

2. Modal sessioni pacchetto: riduzione ridondanze
- rimossi campi duplicati già presenti nel parent/modal ordine:
  - `Ordine`
  - `Data ordine`
  - `Status`
  - `Prezzo`

3. Lista servizi: rimozione struttura legacy
- rimosso wrapper `servicesTableWrap`
- lista resa solo “stack di card”
- rimosse colonne fantasma (`1fr + 36px`) e regole grid legacy collegate
- `accountSummaryCard` portata a mono-colonna anche nei breakpoint

### Audit CSS residuo da pulire

1. Blocco prodotti/ordini ancora con pattern legacy a colonne
- `ordersListRow` desktop usa ancora 3 colonne (`1.8fr / 140px / 56px`)
- in mobile alcune colonne vengono nascoste con regole positional (`nth-child`)

2. Incoerenza UX cursore su righe cliccabili
- `ordersListRow` in desktop ha `cursor: default` ma la riga è cliccabile

3. Regole fragili da sostituire
- evitare `nth-child` per logica di layout (preferire classi semantiche dedicate)

### Prossimo step operativo

Refactor mirato del blocco `ordersList` con lo stesso criterio già applicato a `servicesList`:
- mobile-first
- niente colonne fantasma
- niente hide via `nth-child`
- aree cliccabili grandi e coerenti con il resto del sito

## Aggiornamento stato (filtri drawer + spacing)

### Completato

1. Nuovo shared component filtri mobile
- creato `src/components/shared/MobileFilterDrawer.tsx`
- creato `src/components/shared/MobileFilterDrawer.module.css`
- comportamento: bottom drawer con slide-up da basso verso alto
- chiusura: tap fuori, pulsante close, tasto `Esc`

2. Account > Servizi
- filtri inline spostati nel drawer
- nella posizione originale ora c’è trigger testuale:
  - label `Sort:`
  - valore filtro corrente cliccabile
- rimosso look “pill” dal trigger filtro (stile testo sottolineato)

3. Account > Prodotti
- aggiunto trigger `Sort` come nei servizi
- drawer con opzioni:
  - Più recenti
  - Meno recenti
  - Totale alto-basso
  - Totale basso-alto

4. Coerenza tipografica pill servizi
- uniformato font-size di `DA DEFINIRE` e `PACCHETTO` con classe intermedia (`typo-small-upper`)

5. Overlay drawer
- rimosso oscuramento pagina dietro il drawer
- mantenuto lock scroll stabile senza jump pagina

6. Spacing verticale coerente
- introdotta variabile `--account-v-gap: 22px`
- applicata ai principali blocchi verticali servizi/prodotti (`summary`, trigger filtri, liste card, gap interni card)

### In corso / Next

1. Refactor `ordersList` (struttura legacy)
- eliminare 3 colonne legacy desktop
- eliminare hide via selector positional `nth-child`
- mantenere UX coerente con nuovo blocco servizi

2. Pulizia CSS finale single-file
- rimuovere regole duplicate non più attive
- consolidare override mobile/desktop

## TODO da non dimenticare (DB review)

- Stato attuale: salvataggio cartella estetica scritto sia su `account-aesthetic-profiles` sia su `anagrafiche` (sync temporaneo).
- Azione futura: durante full review DB scegliere una sola source of truth e rimuovere la duplicazione.
- Decisione suggerita da validare: mantenere solo `anagrafiche` oppure solo `account-aesthetic-profiles` (con relativo piano migrazione dati e cleanup codice/migrazioni).
