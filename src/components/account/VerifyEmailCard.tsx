'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { getAccountDictionary } from '@/lib/account-i18n'
import { SectionTitle } from '@/components/sections/SectionTitle'

import styles from './AuthForms.module.css'

type VerifyEmailCardProps = {
  locale: string
}

export function VerifyEmailCard({ locale }: VerifyEmailCardProps) {
  const copy = getAccountDictionary(locale).auth.verifyEmail
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState(copy.loading)
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    if (!token) {
      setStatus('error')
      setMessage(copy.missingToken)
      return
    }

    const verify = async () => {
      try {
        const response = await fetch(`/api/users/verify/${encodeURIComponent(token)}`, {
          method: 'POST',
          credentials: 'include',
        })

        const data = (await response.json().catch(() => ({}))) as { message?: string }
        if (!response.ok) {
          setStatus('error')
          setMessage(data.message || copy.genericError)
          return
        }

        setStatus('success')
        setMessage(data.message || copy.success)
      } catch {
        setStatus('error')
        setMessage(copy.networkError)
      }
    }

    void verify()
  }, [token])

  return (
    <div className={styles.card}>
      <SectionTitle as="h1" size="h1" uppercase className={styles.title}>
        {copy.title}
      </SectionTitle>
      <p
        className={`${styles.message} typo-small ${
          status === 'success' ? styles.success : status === 'error' ? styles.error : styles.muted
        }`}
      >
        {message}
      </p>

      <div className={styles.actions}>
        <Link className={`${styles.submit} typo-small-upper`} href={`/${locale}/signin`}>
          {copy.goToSignIn}
        </Link>
      </div>
    </div>
  )
}
