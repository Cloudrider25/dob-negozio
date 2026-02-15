'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'

import styles from './AuthForms.module.css'

const PASSWORD_MIN_LENGTH = 10

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

export function ResetPasswordForm({ locale }: { locale: string }) {
  const router = useRouter()
  const copy = getAccountDictionary(locale).auth.resetPassword
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token')
    if (tokenFromQuery) setToken(tokenFromQuery)
  }, [searchParams])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      })

      const data = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setError(getErrorMessage(data, copy.errors.generic))
        return
      }

      setSuccess(copy.success)
      setTimeout(() => {
        router.push(`/${locale}/signin`)
      }, 900)
    } catch {
      setError(copy.errors.network)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.subtitle}>{copy.subtitle}</p>

      {error ? <p className={`${styles.message} ${styles.error}`}>{error}</p> : null}
      {success ? <p className={`${styles.message} ${styles.success}`}>{success}</p> : null}
      <p className={styles.subtitle}>{copy.passwordPolicy}</p>

      <div className={styles.inlineGrid}>
        <input
          type="text"
          className={styles.input}
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder={copy.tokenPlaceholder}
          required
        />

        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={copy.passwordPlaceholder}
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          required
        />
      </div>

      <div className={styles.actions} style={{ marginTop: '1.25rem' }}>
        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? copy.submitting : copy.submit}
        </button>

        <Link className={styles.link} href={`/${locale}/signin`}>
          {copy.backToSignIn}
        </Link>
      </div>
    </form>
  )
}
