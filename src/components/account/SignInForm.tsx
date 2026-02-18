'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { Label } from '@/components/ui/label'
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

export function SignInForm({ locale }: { locale: string }) {
  const router = useRouter()
  const copy = getAccountDictionary(locale).auth.signIn
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setError(getErrorMessage(data, copy.errors.generic))
        return
      }

      router.push(`/${locale}`)
      router.refresh()
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

      {error ? <p className={`${styles.message} ${styles.error} typo-small`}>{error}</p> : null}

      <div className={styles.field}>
        <Label className={styles.label} htmlFor="signin-email" variant="section">
          {copy.emailLabel}
        </Label>
        <Input
          id="signin-email"
          type="email"
          className={`${styles.input} typo-body`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.emailPlaceholder}
          autoComplete="email"
          required
        />
      </div>

      <div className={styles.field}>
        <Label className={styles.label} htmlFor="signin-password" variant="section">
          {copy.passwordLabel}
        </Label>
        <Input
          id="signin-password"
          type="password"
          className={`${styles.input} typo-body`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={copy.passwordPlaceholder}
          autoComplete="current-password"
          required
        />
      </div>

      <hr className={styles.separator} />

      <div className={styles.actions}>
        <button className={`${styles.submit} typo-small-upper`} type="submit" disabled={submitting}>
          {submitting ? copy.submitting : copy.submit}
        </button>

        <Link className={`${styles.link} typo-small`} href={`/${locale}/forgot-password`}>
          {copy.forgotPassword}
        </Link>

        <p className={`${styles.muted} typo-small`}>
          {copy.noAccount}{' '}
          <Link className={`${styles.link} typo-small`} href={`/${locale}/signup`}>
            {copy.signupCta}
          </Link>
        </p>
      </div>
    </form>
  )
}
