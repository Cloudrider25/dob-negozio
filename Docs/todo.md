# Service page data requirements (iterativo)

## Sezione 1 — Hero (colonna sinistra + destra)
- Titolo servizio (name)
- Tagline (tagline)
- Badge (badge): scelta da lista con dropdown, non obbligatoria
- Descrizione breve (shortDescription, max 2 righe)
- [AGGIUNTA] Tipo servizio per badge (serviceType: single | package)
- Immagine principale (heroImage: url + alt)
- Gallery thumbnails (gallery: array immagini + eventuale video thumb)
- Pacchetti dello stesso servizio (servicePackages: array di { title, slug })
- CTA principale (primaryCtaLabel + primaryCtaHref), all interno del cta prenota nome del prodotto e prezzo.
se user clicca su pacchetto aggiorno nome e prezzo
- Percorsi di cui il servizio fa parte (servicePaths: array di { title, slug, thumb? })
- [AGGIUNTA] Servizi correlati (relatedServices: array di { title, slug }) filtrati per stessa category
- [AGGIUNTA] Cross-sell (crossSellService: { title, slug, image? }) filtrato per category diversa

Nota sviluppo futuro:
- Rating medio e numero recensioni (ratingValue, ratingCount)

## Sezione 1 — Accordion (nuova tassonomia)
1) Risultati attesi
   - Campo CMS: results / benefitsService
   - Contenuto: testo breve + bullet opzionali
   - Focus: outcome realistico, tempi indicativi, progressi
   - Struttura: 1–2 frasi “promise” + 3–6 bullet

2) Aree trattate e indicazioni
   - Campo CMS: indications / areasAndUseCases
   - Contenuto: testo unico
   - Focus: aree applicabili + esigenze + eventuali limitazioni
   - Struttura suggerita: “Trattamento indicato per ___, ideale per ___, applicabile su ___ (aree). Valutazione iniziale necessaria per ___.”

3) Tecnologia e protocollo
   - Campo CMS: techProtocolShort / keyTech
   - Contenuto: testo breve (1–3 righe) con 2–4 pillole chiave
   - Include (scegli 2–4):
     • Tecnologia/Metodo
     • Parametri/protocollo (durata, frequenza, range sedute)
     • Personalizzazione (diagnosi, settaggi, mappatura)
     • Comfort & sicurezza (raffreddamento, sensori, linee guida)

4) Downtime (testo libero)
   - Campo CMS: downtime
   - Contenuto: testo libero su tempi/effetti post‑trattamento


## Sezione 2 — Video full‑width
- Video URL (videoEmbedUrl / videoUrl)
- Poster fallback (videoPoster: url + alt)
- Opzionale: titolo/accessibility label (videoAriaLabel)

## Sezione 3 — “What’s included / Inside the protocol”
1) Immagine
   - Campo: insideImage (url + alt)
   - Uso: visual “macro” della tecnologia o della fase (manipolo, cabina, texture di luce, skin scan, before/after astratto)
   - Alt template: “Dettaglio del protocollo [SERVIZIO] – fase [X]”

2) Label verticale
   - Campo: insideLabel
   - Default consigliato: “WHAT’S INCLUDED” oppure “INSIDE THE PROTOCOL”
   - “what’s inside” ok ma meno coerente coi servizi

3) Testo intro
   - Campo: insideLead
   - Contenuto: 2–3 righe su cosa include la seduta + perché è diverso (personalizzazione/diagnosi/protocollo)
   - Template: “Non è una seduta singola: è un protocollo guidato. Ogni step è calibrato su obiettivo, zona e risposta della pelle.”

4) Blocco 1
   - Campi: insideBlock1Title, insideBlock1Body
   - Ruolo: Step 1 = Diagnosi + settaggio (o preparazione)
   - Titoli possibili: “Skin / Body Check”, “Mappatura & Settaggio”, “Prep intelligente”

5) Blocco 2
   - Campi: insideBlock2Title, insideBlock2Body
   - Ruolo: Step 2 = Trattamento + follow‑up (o post‑care)
   - Titoli possibili: “Protocollo in cabina”, “Trattamento mirato”, “Post‑care & Progress”
   - Variante percorso: “In‑salon protocol” + “Home routine + check‑in”

6) Nota finale
   - Campo: insideNote
   - Uso: 1 riga su variabilità/sicurezza/range sedute senza promesse assolute
   - Template: “Numero sedute e frequenza dipendono da fototipo, area e obiettivo: la prima consulenza definisce il piano.”

7) CTA pill
   - Campi: insideCtaLabel, insideCtaHref
   - Label consigliate: “Full protocol details”, “See treatment plan”, “Tech specs & safety”, “All steps explained”
   - Link/anchor: sezione “Protocol”, “FAQ”, “Safety” o “Percorso completo”

Naming finale consigliato:
- insideLabel (default: “WHAT’S INCLUDED”)
- insideLead
- insideBlocks (array di 2 oggetti: { title, body })
- insideNote
- insideCta ({ label, href })

Esempio copy (riutilizzabile):
- insideLead: “Dentro ogni seduta c’è un protocollo: valutazione, settaggi su misura e step sequenziali per massimizzare risultati e comfort.”
- Block 1: “Assessment & setup” — “Analizziamo zona e obiettivo, definiamo parametri e priorità del percorso.”
- Block 2: “Targeted treatment + aftercare” — “Esecuzione guidata in cabina e indicazioni post‑trattamento per mantenere continuità.”
- insideNote: “Protocollo personalizzato: durata e frequenza variano in base alla risposta individuale.”
- CTA: “Full protocol details” → #protocol

## Sezione 4 — FAQ / Q&A
1) Titolo sezione
   - Campo: faqTitle
   - Default: “FAQ”
   - Alternative premium: “Questions, answered”, “Everything you need to know”

2) Sottotitolo
   - Campo: faqSubtitle
   - Template:
     • “Scopri come funziona il percorso [SERVIZIO] e cosa aspettarti.”
     • “Risposte rapide su risultati, comfort, tempi e sicurezza.”
     • “Dalla prima consulenza alla routine: ecco cosa sapere.”

3) Lista domande
   - Campo: faqQuestions (array stringhe)
   - Nota: consigliato supporto risposte in CMS → faqItems: [{ q, a }]
   - Set base (riutilizzabile):
     1. “Per chi è indicato questo trattamento?”
     2. “Quante sedute servono e ogni quanto?”
     3. “Quando vedrò i primi risultati?”
     4. “È doloroso? Che sensazione si prova?”
     5. “Ci sono controindicazioni o periodi in cui è meglio evitarlo?”
     6. “Quanto dura una seduta e cosa succede durante?”
     7. “Cosa devo fare prima e dopo il trattamento?”
     8. “Posso combinarlo con altri trattamenti nel percorso?”
     9. “Come si personalizza su zona/obiettivo/pelle?”
     10. “Qual è la differenza rispetto a alternative più economiche?”
     11. “È adatto a uomini/donne e a quali aree?”
     12. “Quanto costa e come funziona il piano (singola seduta vs pacchetto)?”
   - Add‑on laser/tecnologie (se serve):
     • “Funziona su tutti i fototipi?”
     • “Che differenza c’è tra laser e ceretta (breve vs lungo periodo)?”

4) Immagine laterale
   - Campo: faqImage (url + alt)
   - Scelte immagine:
     • Dettaglio cabina + luce (premium/clean)
     • Close‑up manipolo/tecnologia
     • Skin scan/diagnosi (astratto)
     • Ritratto editoriale calm
   - Alt template:
     • “Cabina DOB – protocollo [SERVIZIO]”
     • “Dettaglio tecnologia [SERVIZIO] in trattamento”

Consiglio UX:
- 8–10 domande per pagina
- Ordine: safety/comfort → risultati/tempi → logistica/prezzo → combinazioni

## Sezione 5 — Service Carousel (post‑FAQ)
- Lista servizi (services: titolo, slug, immagine, eventuale tagline)
- CTA per card (ctaLabel: es. “Scopri”)
- Titolo sezione opzionale (servicesCarouselTitle)
- [AGGIUNTA] Dati card: description, price, duration, serviceType (per tag e pricing)

## Sezione 6 — Protocol / Treatment Reveal  ( dati da parent treatment)
- Card primaria: title (treatments.boxName), body (treatments.description | boxTagline), image (treatments.heroImage | cardMedia)
- Card secondaria: obiettivo = dare allo user una valida alternativa al servizio visualizzato
- Alternative treatments: implementare query per trovare alternative valide (es. mappatura per area/uso)
- Fallback testo quando la query non ritorna alternative: “il servizio scelto è unico nel suo genere e non ha alternative”
- Rail labels: lista testuale con default statico + alternative risultanti dalla query
- [DA DEFINIRE] Campi CMS necessari per calcolare e mostrare le alternative (treatments/servizi)

## Campi Payload necessari per far funzionare la pagina
### Collection: services
- name (text, required)
- slug (text, unique, required)
- active (checkbox)

#### Sezione 1 — Hero + Accordion
- description (textarea | richText) → shortDescription
- tagline (text, optional)
- badge (select, optional)
- serviceType (select: single | package)
- price (number, optional)
- duration (text | number, optional)
- [MEDIA] gallery (array di media: immagini o video) = thumbnails + hover slider
  - uno degli item marcato come cover (isCover) = default image service detail + slide from bottom on carousel
- results / benefitsService (richText | textarea)
- indications / areasAndUseCases (textarea)
- techProtocolShort / keyTech (textarea)
- downtime (text)
- accordionCtaLabel (text) + accordionCtaHref (text)

#### Sezione 2 — Video
- videoEmbedUrl (text, YouTube/Vimeo embed)
- videoUpload (upload → media)

#### Sezione 3 — What’s included
- includedLabel (text) - usiamo default hardcoded " whats's included"
- includedLead (textarea)
- includedBlocks (array: { title (text), body (textarea) })
- includedNote (text)
- includedCtaLabel (text) + includedCtaHref (text)

#### Sezione 4 — FAQ
- faqTitle (text)
- faqSubtitle (text)
- faqItems (array: { q (text), a (textarea | richText) })
- faqMedia (media) = immagine laterale

#### Sezione 5 — Service Carousel
- Nessun campo (titolo non previsto)

### Media usage per sezione (approccio attuale)
- Sezione 1: cover + gallery (tutte immagini/video)
- Sezione 2: videoUrl oppure videoUpload
- Sezione 3: immagine scelta da gallery
- Sezione 4: immagine scelta da gallery
- Sezione 5: data da treatment (non rilevante qui)
- Sezione 6: data da other service (non rilevante qui)
