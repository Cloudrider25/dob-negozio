import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/frontend/page-domains/account/auth/AuthSplitLayout'
import { VerifyEmailCard } from '@/frontend/page-domains/account/auth/VerifyEmailCard'
import { isLocale } from '@/lib/i18n/core'

export default async function VerifyEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return (
    <AuthSplitLayout locale={locale}>
      <VerifyEmailCard locale={locale} />
    </AuthSplitLayout>
  )
}
