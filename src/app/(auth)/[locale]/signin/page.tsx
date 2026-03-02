import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/frontend/page-domains/account/auth/AuthSplitLayout'
import { SignInForm } from '@/frontend/page-domains/account/forms/auth/SignInForm'
import { isLocale } from '@/lib/i18n/core'

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
