'use client'

import { useState } from 'react'

type TabKey = 'description' | 'usage' | 'ingredients' | 'results'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'description', label: 'Descrizione' },
  { key: 'usage', label: "Modo d'uso" },
  { key: 'ingredients', label: 'Principi attivi' },
  { key: 'results', label: 'Risultati' },
]

export function ProductTabs({
  description,
  usage,
  activeIngredients,
  results,
}: {
  description?: string | null
  usage?: string | null
  activeIngredients?: string | null
  results?: string | null
}) {
  const [active, setActive] = useState<TabKey>('description')

  const content =
    active === 'description'
      ? description
      : active === 'usage'
      ? usage
      : active === 'ingredients'
      ? activeIngredients
      : results

  return (
    <div className="space-y-6">
      <div className="inline-flex border border-stroke rounded-lg overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm transition-colors ${
              active === tab.key
                ? 'bg-paper text-text-primary'
                : 'bg-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[240px] rounded-lg border border-stroke bg-paper p-6 text-sm leading-relaxed text-text-secondary">
        {content ? content : 'Contenuto non disponibile.'}
      </div>
    </div>
  )
}
