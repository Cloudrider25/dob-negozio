'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { SectionSwitcher } from '@/frontend/components/sections/SectionSwitcher'

type ServicesViewMode = 'navigator' | 'listino' | 'consulenza'

export function ServicesSectionSwitcher({ currentView }: { currentView: ServicesViewMode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateView = (nextView: ServicesViewMode) => {
    if (!pathname) return
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('view', nextView)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <SectionSwitcher
      items={[
        { key: 'navigator', label: 'Navigator' },
        { key: 'consulenza', label: 'Consulenza' },
        { key: 'listino', label: 'Tutti i servizi' },
      ]}
      activeKey={currentView}
      onChange={(nextKey) => {
        if (nextKey === 'navigator' || nextKey === 'listino' || nextKey === 'consulenza') {
          updateView(nextKey)
        }
      }}
    />
  )
}
