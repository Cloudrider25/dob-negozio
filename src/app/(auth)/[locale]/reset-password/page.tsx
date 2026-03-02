import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/frontend/page-domains/account/auth/AuthSplitLayout'
import { ResetPasswordForm } from '@/frontend/page-domains/account/forms/auth/ResetPasswordForm'
import { isLocale } from '@/lib/i18n/core'

export default async function ResetPasswordPage({
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
      <ResetPasswordForm locale={locale} />
    </AuthSplitLayout>
  )
}
