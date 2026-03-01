import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/components/account/auth/AuthSplitLayout'
import { SignUpForm } from '@/components/account/forms/auth/SignUpForm'
import { isLocale } from '@/lib/i18n'

export default async function SignUpPage({
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
      <SignUpForm locale={locale} />
    </AuthSplitLayout>
  )
}
