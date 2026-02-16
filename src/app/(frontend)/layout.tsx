import React from 'react'
import { Instrument_Sans } from 'next/font/google'
import '../../styles/globals.css'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'optional',
  preload: false,
  variable: '--font-instrument',
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  description:
    'DOB - Department of Beauty Milano Rasori. Estetica avanzata, trattamenti e prodotti selezionati.',
  title: 'DOB - Department of Beauty Milano',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="it">
      <body className={`site ${instrumentSans.variable}`} data-theme="dark">
        <main>{children}</main>
      </body>
    </html>
  )
}
