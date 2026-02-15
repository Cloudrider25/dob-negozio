'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'

export function AccountLogoutButton({
  locale,
  className,
  label,
}: {
  locale: string
  className?: string
  label?: string
}) {
  const router = useRouter()
  const copy = getAccountDictionary(locale).auth.logout
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onLogout = async () => {
    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        setError(copy.errors.generic)
        return
      }

      router.push(`/${locale}/signin`)
      router.refresh()
    } catch {
      setError(copy.errors.network)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onLogout}
        disabled={submitting}
        className={className || 'rounded-full border border-stroke px-5 py-2 text-sm text-text-primary'}
      >
        {submitting ? copy.submitting : label || copy.fallbackLabel}
      </button>
      {error ? <p className="m-0 text-xs text-[color:#8a1010]">{error}</p> : null}
    </div>
  )
}
