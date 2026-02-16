'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { SectionSwitcher } from '@/components/sections/SectionSwitcher'

type ServicesViewMode = 'navigator' | 'listino' | 'consulenza'

export function ServicesSectionSwitcher({ currentView }: { currentView: ServicesViewMode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filtersOpen = searchParams.get('filters') === 'open'
  const hasSelectedFilters = Boolean(searchParams.get('ft') || searchParams.get('fa'))

  const updateView = (nextView: ServicesViewMode) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextView === 'navigator') {
      params.delete('view')
      params.delete('filters')
    } else {
      params.set('view', nextView)
      if (nextView !== 'listino') {
        params.delete('filters')
      }
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const toggleFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', 'listino')
    if (filtersOpen) {
      params.delete('filters')
    } else {
      params.set('filters', 'open')
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', 'listino')
    params.delete('ft')
    params.delete('fa')
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <SectionSwitcher
      items={[
        { key: 'navigator', label: 'Service Navigator' },
        { key: 'consulenza', label: 'Consulenza' },
        { key: 'listino', label: 'Tutti i servizi' },
      ]}
      activeKey={currentView}
      actions={
        currentView === 'listino'
          ? [
              {
                key: 'filters',
                label: 'Filtri',
                active: filtersOpen,
                onClick: toggleFilters,
              },
              ...(hasSelectedFilters
                ? [
                    {
                      key: 'clear-filters',
                      label: 'Rimuovi tutti',
                      onClick: clearFilters,
                    },
                  ]
                : []),
            ]
          : []
      }
      onChange={(nextKey) => {
        if (nextKey === 'navigator' || nextKey === 'listino' || nextKey === 'consulenza') {
          updateView(nextKey)
        }
      }}
    />
  )
}
