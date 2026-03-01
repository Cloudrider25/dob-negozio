'use client'

import { useState } from 'react'

import { cn } from '@/lib/cn'
import { formatRegionCurrencyLabel, type UserPreferences } from '@/lib/user-preferences'
import { PreferencesConfirmModal } from '@/components/layout/preferences/PreferencesConfirmModal'

type PreferencesFooterControlProps = {
  currentLocale: string
  detected: UserPreferences
  active: UserPreferences
  initiallyConfirmed: boolean
}

export const PreferencesFooterControl = ({
  currentLocale,
  detected,
  active,
  initiallyConfirmed,
}: PreferencesFooterControlProps) => {
  const [open, setOpen] = useState(!initiallyConfirmed)

  return (
    <>
      <div className="flex items-center gap-2">
        <span>Country/Region:</span>
        <button
          type="button"
          className={cn(
            'rounded-full border border-stroke bg-[var(--paper)] px-3 py-1 text-[color:var(--text-secondary)]',
            'hover:text-[color:var(--text-primary)]',
          )}
          onClick={() => setOpen(true)}
        >
          {formatRegionCurrencyLabel(active)}
        </button>
      </div>
      <PreferencesConfirmModal
        currentLocale={currentLocale}
        detected={detected}
        initiallyConfirmed={initiallyConfirmed}
        open={open}
        onOpenChange={setOpen}
        initialPreferences={active}
      />
    </>
  )
}
