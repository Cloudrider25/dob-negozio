# DB Timing Fix – Analisi & Proposta A (slots)

## 1) Stato attuale DB (Docker)

**timing_products (it)**
- 1 → **Mattutina** (`mattutina`)
- 2 → **Serale** (`serale`)
- 4 → **Trattamento mirato** (`trattamento-mirato`)
- 5 → **Solare** (`solare`)

**Relazioni prodotti → timing (products_rels, path = timingProducts)**
- Distinti timing usati: **3**
- Distribuzione relazioni:
  - `serale` → **38**
  - `mattutina` → **37**
  - `trattamento-mirato` → **10**
  - `solare` → **0**

**Osservazione**
La classificazione legacy **Giornaliera (AM+PM)** è stata rimossa; ora i prodotti possono avere più timing (Mattutina + Serale) o slot dedicati (Trattamento mirato / Solare).

---

## 2) Proposta A – Timings come “slots”

### Nuovi valori (timing-products)
- **Mattutina**
- **Serale**
- **Trattamento mirato** (slug: `trattamento-mirato`) ← sostituisce “Speciale”
- **Solare (SPF)** (slug: `solare`)

### Cambiamento concettuale
- **Rimuovere** “Giornaliera (AM + PM)”.
- Prodotti adatti sia AM che PM → **taggare Mattutina + Serale** (M2M già supportata).
- “Trattamento mirato” per prodotti fuori logica base.
- “Solare (SPF)” per prodotti strettamente diurni / protezione solare.

---

## 3) Migrazione dati (operativa)

### Step A — Creazione/aggiornamento valori timing-products
- Eliminare “Giornaliera (AM+PM)”.
- Aggiungere **Trattamento mirato** e **Solare**.

### Step B — Retag dei prodotti “Giornaliera”
- Tutti i prodotti con `giornaliera-am-pm` → **riclassificare** in base all’uso reale:
  - se valido AM+PM → **Mattutina + Serale**
  - se trattamento specifico → **Trattamento mirato**
  - se SPF/solare → **Solare**

**Nota:** la riclassificazione può essere automatizzata con keyword (slug/titolo) e poi rifinita manualmente.

### Step B.1 — Tabella di mapping (da compilare manualmente dove serve)

| Prodotto (id/nome) | Timing attuale | Nuovo timing | Note |
|---|---|---|---|
| 5 — Rehydra New Latte dettergete idratanrte 200ml | giornaliera-am-pm |  |  |
| 6 — Youth Serum 30 ml | giornaliera-am-pm |  |  |
| 7 — Cream Cleanser 120 ml | giornaliera-am-pm |  |  |
| 10 — Rehydra New tonico idratante 200ml | giornaliera-am-pm |  |  |
| 11 — Cleansing Complex 180 ml | giornaliera-am-pm |  |  |
| 14 — Rehydra New Maschera Viso idratante minerale 75ml | giornaliera-am-pm |  |  |
| 17 — Pro-Heal Serum Advanced 15ml | giornaliera-am-pm |  |  |
| 18 — Rehydra New Scrub Viso idratante 75ml | giornaliera-am-pm |  |  |
| 19 — Hydra-Cool Serum 15 ml | giornaliera-am-pm |  |  |
| 20 — Rehydra New Crema idratante 100h 50ml | giornaliera-am-pm |  |  |
| 22 — Rehydra New Crema idro nutriente 50ml | giornaliera-am-pm |  |  |
| 23 — Reparative Moisture Emulsion 50g | giornaliera-am-pm |  |  |
| 24 — Moisturazing Complex 50g | giornaliera-am-pm |  |  |
| 25 — Rehydra New Contorno occhi idratante 15ml | giornaliera-am-pm |  |  |
| 26 — Eye Complex 15g | giornaliera-am-pm |  |  |
| 27 — Rehydra New Mousse Dettergente Idratante 150ml | giornaliera-am-pm |  |  |
| 28 — Rehydra New Siero concentrato idratante 30ml | giornaliera-am-pm |  |  |
| 29 — Youth Eye Complex 15g | giornaliera-am-pm |  |  |
| 30 — C Eye Serum Advanced 15ml | giornaliera-am-pm |  |  |
| 31 — Fuoco Riducente Ridensificante Corpo 200ml | giornaliera-am-pm |  |  |
| 32 — Fuoco Crema Zona Critiche 200ml | giornaliera-am-pm |  |  |
| 33 — Fuoco Riducente sculpting booster 100ml | giornaliera-am-pm |  |  |
| 34 — 75.25 Doppia Dettersione Longevity 150ml | giornaliera-am-pm |  |  |
| 35 — 75.25 Scrub fondente Longevity 80ml | giornaliera-am-pm |  |  |
| 37 — 75.25 pre-siero tonico longevity 100 ml | giornaliera-am-pm |  |  |
| 41 — 75.25 labbra e contorno longevità 20ml | giornaliera-am-pm |  |  |
| 42 — 75.25 perfezionatore viso longevity 15ml | giornaliera-am-pm |  |  |
| 43 — 75.25 Contorno occhi Longevity | giornaliera-am-pm |  |  |
| 45 — 75.25 Kit Trattamento intensivo longevity | giornaliera-am-pm |  |  |
| 50 — Sinecell creme cellulite tonificante corpo 250ml | giornaliera-am-pm |  |  |
| 51 — Sinecell criogel ultra gambe 150ml | giornaliera-am-pm |  |  |
| 52 — Delay Dettergente Viso Age Proof 150ml | giornaliera-am-pm |  |  |
| 53 — Delay Infinity Contorno occhi e labbra + Lipstic 30ml | giornaliera-am-pm |  |  |
| 54 — Delay Infinity Siero Viso Retinolo 30ml | giornaliera-am-pm |  |  |
| 58 — Equilibrium Struccante occhi e labra 125ml | giornaliera-am-pm |  |  |
| 59 — Sinecell Bende Salino Drenanti | giornaliera-am-pm |  |  |
| 60 — Sinecell Bende Thermo Riducenti | giornaliera-am-pm |  |  |
| 61 — Booster Viso Niacinamide Glycogen 30 ml Rughe | giornaliera-am-pm |  |  |
| 62 — Booster Viso Vitamin C + Alpha Arbutin age care macchie | giornaliera-am-pm |  |  |
| 63 — Booster Viso Vitamin B12 + Resveratol | giornaliera-am-pm |  |  |
| 64 — Delay Infinity fiala age proof (10x1,5) | giornaliera-am-pm |  |  |
| 65 — Rehydra Fiala Acido Ilauronico (10x 1.5) | giornaliera-am-pm |  |  |
| 67 — Sinecell Leggins Cellulite | giornaliera-am-pm |  |  |
| 68 — Sinecell kit leggings cellulite refill | giornaliera-am-pm |  |  |

---

## 4) Regola di fallback in Routine

- Routine **Mattutina** → prodotti con timing **Mattutina**
- Routine **Serale** → prodotti con timing **Serale**
- Prodotti **Trattamento mirato** o **Solare** → inclusi **solo** se routine lo richiede

---

## 5) Vantaggi

- Nessun prodotto AM+PM escluso dalle routine.
- Etichettatura semplice: se è valido AM e PM → **doppio tag**.
- Nessuna logica “OR” complicata nei filtri.

---

## 6) Fattibilità

- **Schema già M2M** (`products_rels` + `timingProducts`).
- Nessun breaking change strutturale.
- Richiede solo:
  - aggiornamento contenuti `timing-products`
  - retag relazioni prodotti

---

## ✅ Checklist operativa (monitor)
- [x] Creare/aggiornare timing-products: **mattutina**, **serale**, **trattamento-mirato**, **solare**
- [x] Rimuovere `giornaliera-am-pm` (dopo retag)
- [x] Retag prodotti ex-`giornaliera-am-pm` (auto + review manuale)
- [x] Aggiornare `routine-templates` (rimozione timing legacy + rigenerazione)
- [x] Aggiornare seed / logiche default timing (Products hook + seeds)
- [ ] Verificare FE/BE (filtri timing, Routine Builder)

---

## 6.1) Tabelle / Collections impattate

**Collections / Config:**
- `collections/timing-products`
- `collections/products` (relazione `timingProducts`)
- `collections/routine-step-rules` (campo `timing`)
- `collections/routine-templates` (campo `timing`)
- (eventuali filtri FE/BE che usano “giornaliera”)

**Tabelle DB:**
- `timing_products` + `timing_products_locales`
- `products_rels` (path = `timingProducts`)
- `routine_step_rules`
- `routine_templates`
- `exclusions` / `boosts` (se usano `timing_id`)

---

## 7) Query utili (debug)

**Distribuzione relazioni per timing**
```sql
select timing_products_id, count(*) as rels
from products_rels
where path = 'timingProducts'
group by timing_products_id
order by rels desc;
```

**Prodotti marcati Giornaliera**
```sql
select p.id, pl.title, array_agg(tp.slug) as timings
from products p
left join products_locales pl on pl._parent_id = p.id and pl._locale = 'it'
left join products_rels pr on pr.parent_id = p.id and pr.path = 'timingProducts'
left join timing_products tp on tp.id = pr.timing_products_id
where pr.timing_products_id = 3
group by p.id, pl.title
order by p.id;
```
