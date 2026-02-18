import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'

type PageParams = Promise<{ locale: string; slug: string }>

export default async function AreaDetailPage({ params }: { params: PageParams }) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const t = getDictionary(locale)

  const result = await payload.find({
    collection: 'areas',
    locale,
    overrideAccess: false,
    depth: 1,
    limit: 1,
    where: {
      slug: { equals: slug },
    },
  })

  const area = result.docs[0]
  if (!area) {
    notFound()
  }

  const media =
    area.cardMedia && typeof area.cardMedia === 'object' && 'url' in area.cardMedia
      ? area.cardMedia
      : null
  const imageUrl = media && typeof media.url === 'string' ? media.url : null
  const imageAlt = media && typeof media.alt === 'string' ? media.alt : area.name || t.services.title

  const extractText = (node: unknown, acc: string[]) => {
    if (!node || typeof node !== 'object') return
    const record = node as { text?: string; children?: unknown[] }
    if (typeof record.text === 'string') {
      acc.push(record.text)
    }
    if (Array.isArray(record.children)) {
      record.children.forEach((child) => extractText(child, acc))
    }
  }

  const cardDescriptionText = (() => {
    if (!area.cardDescription || typeof area.cardDescription !== 'object') return ''
    const root = (area.cardDescription as { root?: unknown }).root
    if (!root) return ''
    const parts: string[] = []
    extractText(root, parts)
    return parts.join(' ').replace(/\s+/g, ' ').trim()
  })()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-16">
      <div className="flex flex-col gap-4">
        <p className="typo-caption-upper text-text-muted">{t.services.title}</p>
        <h1 className="typo-h1 text-text-primary">{area.name}</h1>
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
