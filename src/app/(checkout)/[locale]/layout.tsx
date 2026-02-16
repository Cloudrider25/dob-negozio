import type { ReactNode } from 'react'
import { HeaderThemeObserver } from '@/components/layout/HeaderThemeObserver'

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderThemeObserver />
      {children}
    </>
  )
}
