import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/components/account/auth/AuthSplitLayout'
import { ResetPasswordForm } from '@/components/account/forms/auth/ResetPasswordForm'
import { isLocale } from '@/lib/i18n'

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
