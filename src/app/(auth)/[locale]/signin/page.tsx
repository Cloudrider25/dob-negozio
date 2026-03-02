import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/components/account/auth/AuthSplitLayout'
import { SignInForm } from '@/components/account/forms/auth/SignInForm'
import { isLocale } from '@/lib/i18n'

export default async function SignInPage({
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
      <SignInForm locale={locale} />
    </AuthSplitLayout>
  )
}
