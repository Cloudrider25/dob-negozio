import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)

  return (
    <div className="page">
      <section className="page-hero">
        <h1>{t.location.title}</h1>
        <p className="lead">{t.location.lead}</p>
      </section>
      <section className="location-grid">
        <div className="card">
          <h3>{t.placeholders.addressLabel}</h3>
          <p>Via Giovanni Rasori 9</p>
          <p>{t.placeholders.cityLine}</p>
        </div>
        <div className="card">
          <h3>{t.placeholders.hoursLabel}</h3>
          <p>{t.location.hours}</p>
          <p>{t.placeholders.weekdayLabel}</p>
        </div>
        <div className="card">
          <h3>{t.placeholders.contactLabel}</h3>
          <p>WhatsApp: +39 XXX XXX XXXX</p>
          <p>Telefono: +39 XXX XXX XXXX</p>
        </div>
      </section>
    </div>
  )
}
