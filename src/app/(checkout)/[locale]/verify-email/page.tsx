import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/components/account/AuthSplitLayout'
import { VerifyEmailCard } from '@/components/account/VerifyEmailCard'
import { isLocale } from '@/lib/i18n'

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
