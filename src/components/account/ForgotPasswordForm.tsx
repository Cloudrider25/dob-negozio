'use client'

import Link from 'next/link'
import { useState } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { Input } from '@/components/ui/input'

import styles from './AuthForms.module.css'

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const record = payload as { message?: unknown; errors?: Array<{ message?: unknown }> }
    if (typeof record.message === 'string' && record.message.trim().length > 0) {
      return record.message
    }
    if (Array.isArray(record.errors) && typeof record.errors[0]?.message === 'string') {
      return record.errors[0].message
    }
  }
  return fallback
}

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const copy = getAccountDictionary(locale).auth.forgotPassword
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setError(getErrorMessage(data, copy.errors.generic))
        return
      }

      setSuccess(copy.success)
    } catch {
      setError(copy.errors.network)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <SectionTitle as="h1" size="h1" uppercase className={styles.title}>
        {copy.title}
      </SectionTitle>
      <SectionSubtitle className={styles.subtitle}>{copy.subtitle}</SectionSubtitle>

      {error ? <p className={`${styles.message} ${styles.error} typo-small`}>{error}</p> : null}
      {success ? <p className={`${styles.message} ${styles.success} typo-small`}>{success}</p> : null}

      <div className={styles.field}>
        <Input
          type="email"
          className={`${styles.input} typo-body`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.emailPlaceholder}
          autoComplete="email"
          required
        />
      </div>

      <div className={styles.actions} style={{ marginTop: '1.25rem' }}>
        <button className={`${styles.submit} typo-small-upper`} type="submit" disabled={submitting}>
          {submitting ? copy.submitting : copy.submit}
        </button>

        <Link className={`${styles.link} typo-small`} href={`/${locale}/signin`}>
          {copy.cancel}
        </Link>
      </div>
    </form>
  )
}
