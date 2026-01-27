import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'

type PageParams = Promise<{ locale: string; slug: string }>

export default async function ServiceDetailPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)

  const result = await payload.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const service = result.docs[0]
  if (!service) {
    notFound()
  }

  const media = service.image && typeof service.image === 'object' && 'url' in service.image ? service.image : null
  const imageUrl = media && typeof media.url === 'string' ? media.url : null
  const imageAlt = media && typeof media.alt === 'string' ? media.alt : service.name || t.services.title

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-16">
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{t.services.title}</p>
        <h1 className="text-3xl md:text-4xl text-text-primary">{service.name}</h1>
        {service.description && <p className="text-base text-text-secondary">{service.description}</p>}
      </div>

      {imageUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stroke">
          <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 960px" />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-stroke bg-paper p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Durata</p>
          <p className="text-lg text-text-primary">{service.duration || '—'}</p>
        </div>
        <div className="rounded-xl border border-stroke bg-paper p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Prezzo</p>
          <p className="text-lg text-text-primary">
            {service.price ? `€ ${service.price}` : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-stroke bg-paper p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Tipologia</p>
          <p className="text-lg text-text-primary">{service.serviceType || '—'}</p>
        </div>
      </div>
    </div>
  )
}
