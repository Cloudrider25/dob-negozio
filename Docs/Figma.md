## DOB Tech-Luxury — I, Robot Pearl Visual System (Codex Prompt)

CODEX — DOB Tech-Luxury + “I, Robot Pearl” Visual System (PROMPT DEFINITIVO)

OBIETTIVO
Applicare il nuovo stile ispirato a “I, Robot” su TUTTO il sito DOB:
- Pearl White ombreggiato (carrozzeria premium)
- Dark showroom cinematic (obsidian + graphite)
- Accent Neon Red come “laser pointer” (micro-dose)
- Gradients / ombre / highlight controllati (effetto high-budget)
- Compatibile Dark/Light senza rompere il layout

STACK
- Next.js + TailwindCSS
- class-variance-authority (cva) + clsx
- opzionale: tailwind-merge
- CSS Modules solo per effetti speciali (glow/noise/mask)

VINCOLI
- Non cambiare struttura, spacing e gerarchia del layout esistente
- Non reintrodurre CSS globale per componenti specifici
- Accent red massimo 1–2% visivo totale
- Gradients e glow “luxury safe”: opacity bassa + blur alto

============================================================
A) PALETTE E TOKENS (I, ROBOT EDITION)
============================================================
Assumiamo che tokens e themes esistano già. Aggiorna/integra SOLO questi:

COLORI
- Obsidian: #07070A
- Graphite: #0D0F14
- Panel: #121521

Pearl System
- Pearl-1: #FFFFFF
- Pearl-2: #F5F2ED
- Pearl-3: #F0ECE6

Metallic
- Steel: #AEB6C2
- Titanium: #6F7785

Accent
- Neon Red: #FF2D2D
- Coral Red (alt): #FF3B5C
- Tech Cyan (solo focus): #7AE7FF

GRADIENTS (Pearl material)
- --pearl-grad: linear-gradient(180deg, #FFFFFF 0%, #F5F2ED 60%, #F0ECE6 100%)
- --pearl-highlight: radial-gradient(circle at 30% 0%, rgba(255,255,255,0.70), rgba(255,255,255,0) 60%)

SHADOWS (Luxury safe)
- --shadow-lux: 0 24px 80px rgba(0,0,0,0.22)
- --shadow-soft: 0 10px 40px rgba(0,0,0,0.16)

REGOLA LUX
- max 2 gradient layers per area
- glow opacity 4%–18%
- blur 80–160px

============================================================
B) BACKGROUND CINEMATIC (DARK SHOWROOM)
============================================================
Crea un wrapper <CinematicBackground> (o applicalo alle sezioni principali) con:
- base obsidian
- vignette (bordi più scuri)
- micro glow cyan e micro glow red (molto leggeri)

Esempio concetto:
radial-gradient(circle at 20% 20%, rgba(122,231,255,0.08), transparent 55%),
radial-gradient(circle at 80% 30%, rgba(255,45,45,0.06), transparent 60%),
linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%);

IMPORTANTE:
- Questo background deve essere in CSS Module.
- Non deve alterare padding/margini.

============================================================
C) PEARL CARDS (EFFETTO “CARROZZERIA PREMIUM”)
============================================================
Aggiorna il componente Card in variante `pearl` (o default per Services/Proof):
- background: var(--pearl-grad)
- pseudo overlay: var(--pearl-highlight) (top highlight)
- border: 1px rgba(0,0,0,0.06)
- shadow: var(--shadow-lux)
- radius: 20px
- overflow: hidden

Le cards devono risultare “fisiche”, non piatte.

============================================================
D) NEON RED — USO CONTROLLATO (MICRO ACCENT)
============================================================
Il Neon Red (#FF2D2D) si usa SOLO per:
1) underline hover (2px)
2) active indicator (dot o micro bar)
3) focus ring su CTA (facoltativo) oppure Tech Cyan per focus
4) badge piccoli (NEW/BEST)
5) micro glow su interazioni (molto leggero)

NON usare Neon Red per:
- background grandi
- bottoni pieni ovunque
- testi lunghi

============================================================
E) COMPONENTI DA AGGIORNARE (TUTTO IL SITO)
============================================================
1) Buttons
- Primary su dark: outline + testo chiaro
- Hover: underline Neon Red 2px + micro glow
- Evita pulsanti rossi pieni come default

2) Tabs (pills)
- background pill: rgba(255,255,255,0.04)
- border: rgba(255,255,255,0.12)
- active: underline Neon Red 2px oppure dot Neon Red

3) Cards Services
- uniforma altezza
- immagine height fissa 240–260px object-fit: cover
- footer fisso con CTA micro “Scopri →”

4) Carousel arrows
- 40x40, glass subtle, hover border red 40%

============================================================
F) APPLICAZIONE PER SEZIONI (ORDINE CONSIGLIATO)
============================================================
1) Hero
- Dark showroom + micro glow
- overlay gradient per leggibilità

2) Services
- Cards pearl + shadow lux
- neon red solo per hover/active

3) Tech proof
- background dark, dettagli metallic

4) Results/Reviews
- light pearl background in modalità light
- cards con pearl grad

5) CTA finale
- minimal, enorme, pulita
- red solo per underline hover

============================================================
G) OUTPUT RICHIESTO
============================================================
- Applicare il visual system su tutte le pagine senza cambiare layout
- Niente CSS globale per componenti specifici
- Usare Card variant `pearl` dove serve
- Inserire CinematicBackground su hero e sezioni scure principali
- Neon red solo micro accenti (1–2% visivo)

FINE
```
