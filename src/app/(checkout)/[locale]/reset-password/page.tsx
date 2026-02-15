import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/components/account/AuthSplitLayout'
import { ResetPasswordForm } from '@/components/account/ResetPasswordForm'
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
