'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getAccountDictionary } from '@/lib/i18n/account'
import { SectionSubtitle } from '@/frontend/components/ui/primitives/section-subtitle'
import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'
import { Input } from '@/frontend/components/ui/primitives/input'
import {
  getPasswordMissingRequirementKeys,
  isStrongPassword,
  PASSWORD_MIN_LENGTH,
} from '@/lib/shared/auth/passwordPolicy'

import styles from './AuthForms.module.css'
import { getSignUpErrorFeedback, type SignUpErrorFeedback } from './auth-utils'

export function SignUpForm({ locale }: { locale: string }) {
  const router = useRouter()
  const copy = getAccountDictionary(locale).auth.signUp
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<SignUpErrorFeedback | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const redirectTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  const isFormValid = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      email.trim().length > 0 &&
      isStrongPassword(password)
    )
  }, [firstName, lastName, email, password])

  const passwordGuidance = useMemo(() => {
    if (password.length === 0) return copy.passwordPolicy

    const missing = getPasswordMissingRequirementKeys(password).map(
      (requirement) => copy.passwordRequirements[requirement],
    )

    return missing.length === 0
      ? copy.passwordStatusComplete
      : `${copy.passwordStatusMissingPrefix} ${missing.join(', ')}.`
  }, [copy, password])

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
        setError(getSignUpErrorFeedback(data, copy.errors.generic, copy.feedback))
        return
      }

      setSuccess(copy.success)
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current)
      }
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push(`/${locale}/signin`)
      }, 1400)
    } catch {
      setError({
        title: copy.feedback.networkTitle,
        body: copy.errors.network,
        suggestLogin: false,
        suggestResetPassword: false,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <SectionTitle as="h1" size="h1" uppercase className={styles.title}>
        {copy.title}
      </SectionTitle>

      {error ? (
        <div className={styles.inlineError} role="alert" aria-live="polite">
          <p className={`${styles.inlineErrorText} typo-small`}>
            <strong>{error.title}.</strong> {error.body}
          </p>
          {error.suggestLogin || error.suggestResetPassword ? (
            <div className={styles.inlineErrorLinks}>
              {error.suggestLogin ? (
                <Link className={`${styles.inlineErrorLink} typo-small`} href={`/${locale}/signin`}>
                  {copy.feedback.signInLink}
                </Link>
              ) : null}
              {error.suggestResetPassword ? (
                <Link className={`${styles.inlineErrorLink} typo-small`} href={`/${locale}/forgot-password`}>
                  {copy.feedback.resetPasswordLink}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {success ? <p className={`${styles.message} ${styles.success} typo-small`}>{success}</p> : null}

      <div className={styles.inlineGrid}>
        <Input
          type="text"
          className={`${styles.input} typo-body`}
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder={copy.firstNamePlaceholder}
          autoComplete="given-name"
          required
        />

        <Input
          type="text"
          className={`${styles.input} typo-body`}
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder={copy.lastNamePlaceholder}
          autoComplete="family-name"
          required
        />

        <Input
          type="email"
          className={`${styles.input} typo-body`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.emailPlaceholder}
          autoComplete="email"
          required
        />

        <Input
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

      <SectionSubtitle className={styles.subtitle}>{passwordGuidance}</SectionSubtitle>

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
