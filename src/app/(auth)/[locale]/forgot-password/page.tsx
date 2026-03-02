import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/frontend/page-domains/account/auth/AuthSplitLayout'
import { ForgotPasswordForm } from '@/frontend/page-domains/account/forms/auth/ForgotPasswordForm'
import { isLocale } from '@/lib/i18n/core'

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return (
    <AuthSplitLayout locale={locale}>
      <ForgotPasswordForm locale={locale} />
    </AuthSplitLayout>
  )
}
