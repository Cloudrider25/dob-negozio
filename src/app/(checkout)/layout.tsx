import React from 'react'
import '../../styles/globals.css'
import { ThemeHydrator } from '@/components/theme/ThemeHydrator'

export const metadata = {
  description:
    'DOB - Department of Beauty Milano Rasori. Estetica avanzata, trattamenti e prodotti selezionati.',
  title: 'DOB - Department of Beauty Milano',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="it">
      <body className="site checkout-site" data-theme="dark">
        <ThemeHydrator />
        <main>{children}</main>
      </body>
    </html>
  )
}
