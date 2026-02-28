'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { getAccountDictionary } from '@/lib/account-i18n'
import { cn } from '@/lib/cn'
import styles from './AccountLogoutButton.module.css'

export function AccountLogoutButton({
  locale,
  className,
  rootClassName,
  label,
}: {
  locale: string
  className?: string
  rootClassName?: string
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
    <div className={cn(styles.root, rootClassName)}>
      <Button
        type="button"
        onClick={onLogout}
        disabled={submitting}
        kind="main"
        size="sm"
        interactive
        className={className}
      >
        {submitting ? copy.submitting : label || copy.fallbackLabel}
      </Button>
      {error ? <p className={cn(styles.error, 'typo-caption')}>{error}</p> : null}
    </div>
  )
}
