# Routine Builder – Schema DB (post `skin_types`) + Routine Steps + Attributi Prodotto

Hai già:
- `product_areas`
- `timing_products` (usato al posto di `timings`)
- `objectives`
- `skin_types`

Da qui aggiungiamo 5 blocchi:
- (A) Step (completato)
- (B) Brand/Linee (completato)
- (C) Attributi prodotto (vegan, bio, ecc.)
- (D) Mapping prodotto ↔ meta (filtri + builder)
- (E) Templates routine + regole (boost/exclusions)

---

## A) ROUTINE STEPS (catalogo step + metadati)

### 1) `routine_steps`
Tabella “routine_step” (nome singolare/plurale come preferisci).

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| slug | text | unique per area (consigliato) |
| product_area_id | int | FK → `product_areas.id` |
| locale | text | es. `it` |
| name | text | Label UI |
| description | text | Opzionale |
| step_order_default | int | Ordine default per preset |
| is_optional_default | bool | Default opzionale |
| is_system | bool | step core non eliminabile (es. detergente, SPF) |
| active | bool | Abilitazione |

Esempi Viso: `detergente`, `tonico`, `siero`, `crema`, `spf`, `struccante`, `esfoliante`, `maschera`, `contorno-occhi`, `trattamento-notte`  
Esempi Corpo: `detergente-corpo`, `esfoliante-corpo`, `trattamento-mirato`, `crema-olio-finale`

---

### 2) (Opzionale) `routine_step_rules`
Vincoli su step (soft/hard). Esempio: SPF solo AM.

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| routine_step_id | int | FK → `routine_steps.id` |
| timing_id | int \| NULL | FK → `timing_products.id` |
| objective_id | int \| NULL | FK → `objectives.id` |
| skin_type_id | int \| NULL | FK → `skin_types.id` |
| rule_type | enum | `require` \| `forbid` \| `warn` |
| note | text | Motivazione/UI hint |

---

## B) BRAND / LINEE / PRIORITÀ

### 3) `brands`

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| slug | text | unique |
| name | text | Label |
| active | bool | Abilitazione |
| sort_order | int | Ordinamento |

---

### 4) `brand_lines`

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| brand_id | int | FK → `brands.id` |
| slug | text | unique per brand (consigliato) |
| name | text | Label |
| active | bool | Abilitazione |
| sort_order | int | Ordinamento |

---

### 5) `brand_line_objective_priority` (consigliata)
Spinge linee “native” per un obiettivo (es. Longevity + anti-age).

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| brand_line_id | int | FK → `brand_lines.id` |
| objective_id | int | FK → `objectives.id` |
| score_int | int | Punteggio ranking |
| note | text | Spiegazione |

---

## C) ATTRIBUTI PRODOTTO (vegan, bio, cruelty free, ecc.)

Tassonomia scalabile e multi-lingua.

### 6) `attributes`

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| slug | text | unique (es. `vegan`) |
| type | enum | `boolean` \| `enum` \| `text` |
| active | bool | Abilitazione |
| sort_order | int | Ordinamento |

Esempi (boolean):  
- `vegan`  
- `bio`  
- `cruelty-free`  
- `fragrance-free`  
- `dermatologically-tested`  
- `nickel-tested`  
- `recyclable-packaging`

---

### 7) `attribute_i18n`

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| attribute_id | int | FK → `attributes.id` |
| locale | text | es. `it` |
| name | text | Label |
| description | text | Opzionale |

---

### 8) `attribute_values` (solo se `type = enum`)
Esempi: `spf_level: 30/50`, `finish: matte/glow`.

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| attribute_id | int | FK → `attributes.id` |
| slug | text | unique per attribute |
| sort_order | int | Ordinamento |

---

### 9) `attribute_value_i18n`

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| attribute_value_id | int | FK → `attribute_values.id` |
| locale | text | es. `it` |
| name | text | Label |

---

### 10) `product_attributes`
Supporta boolean/enum/text.

| Campo | Tipo | Note |
|---|---|---|
| product_id | int | FK → `products.id` |
| attribute_id | int | FK → `attributes.id` |
| value_bool | bool \| NULL | per `boolean` |
| attribute_value_id | int \| NULL | per `enum` |
| value_text | text \| NULL | per `text` |

Regola: in base a `attributes.type`, valorizzi **solo** il campo corretto.

---

## D) MAPPING PRODOTTO ↔ META (filtri + builder)

### 11) `products`
(già esiste) + FK:
- `brand_id` (FK → `brands.id`)
- `brand_line_id` (FK → `brand_lines.id`, nullable)

---

### 12) `product_objectives` (M2M)

| Campo | Tipo | Note |
|---|---|---|
| product_id | int | FK → `products.id` |
| objective_id | int | FK → `objectives.id` |

Indice unico suggerito: **(product_id, objective_id)**.

---

### 13) `product_skin_types` (M2M)

| Campo | Tipo | Note |
|---|---|---|
| product_id | int | FK → `products.id` |
| skin_type_id | int | FK → `skin_types.id` |

Indice unico suggerito: **(product_id, skin_type_id)**.

---

### 14) `product_timings` (M2M)

| Campo | Tipo | Note |
|---|---|---|
| product_id | int | FK → `products.id` |
| timing_id | int | FK → `timing_products.id` |

Indice unico suggerito: **(product_id, timing_id)**.

---

### 15) `product_steps` (M2M)
Fondamentale: “questo prodotto può essere usato nello step X”.

| Campo | Tipo | Note |
|---|---|---|
| product_id | int | FK → `products.id` |
| routine_step_id | int | FK → `routine_steps.id` |

Indice unico suggerito: **(product_id, routine_step_id)**.

---

## E) ROUTINE PRESET (DOB) + regole suggerimento/esclusione

### 16) `routine_templates`
Routine preimpostata (mono o multi brand).

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| slug | text | unique |
| locale | text | es. `it` |
| name | text | Label |
| description | text | Opzionale |
| product_area_id | int | FK → `product_areas.id` |
| timing_id | int | FK → `timing_products.id` |
| objective_id | int | FK → `objectives.id` |
| skin_type_id | int \| NULL | specifico o generico |
| is_multibrand | bool | mono/multi |
| brand_id | int \| NULL | se monobrand |
| brand_line_id | int \| NULL | opzionale |
| active | bool | Abilitazione |
| sort_order | int | Ordinamento |

---

### 17) `routine_template_steps`
Step e ordine del template.

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| routine_template_id | int | FK → `routine_templates.id` |
| routine_step_id | int | FK → `routine_steps.id` |
| step_order | int | ordine |
| required | bool | obbligatorio |

---

### 18) (Opzionale) `routine_template_step_products`
“Consigliati di default” per ogni step.

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| routine_template_id | int | FK → `routine_templates.id` |
| routine_step_id | int | FK → `routine_steps.id` |
| product_id | int | FK → `products.id` |
| rank_int | int | ordinamento |

---

## Layer regole (consigliato)

### 19) `exclusions`
Blocchi o warning su combinazioni (anche su attributi).

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| severity | enum | `hide` \| `warn` |
| reason | text | motivazione |
| objective_id | int \| NULL | FK |
| skin_type_id | int \| NULL | FK |
| timing_id | int \| NULL | FK → `timing_products.id` |
| routine_step_id | int \| NULL | FK |
| product_id | int \| NULL | FK |
| brand_id | int \| NULL | FK |
| brand_line_id | int \| NULL | FK |
| attribute_id | int \| NULL | FK |
| attribute_value_id | int \| NULL | **No FK** (validato da Payload) |

---

### 20) `boosts`
Punteggi per ordinare suggerimenti (anche con attributi).

| Campo | Tipo | Note |
|---|---|---|
| id | int | PK |
| score_int | int | ranking |
| objective_id | int \| NULL | FK |
| skin_type_id | int \| NULL | FK |
| timing_id | int \| NULL | FK → `timing_products.id` |
| routine_step_id | int \| NULL | FK |
| brand_id | int \| NULL | FK |
| brand_line_id | int \| NULL | FK |
| product_id | int \| NULL | FK |
| attribute_id | int \| NULL | FK |
| attribute_value_id | int \| NULL | **No FK** (validato da Payload) |

---

## Flow livelli (dopo `skin_types`)

1. **Brand strategy** (mono/multi) *(enum UI, non tabella)*
2. **Brand** (solo mono) → `brands`
3. **Linea** (solo mono, se esistono) → `brand_lines`
4. **Preset vs Custom** → `routine_templates` (se preset)
5. **Compilazione step** → `routine_steps` + `product_steps` + mapping M2M
6. **Attributi** (filtri extra/badge) → `attributes` + `product_attributes`
7. Carrello unico

---

## Nota pratica
- **Step** = ruolo nel rituale (tonico, siero…)
- **Attributi** = claim/qualità/standard (vegan, bio…)

---

## Query mentale filtro prodotto (per step)
Filtri base:
- `product_area`
- `timing`
- `objective`
- `skin_type`
- `routine_step`

Filtri aggiuntivi se monobrand:
- `brand`
- `brand_line`

Layer di ranking/blocco:
- `exclusions` (hide/warn)
- `boosts` (score)
- `brand_line_objective_priority` (score)

---

## TODO (verifica stato attuale DB + Payload)

### ✅ Già completato / presente
- `product_areas` + `product_areas_locales` (collection Payload + tabella DB)
- `timing_products` + `timing_products_locales` (collection Payload + tabella DB)
- `skin_types` + `skin_types_locales` (collection Payload + tabella DB)
- `needs` + `needs_locales` con parent `product_area_id` (Payload required + FK DB)
- `routine_steps` + `routine_steps_locales` (collection Payload + tabella DB)
- `routine_step_rules` (collection Payload + tabella DB)
- `brands` + `brands_locales` (collection Payload + tabella DB)
- `brand_lines` + `brand_lines_locales` (collection Payload + tabella DB)
- `brand_line_objective_priority` (collection Payload + tabella DB)
- `attributes` + `attributes_locales` (collection Payload + tabella DB)
- `attributes_values` + `attributes_values_locales` (enum values)
- `products_attributes` (pivot valori attributi)
- `product_objectives`
- `product_skin_types`
- `product_timings`
- `product_steps`
- Relazioni Products: `needs`, `categories`, `lines`, `textures`, `product_areas`, `timing_products`, `skin_types` (tutte presenti in `products_rels`)
- `timing_products` è il riferimento ufficiale al posto di `timings` (scelta confermata)
- E) `routine_templates`, `routine_template_steps`, `routine_template_step_products`
- Layer regole: `exclusions`, `boosts` (**attribute_value_id senza FK, validazione lato Payload**)

### ⚠️ Presente ma da modificare/allineare
- (vuoto al momento)

### ❌ Mancante (da creare)
- (vuoto al momento)
