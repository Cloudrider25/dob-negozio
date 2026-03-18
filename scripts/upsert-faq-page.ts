import { getPayload } from 'payload'

import config from '../src/payload/config'
import type { Page } from '../src/payload/generated/payload-types'

type FaqGroupItem = NonNullable<NonNullable<Page['faqGroups']>[number]['items']>[number]
type FaqGroup = NonNullable<Page['faqGroups']>[number]
type FaqRichText = NonNullable<FaqGroupItem['a']>
type FaqPageSeedData = Pick<
  Page,
  'pageKey' | 'heroTitleMode' | 'heroStyle' | 'faqTitle' | 'faqSubtitle' | 'faqGroups'
>

const paragraphNode = (text: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  children: [
    {
      type: 'text',
      version: 1,
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      text,
    },
  ],
})

const richTextFromParagraphs = (paragraphs: string[]): FaqRichText =>
  ({
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: paragraphs.filter(Boolean).map(paragraphNode),
    },
  }) as FaqRichText

const faqGroups: FaqGroup[] = [
  {
    label: 'Prodotti',
    title: 'Prodotti',
    items: [
      {
        q: 'A quali tipi di pelle sono adatti i prodotti DOB Milano?',
        a: richTextFromParagraphs([
          'I prodotti presenti nello shop sono selezionati per rispondere a esigenze cutanee diverse. La scelta corretta dipende sempre dal tuo tipo di pelle, dalla sensibilita individuale e dall’obiettivo che vuoi raggiungere.',
          'Se hai dubbi prima dell’acquisto, ti consigliamo di scriverci tramite la pagina Contattaci indicando pelle, routine attuale e risultato desiderato.',
        ]),
      },
      {
        q: 'I prodotti sono adatti anche a pelli sensibili?',
        a: richTextFromParagraphs([
          'Molti prodotti possono essere inseriti anche in routine dedicate a pelli sensibili, ma la tollerabilita resta sempre individuale.',
          'In presenza di cute reattiva, gravidanza, allattamento o trattamenti dermatologici in corso, consigliamo di verificare la composizione completa del prodotto e confrontarti con il tuo specialista di riferimento se necessario.',
        ]),
      },
      {
        q: 'Come faccio a scegliere il prodotto piu adatto a me?',
        a: richTextFromParagraphs([
          'Puoi partire dalle descrizioni prodotto e dalle indicazioni presenti nello shop. Se desideri un orientamento piu preciso, puoi contattarci: ti aiuteremo a capire quali formule sono piu coerenti con i tuoi bisogni e con il tuo percorso in istituto.',
        ]),
      },
      {
        q: 'Se un prodotto non fa per me, cosa posso fare?',
        a: richTextFromParagraphs([
          'Se hai bisogno di assistenza dopo l’acquisto, contattaci indicando numero d’ordine e dettagli del prodotto acquistato.',
          'Ti aiuteremo a verificare la situazione e, se applicabile, a procedere secondo la nostra policy resi e rimborsi.',
        ]),
      },
    ],
  },
  {
    label: 'Spedizioni',
    title: 'Spedizioni',
    items: [
      {
        q: 'Quanto tempo richiede la spedizione?',
        a: richTextFromParagraphs([
          'I tempi di elaborazione e consegna possono variare in base al volume ordini, alla destinazione e al corriere selezionato.',
          'Le tempistiche stimate vengono mostrate durante il checkout e possono essere approfondite nella pagina Spedizioni.',
        ]),
      },
      {
        q: 'Quanto costa la spedizione?',
        a: richTextFromParagraphs([
          'I costi di spedizione vengono calcolati in checkout prima della conferma dell’ordine.',
          'Eventuali soglie per spedizione gratuita o condizioni promozionali vengono mostrate direttamente al momento dell’acquisto.',
        ]),
      },
      {
        q: 'Dove spedite?',
        a: richTextFromParagraphs([
          'Le aree servite e le eventuali limitazioni operative dipendono dalla logistica attiva al momento dell’ordine.',
          'Per il dettaglio aggiornato su destinazioni, costi e tempi di consegna, fai sempre riferimento alla pagina Spedizioni e alle informazioni mostrate in checkout.',
        ]),
      },
      {
        q: 'Ricevero un tracking del mio ordine?',
        a: richTextFromParagraphs([
          'Quando disponibile, inviamo una comunicazione di conferma spedizione con le informazioni utili per seguire il pacco.',
          'Gli aggiornamenti del tracking possono richiedere qualche ora prima di comparire sui sistemi del corriere.',
        ]),
      },
    ],
  },
  {
    label: 'Ordini e pagamenti',
    title: 'Ordini e pagamenti',
    items: [
      {
        q: 'Come posso verificare lo stato del mio ordine?',
        a: richTextFromParagraphs([
          'Se hai creato un account, puoi controllare lo stato dell’ordine dalle aree dedicate del sito quando disponibili.',
          'In alternativa puoi scriverci tramite la pagina Contattaci indicando il numero d’ordine.',
        ]),
      },
      {
        q: 'Quali metodi di pagamento accettate?',
        a: richTextFromParagraphs([
          'I metodi di pagamento disponibili vengono mostrati durante il checkout e possono variare in base al Paese, al dispositivo e al circuito disponibile.',
          'Il pagamento viene gestito da provider tecnici autorizzati e non memorizziamo direttamente i dati completi dello strumento di pagamento.',
        ]),
      },
      {
        q: 'Quando viene addebitato il pagamento?',
        a: richTextFromParagraphs([
          'L’addebito segue le logiche del metodo di pagamento selezionato e avviene secondo i tempi tecnici del provider utilizzato.',
        ]),
      },
      {
        q: 'Perche il mio ordine puo essere stato annullato?',
        a: richTextFromParagraphs([
          'Un ordine puo essere annullato in caso di indisponibilita del prodotto o del servizio, dati incompleti o non corretti, errore evidente di prezzo oppure controlli antifrode e sicurezza.',
          'Se un importo e gia stato autorizzato o addebitato, il rimborso viene disposto secondo i tempi tecnici del circuito utilizzato.',
        ]),
      },
    ],
  },
  {
    label: 'Resi e rimborsi',
    title: 'Resi e rimborsi',
    items: [
      {
        q: 'Qual e la vostra policy di reso?',
        a: richTextFromParagraphs([
          'Se acquisti come consumatore, puoi esercitare il diritto di recesso nei casi previsti dalla legge e secondo quanto indicato nella pagina Resi e rimborsi e nei Termini e condizioni.',
          'Per aprire una richiesta, contattaci indicando numero d’ordine, prodotti coinvolti e motivo della richiesta.',
        ]),
      },
      {
        q: 'Chi paga il costo della restituzione?',
        a: richTextFromParagraphs([
          'Salvo diversa indicazione o promozione specifica, il costo diretto della restituzione resta a carico del cliente.',
        ]),
      },
      {
        q: 'Quando ricevero il rimborso?',
        a: richTextFromParagraphs([
          'Una volta ricevuta e verificata la richiesta di reso, il rimborso viene disposto nei tempi previsti dalla normativa applicabile e dalla nostra policy.',
          'Le tempistiche effettive di riaccredito dipendono poi anche dal circuito di pagamento utilizzato.',
        ]),
      },
      {
        q: 'Ci sono prodotti esclusi dal reso?',
        a: richTextFromParagraphs([
          'Alcune categorie possono essere escluse dal diritto di recesso, ad esempio beni personalizzati oppure prodotti sigillati aperti dopo la consegna quando non restituibili per motivi igienici o di tutela della salute.',
          'Per il dettaglio completo fa fede quanto indicato nei Termini e condizioni.',
        ]),
      },
    ],
  },
  {
    label: 'Contattaci',
    title: 'Contattaci',
    items: [
      {
        q: 'Come posso contattare il team DOB Milano?',
        a: richTextFromParagraphs([
          'Puoi scriverci tramite la pagina Contattaci usando il form dedicato. Se la richiesta riguarda un ordine, inserisci sempre il numero d’ordine per velocizzare la gestione.',
        ]),
      },
      {
        q: 'Per quali richieste posso usare il form contatti?',
        a: richTextFromParagraphs([
          'Il form e pensato per domande su prodotti, ordini, spedizioni, resi, servizi, disponibilita e assistenza generale.',
        ]),
      },
      {
        q: 'Posso allegare immagini o documenti?',
        a: richTextFromParagraphs([
          'Si. Nel form contatti puoi allegare immagini utili alla tua richiesta, entro i limiti indicati nell’interfaccia.',
        ]),
      },
      {
        q: 'In quanto tempo ricevero una risposta?',
        a: richTextFromParagraphs([
          'Gestiamo le richieste nel piu breve tempo possibile, in base al volume operativo del momento. Ti consigliamo di inviare una sola richiesta completa per evitare rallentamenti nella presa in carico.',
        ]),
      },
    ],
  },
]

async function run() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    locale: 'it',
    where: {
      pageKey: {
        equals: 'faq',
      },
    },
  })

  const pageData: FaqPageSeedData = {
    pageKey: 'faq',
    heroTitleMode: 'fixed',
    heroStyle: 'style1',
    faqTitle: 'FAQ',
    faqSubtitle:
      'Le domande piu frequenti su prodotti, spedizioni, ordini, resi e assistenza.',
    faqGroups,
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data: pageData,
      locale: 'it',
      overrideAccess: true,
      draft: false,
    })

    console.log(`updated faq page: ${existing.docs[0].id}`)
    return
  }

  const created = await payload.create({
    collection: 'pages',
    data: pageData,
    locale: 'it',
    overrideAccess: true,
    draft: false,
  })

  console.log(`created faq page: ${created.id}`)
}

await run()
