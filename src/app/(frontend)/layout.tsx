import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Instrument_Sans } from 'next/font/google'
import { Work_Sans } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '../../styles/globals.css'
import { ThemeHydrator } from '@/frontend/components/theme/ThemeHydrator'
import { getSeoBaseUrl } from '@/lib/frontend/seo/metadata'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'optional',
  preload: false,
  variable: '--font-instrument',
  weight: ['400', '500', '600', '700'],
})

const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'optional',
  preload: false,
  variable: '--font-work',
  weight: ['400', '500', '600', '700'],
})

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-TVGRNVCTDC'

export const metadata: Metadata = {
  metadataBase: new URL(getSeoBaseUrl()),
  title: {
    default: 'DOB - Department of Beauty Milano',
    template: '%s | DOB Milano',
  },
  description:
    'DOB - Department of Beauty Milano Rasori. Estetica avanzata, trattamenti e prodotti selezionati.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'DOB Milano',
    title: 'DOB - Department of Beauty Milano',
    description:
      'DOB - Department of Beauty Milano Rasori. Estetica avanzata, trattamenti e prodotti selezionati.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOB - Department of Beauty Milano',
    description:
      'DOB - Department of Beauty Milano Rasori. Estetica avanzata, trattamenti e prodotti selezionati.',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="it">
      <body className={`site ${instrumentSans.variable} ${workSans.variable}`} data-theme="dark">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
        <ThemeHydrator />
        <main>{children}</main>
        <SpeedInsights />
      </body>
    </html>
  )
}
