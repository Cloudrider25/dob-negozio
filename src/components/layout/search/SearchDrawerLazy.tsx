'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { consumeSearchDrawerOpenRequest, SEARCH_DRAWER_OPEN_EVENT } from '@/lib/searchDrawer'

const SearchDrawer = dynamic(
  () => import('@/components/layout/search/SearchDrawer').then((module) => module.SearchDrawer),
  {
    ssr: false,
  },
)

export function SearchDrawerLazy({ locale }: { locale: string }) {
  const [enabled, setEnabled] = useState(false)
  const [openOnMount, setOpenOnMount] = useState(false)

  useEffect(() => {
    if (consumeSearchDrawerOpenRequest()) {
      setOpenOnMount(true)
      setEnabled(true)
    }

    const handleOpen = () => {
      setOpenOnMount(true)
      setEnabled(true)
    }

    window.addEventListener(SEARCH_DRAWER_OPEN_EVENT, handleOpen)
    return () => {
      window.removeEventListener(SEARCH_DRAWER_OPEN_EVENT, handleOpen)
    }
  }, [])

  if (!enabled) return null

  return <SearchDrawer locale={locale} initialOpen={openOnMount} />
}
