import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/components/account/AuthSplitLayout'
import { ForgotPasswordForm } from '@/components/account/ForgotPasswordForm'
import { isLocale } from '@/lib/i18n'

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
