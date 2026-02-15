OBIETTIVO
Evolvere “Routine Builder” restando compatibili con lo schema Payload/Drizzle attuale:
1) Routine suggerita (predefinita) in base ai filtri utente.
2) Template/scheletri modulari (base, completa, specifiche) composti da step standard riutilizzabili.
3) Personalizzazione: l’utente parte dalla routine suggerita e può sostituire UNO o PIÙ prodotti per singolo step, mantenendo invariata la struttura.
4) Compatibilità prodotti per step basata su: timing, tipo pelle, need, disponibilità.

STATO REALE DEL PROGETTO (oggi)
Già presenti:
- `routine-templates`
- `routine-template-steps` (ordine + required)
- `routine-template-step-products` (prodotti suggeriti per step)
- `routine-steps`
- `routine-step-rules` (require/forbid/warn per timing/skin type)
- relazioni prodotti: timing, skin type, needs, ecc.

Mancano / da aggiungere:
- **Routine Instance** (salvataggio custom utente) + **Overrides per step**
- Endpoint API per suggerimento + picker prodotti per step
- UI per “Cambia prodotto” step-by-step (override)

COMPORTAMENTO DESIDERATO (UX)
A) Flow standard
- Utente seleziona filtri (timing, tipo pelle, need).
- Sistema restituisce UNA routine suggerita (template + prodotti pre-assegnati).
- UI mostra lista step ordinati, ognuno con prodotto selezionato + CTA “Cambia”.
- “Cambia” apre picker prodotti compatibili, salva override solo per quello step.

B) Edge case
- Se un required step non ha prodotti: mostra placeholder “Seleziona prodotto”.
- Prodotti AM+PM: validi su più timing (M2M).

TEMPLATE MINIMI DA SUPPORTARE (SEEDS)
1) AM_BASE: Cleanser (req), Moisturizer (req), SPF (opt)
2) AM_COMPLETA: Cleanser (req), Toner (opt), Serum (opt), Moisturizer (req), SPF (req)
3) PM_BASE: Makeup Remover (opt), Cleanser (req), Night Cream (req)
4) PM_COMPLETA: Makeup Remover (req), Cleanser (req), Toner (opt), Treatment (opt), Night Cream (req)

NOTA: per “double cleanse” usare due slot distinti: MAKEUP_REMOVER + CLEANSER.

DATABASE (PAYLOAD/DRIZZLE)
Non riscrivere: usare le tabelle esistenti.
Da aggiungere:
1) `routine-instances`
- id, baseTemplateId, userId/sessionId, createdAt/updatedAt
2) `routine-instance-overrides`
- id, instanceId, routineStepId, productId

API (BACKEND)
1) Suggest routine
GET /api/routines/suggest?timing=...&skinType=...&need=...
- usa `routine-templates` + `routine-template-steps` + `routine-template-step-products`

2) Picker prodotti per step
GET /api/routines/step-products?stepId=...&timing=...&skinType=...&need=...

3) Create/update routine instance
POST /api/routines/instances
body: { baseTemplateId, overrides: [{ stepId, productId }] }

UI (FRONTEND)
- Schermata “Routine proposta”: lista step + prodotto + CTA “Cambia”
- Modal/Drawer “Cambia prodotto”: lista prodotti compatibili, salva override
- Stato: baseTemplate + overrides locali

TASK OPERATIVE (PROSSIMI STEP)
1) Definire collections `routine-instances` e `routine-instance-overrides`.
2) Creare endpoint suggest + step-products + instance upsert.
3) UI: “Routine proposta” + “Cambia” per step.
4) Test minimi: selezione routine, override applicati, filtro prodotti compatibili.

CONSTRAINT
- Nessuna logica hardcoded sugli step: ordine/required arrivano da template/steps.
- Migrazioni minime, compatibili con DB/seed attuali.
