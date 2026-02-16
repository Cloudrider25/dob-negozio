# Documentazione DOB Milano

Ultimo aggiornamento: 2026-02-16

## Obiettivo
Mantenere la documentazione coerente, con una sola fonte per ogni area e separazione chiara tra documenti attivi e storici.

## Documenti attivi
- `Docs/cosa_manca.md` — master checklist cross-area e priorita sprint.
- `Docs/user-account.md` — stato implementativo e quality gates area account.
- `Docs/shop-journey-monitor.md` — riferimento E2E tecnico-operativo shop.
- `Docs/services-configurator.md` — concept, UX e tassonomia Services Navigator.
- `Docs/db-product.md` — schema e stato del dominio Routine Builder.
- `Docs/db-timing-fix.md` — analisi/migrazione timing prodotti.
- `Docs/brand-guide.md` — linee guida brand e direzione visuale.
- `Docs/new-style.md` — regole rapide di stile condivise.
- `Docs/new-layout.md` — regole layout dettagliate per service detail.

## Archivio (non fonte primaria)
I seguenti file sono stati spostati in `Docs/archive/` per storico e tracciabilita, ma non vanno usati come riferimento operativo corrente:
- `category-services.legacy.md`
- `figma-prompt.legacy.md`
- `progress.legacy.md`
- `refactor-globale-css.legacy.md`
- `routine-builder.todo.legacy.md`

## Regole di manutenzione
- Aggiornare prima `Docs/cosa_manca.md`, poi il documento verticale relativo.
- Evitare nuovi file duplicati per la stessa area: estendere un documento esistente.
- Usare naming coerente in `kebab-case`.
- Se un documento diventa obsoleto, spostarlo in `Docs/archive/` con suffisso `.legacy.md`.
