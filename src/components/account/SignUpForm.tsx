'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'

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

const PASSWORD_MIN_LENGTH = 10
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$/

export function SignUpForm({ locale }: { locale: string }) {
  const router = useRouter()
  const copy = getAccountDictionary(locale).auth.signUp
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isFormValid = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= PASSWORD_MIN_LENGTH &&
      PASSWORD_REGEX.test(password)
    )
  }, [firstName, lastName, email, password])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })

      const data = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setError(
          getErrorMessage(
            data,
            copy.errors.generic,
          ),
        )
        return
      }

      setSuccess(copy.success)
      setTimeout(() => {
        router.push(`/${locale}/signin`)
      }, 1400)
    } catch {
      setError(copy.errors.network)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h1 className={`${styles.title} typo-h1-upper`}>{copy.title}</h1>

      {error ? <p className={`${styles.message} ${styles.error} typo-small`}>{error}</p> : null}
      {success ? <p className={`${styles.message} ${styles.success} typo-small`}>{success}</p> : null}
      <p className={`${styles.subtitle} typo-body`}>{copy.passwordPolicy}</p>

      <div className={styles.inlineGrid}>
        <input
          type="text"
          className={`${styles.input} typo-body`}
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder={copy.firstNamePlaceholder}
          autoComplete="given-name"
          required
        />

        <input
          type="text"
          className={`${styles.input} typo-body`}
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder={copy.lastNamePlaceholder}
          autoComplete="family-name"
          required
        />

        <input
          type="email"
          className={`${styles.input} typo-body`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.emailPlaceholder}
          autoComplete="email"
          required
        />

        <input
          type="password"
          className={`${styles.input} typo-body`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={copy.passwordPlaceholder}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
        />
      </div>

      <div className={styles.actions} style={{ marginTop: '1rem' }}>
        <button className={`${styles.submit} typo-small-upper`} type="submit" disabled={submitting || !isFormValid}>
          {submitting ? copy.submitting : copy.submit}
        </button>

        <p className={`${styles.muted} typo-small`}>
          {copy.hasAccount}{' '}
          <Link className={`${styles.link} typo-small`} href={`/${locale}/signin`}>
            {copy.signInCta}
          </Link>
        </p>
      </div>
    </form>
  )
}
