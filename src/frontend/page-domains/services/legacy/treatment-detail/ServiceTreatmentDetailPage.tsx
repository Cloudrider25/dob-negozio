import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n/core'
import { resolveMedia } from '@/lib/frontend/media/resolve'
import { getPlainTextFromRichText } from '@/lib/frontend/services/richtext'

type PageParams = Promise<{ locale: string; slug: string }>

export default async function TreatmentDetailPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)

  const result = await payload.find({
    collection: 'treatments',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const treatment = result.docs[0]
  if (!treatment) {
    notFound()
  }

  const media = resolveMedia(treatment.cardMedia, treatment.boxName || t.services.title)
  const imageUrl = media?.url ?? null
  const imageAlt = media?.alt || treatment.boxName || t.services.title
  const cardDescriptionText = getPlainTextFromRichText(treatment.cardDescription)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-16">
      <div className="flex flex-col gap-4">
        <p className="typo-caption-upper text-text-muted">{t.services.title}</p>
        <h1 className="typo-h1 text-text-primary">{treatment.boxName}</h1>
        {cardDescriptionText && <p className="text-base text-text-secondary">{cardDescriptionText}</p>}
      </div>

      {imageUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stroke">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 960px"
            priority
            loading="eager"
            fetchPriority="high"
          />
        </div>
      )}
    </div>
  )
}
