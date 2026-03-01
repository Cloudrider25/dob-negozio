'use client'

import type { ReactNode } from 'react'

import { emitSearchDrawerOpen } from '@/lib/searchDrawer'

export function SearchDrawerTrigger({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel || 'Search'}
      onClick={() => {
        emitSearchDrawerOpen()
      }}
    >
      {children}
    </button>
  )
}
