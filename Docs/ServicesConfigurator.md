# DOB — Services Configurator (Service Navigator)

## Obiettivo
Trasformare la pagina **Servizi** in un’esperienza **guided luxury-tech**: l’utente non naviga un listino, ma compone un **percorso**.

- Riduce indecisione e rumore
- Aumenta percezione premium (stile configuratore automotive/tech)
- Mantiene tutto fluido (no page reload)
- Supporta fallback “non so cosa scegliere” (Skin Analyzer + Consulenza)

---

## Concept & Copy

### Headline (scegli 1)
1. **Scegli il risultato. Al resto pensiamo noi.**
2. **Percorsi guidati. Risultati misurabili.**
3. **Un metodo. Infinite combinazioni.**
4. **Dalla scelta rapida alla strategia completa.**

### Subheadline
**Seleziona l’area, definisci l’obiettivo, scopri i trattamenti più adatti.**  
In alternativa: **Skin Analyzer (Derma Test) + Consulenza**.

### CTA
- Primaria: **Esplora servizi** / **Prenota ora**
- Secondaria (sempre visibile): **Skin Analyzer (Derma Test) & Consulenza**

---

## Architettura UX (Guidata e Fluida)

### Step 1 — Area
Ingressi principali (sempre):
- **Epilazione**
- **Viso**
- **Corpo**
- **Massaggi**

- **Epilazione** → *skip obiettivo* (scelta diretta laser/ceretta premium)
- **Massaggi** → obiettivo semplificato (opzionale)
- **Viso / Corpo** → **obiettivo obbligatorio** (filtra e guida)

### Step 3 — Tecnologia / Trattamento
Mostra solo opzioni compatibili con **Area + Obiettivo**.

### Step 4 — Servizio Finale + Prenotazione
Card finale con:
- riepilogo percorso
- durata
- prezzo (o “da…”) / pacchetti
- CTA prenota

---

## Layout a Colonne (Desktop)

### Regola
- **Epilazione / Massaggi** = 2 colonne
- **Viso / Corpo** = 3 colonne

### Struttura
- **Colonna A (sempre):** Area
- **Colonna B (condizionale):** Obiettivo (solo Viso/Corpo)
- **Colonna C:** Trattamenti compatibili
- **Side Preview (sempre):** riepilogo + CTA

### Preview dinamica (micro-interazione)
Su hover/focus mostra:
- **Risultato**
- **Tecnologia**
- **Tempo**

---

## Service Navigator — “Stack Navigation” (animazione premium)

### Idea
Quando l’utente seleziona un item, il layout si comporta come uno **stack**:
- la colonna precedente scivola fuori
- la successiva viene “promossa”
- entra la nuova colonna da destra

### Animazioni (naming)
- `exitLeft`: opacity 1→0, x 0→-24
- `promoteLeft`: x 0→-(colWidth + gap)
- `enterRight`: opacity 0→1, x +24→0

Suggerito: Framer Motion + AnimatePresence (o equivalente).

---

## Path Finale (firma DOB)
A fine scelta (step `final`) mostra:
- breadcrumb visuale con nodi e linea glowing

Esempio:
**Viso → Illuminare → HydraGlow Signature → 45’**

CTA:
- **Prenota ora**
- **Skin Analyzer (Derma Test) / Consulenza** (secondaria)

Back UX:
- **Indietro** (torna allo step precedente)
- **Modifica percorso** (torna allo start mantenendo selezioni evidenziate)

---

## Fallback “Non so cosa scegliere”
Presente in ogni step (non solo all’inizio):
**“Non sai cosa scegliere? Ti guidiamo con Skin Analyzer (Derma Test) + Consulenza.”**

Opzionale: dopo 6–8s di inattività, hint soft:
- “Vuoi una selezione consigliata?”
- CTA: Skin Analyzer (Derma Test) / Consulenza

---

## Tassonomia (Macro → Goal → Trattamenti → Servizi)

### A) EPILAZIONE (no goal)
- Laser — **MeDioStar® Red Edition**
- Ceretta **Elastique** (elastiche premium)

**Servizi finali (step 3):**
- MeDioStar® Red Edition: zone (Viso/Corpo) + pacchetti 3/6/10
- Elastique: zone (Viso/Corpo)

Esempio zone:
- Viso: Labbro, Mento, Guance, Collo
- Corpo: Ascelle, Inguine, Gambe, Braccia, Schiena, Petto, Addome

#### Elastique — punti chiave (fornitore)
Metodo **Elastique Brazilian Waxing** (ceretta elastica premium): esperienza delicata, rapida e altamente precisa.

**Highlights (per UI badge):**
- Formula **ipoallergenica**
- **Bassa temperatura**
- Applicazione con spatola, **senza strisce**
- Strappo **multidirezionale**
- **Made in Italy**
- Approccio **no waste**

**Protocollo in 5 step (card “Metodo”):**
1) Detersione pre-cera
2) Polvere assorbente
3) Epilazione ipoallergenica
4) Idratazione post epilazione
5) Mantenimento Body Home

**Microcopy consigliato (DOB tone):**
**Elastique — ceretta elastica ipoallergenica, delicata e ad alta precisione.**  
Senza strisce, a bassa temperatura, con protocollo completo pre/post.

#### MeDioStar® Red Edition — punti chiave (macchinario)
Tecnologia laser professionale ad alte prestazioni progettata per trattamenti **rapidi**, **confortevoli** e **sicuri** su un’ampia gamma di fototipi e tipologie di pelo.

**Highlights (per UI badge):**
- Sistema sinergico **808 + 1060 nm**
- **5.000 W** di potenza
- Spot **3 cm²**
- Velocità fino a **20 Hz**
- Impulso fino a **3 ms**
- Trattamenti efficaci anche su **fototipi IV–VI** e su **pelli abbronzate**

**Comfort & igiene (differenzianti DOB):**
- **Basta gel**: scorrimento ottimizzato con soluzione dedicata (effetto detersione + idratazione, senza residui)
- Protezioni igieniche **monouso** per massima attenzione al cliente

**Microcopy consigliato (DOB tone):**
**MeDioStar® Red Edition — epilazione laser ad alta precisione, veloce e confortevole, anche su fototipi più scuri e pelle abbronzata.**



---

### B) MASSAGGI (goal semplificato)
**Obiettivi (step 2):**
- Relax
- Decontrattura
- Drenaggio
- Recovery

**Trattamenti (step 3):**
- Relax: Aromatico / Candle / Anti-stress
- Decontrattura: Deep Tissue / Schiena Focus / Cervicale
- Drenaggio: Linfodrenante / Gambe leggere
- Recovery: Sport / Defaticante

**Servizi finali (step 4):**
- 30’ / 50’ / 75’
- Full body / Focus zona

---

### C) VISO (goal obbligatorio)

#### Obiettivi Viso (step 2)
- **Lifting**
- **Rimpolpare**
- **Rassodare**
- **Defaticare**
- **Tonificare**
- **Esfoliare**
- **Illuminare**

- Manuale + Prodotti
- Hydrafacial
- **Aqua Fusion Plus** (Overline Infinity)
- Ultrasuoni
- Radiofrequenza

#### Aqua Fusion Plus — punti chiave (macchinario)
Protocollo viso multi‑tecnologia che combina **detersione profonda**, **esfoliazione**, **infusione attivi** e **stimolazione** per lavorare su impurità, disidratazione, rossori e discromie.

**Highlights (per UI badge):**
- **Check‑Up Macro‑Cam** (valutazione iniziale visiva)
- **Micro Dermoabrasione Diamantata** con infusione di peeling specifico
- **Radiofrequenza + EMS** (sinergia diatermica + microcontrazione)
- **Derma Infusion** (correnti dinamiche per trasporto principi attivi)
- **Maskin Pro** + “cromo benessere” (assorbimento Booster, effetto illuminante)

**Inestetismi target (copy pulito):**
- Lassità · Discromie · Impurità · Rossori · Disidratazione

**Microcopy consigliato (DOB tone):**
**Aqua Fusion Plus — laboratorio viso ad alta efficacia per purificare, rinnovare e illuminare la pelle.**

#### Mappa Goal → Trattamenti consigliati → Servizi finali

**1) Lifting**
- Consigliati: Radiofrequenza + Manuale
- Finali:
  - `RF Lift Visage` (30’)
  - `RF Lift Visage + Manuale Sculpt` (50’)

**2) Rimpolpare**
- Consigliati: Ultrasuoni + Prodotti + Manuale
- Finali:
  - `Plump Booster Ultrasuoni` (30’)
  - `Plump Ritual Manuale + Booster` (50’)

**3) Rassodare**
- Consigliati: Radiofrequenza + Ultrasuoni
- Finali:
  - `Firming RF` (30’)
  - `Firming Duo RF + Ultrasuoni` (50’)

**4) Defaticare**
- Consigliati: Manuale + Ultrasuoni (delicato)
- Finali:
  - `De-stress Facial Reset` (30’)
  - `Drain & Calm Ritual` (50’)

**5) Tonificare**
- Consigliati: Manuale + Radiofrequenza (leggera)
- Finali:
  - `Tone Activation` (30’)
  - `Tone Activation + RF` (50’)

**6) Esfoliare**
- Consigliati: Aqua Fusion Plus
- Finali:
  - `AquaClean Signature` (45’)
  - `AquaClean Deep` (60’)

**7) Illuminare**
- Consigliati: Aqua Fusion Plus + Ultrasuoni
- Finali:
  - `AquaGlow Signature` (45’)
  - `AquaGlow + Booster Ultrasuoni` (60’)

---

### D) CORPO (goal obbligatorio)

#### Obiettivi Corpo (step 2)
- **Anticellulite**
- **Rimodellante**
- **Drenante**
- **Riduzione smagliature**
- **Segni e cicatrici**
- **Rassodante**
- **Tonificante**
- **Relax**
- **Post-gravidanza**

#### Trattamenti disponibili (step 3)
- **Icoone** (core)
- Massaggio drenante / rilassante (add-on o alternativa)

#### Icoone — punti chiave (fornitore)
Icoone® è una tecnologia non invasiva per il corpo basata su **microstimolazione brevettata Roboderm®**, progettata per agire in profondità sul tessuto connettivo e migliorare drenaggio e qualità della pelle.

**Highlights (per UI badge):**
- Microstimolazione brevettata **Roboderm®**
- Fino a **21.600 microstimolazioni/min** (manipoli “twins”)
- Stimolo di **microcircolazione** e **drenaggio linfatico**
- Approccio **naturale**, **non invasivo**
- Programmi personalizzabili per diverse esigenze

**Focus risultati (per obiettivi corpo):**
- Cellulite e adiposità localizzate (rimodellamento)
- Drenaggio e leggerezza
- Texture cutanea (smagliature / compattezza)

**Microcopy consigliato (DOB tone):**
**Icoone — microstimolazione ad alta precisione per rimodellare, drenare e migliorare la qualità della pelle.**

#### Mappa Goal → Trattamenti consigliati → Servizi finali

**Anticellulite**
- Consigliati: Icoone
- Finali:
  - `Icoone Cell-Tech` (45’)
  - `Icoone Cell-Tech Focus Zone` (30’)

**Rimodellante**
- Consigliati: Icoone
- Finali:
  - `Icoone Shape Sculpt` (45’)
  - `Icoone Shape Sculpt Intensive` (60’)

**Drenante**
- Consigliati: Icoone + (opzionale) Linfodrenante
- Finali:
  - `Icoone Drain Pro` (45’)
  - `Drain Pro + Linfo Legs` (60’)

**Riduzione smagliature**
- Consigliati: Icoone focus tessuti
- Finali:
  - `Icoone Texture Repair` (45’)
  - `Texture Repair Focus` (30’)

**Segni e cicatrici**
- Consigliati: Icoone focus
- Finali:
  - `Icoone Scar & Texture` (45’)

**Rassodante**
- Consigliati: Icoone
- Finali:
  - `Icoone Firm Lift` (45’)
  - `Firm Lift Intensive` (60’)

**Tonificante**
- Consigliati: Icoone + manualità attivante
- Finali:
  - `Icoone Tone Activation` (45’)

**Relax**
- Consigliati: Massaggio Relax
- Finali:
  - `Relax Ritual` (50’)
  - `Deep Relax` (75’)

**Post-gravidanza**
- Consigliati: drenaggio + rimodellamento progressivo
- Finali:
  - `Postpartum Reset` (50’)
  - `Postpartum Drain & Shape` (60’)

---

## Microcopy Premium (1 riga per obiettivo)

### Viso
- **Lifting** — Ridefinisce i contorni e aumenta la compattezza con tecnologia mirata.
- **Rimpolpare** — Effetto pelle piena: densità, comfort e luminosità.
- **Rassodare** — Migliora elasticità e tono con un approccio progressivo.
- **Defaticare** — Riduce segni di stress e gonfiori, per un viso più disteso.
- **Tonificare** — Attiva microcircolo e texture per una pelle più viva.
- **Esfoliare** — Leviga, purifica e rinnova: pelle pulita e uniforme.
- **Illuminare** — Glow immediato, grana raffinata, incarnato più omogeneo.

### Corpo
- **Anticellulite** — Azione mirata sull’aspetto dei tessuti e sulla pelle a buccia d’arancia.
- **Rimodellante** — Ridefinisce volumi e proporzioni con protocolli ad alta efficacia.
- **Drenante** — Leggerezza immediata: stimolo linfatico e riduzione ristagni.
- **Riduzione smagliature** — Migliora la qualità della pelle e l’uniformità visiva dei segni.
- **Segni e cicatrici** — Lavora sulla texture per una pelle più compatta e omogenea.
- **Rassodante** — Migliora tono e compattezza con focus sulle zone critiche.
- **Tonificante** — Più definizione e reattività, con risultati progressivi.
- **Relax** — Un reset completo: rilascio tensioni e benessere profondo.
- **Post-gravidanza** — Recupero graduale: drenaggio, tono e rimodellamento in sicurezza.

---

## Mobile (stack a schermo intero)
- Step 1 fullscreen (Area)
- Step 2 fullscreen (Goal, solo Viso/Corpo)
- Step 3 fullscreen (Trattamento)
- Step 4 bottom-sheet (prenota)

Breadcrumb sticky in alto.

---

## Component Tree (dev)

`<ServiceNavigatorSection>`
- `<NavigatorHeader />`
- `<NavigatorGrid>`
  - `<ColumnArea />`
  - `<ColumnGoal />` (condizionale)
  - `<ColumnTreatment />`
  - `<SidePreview />`
- `<PathBreadcrumb />`

---

## State Model (dev)

- `step = "area" | "goal" | "treatment" | "final"`
- `selectedArea`
- `selectedGoal?`
- `selectedTreatment?`
- `selectedService?`

Regole:
- `epilazione` → skip goal
- `massaggi` → goal opzionale
- `viso/corpo` → goal obbligatorio