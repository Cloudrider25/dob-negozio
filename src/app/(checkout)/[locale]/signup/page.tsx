import { notFound } from 'next/navigation'

import { AuthSplitLayout } from '@/components/account/AuthSplitLayout'
import { SignUpForm } from '@/components/account/SignUpForm'
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
