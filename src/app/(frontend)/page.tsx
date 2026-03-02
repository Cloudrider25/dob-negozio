import { redirect } from 'next/navigation'

import { defaultLocale } from '@/lib/i18n/core'

export default function HomePage() {
  redirect(`/${defaultLocale}`)
}
