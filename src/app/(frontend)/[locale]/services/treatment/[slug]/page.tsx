import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { getDictionary, isLocale } from '@/lib/i18n'

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

  const media =
    treatment.cardMedia && typeof treatment.cardMedia === 'object' && 'url' in treatment.cardMedia
      ? treatment.cardMedia
      : null
  const imageUrl = media && typeof media.url === 'string' ? media.url : null
  const imageAlt =
    media && typeof media.alt === 'string' ? media.alt : treatment.boxName || t.services.title

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
    if (!treatment.cardDescription || typeof treatment.cardDescription !== 'object') return ''
    const root = (treatment.cardDescription as { root?: unknown }).root
    if (!root) return ''
    const parts: string[] = []
    extractText(root, parts)
    return parts.join(' ').replace(/\s+/g, ' ').trim()
  })()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-16">
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{t.services.title}</p>
        <h1 className="text-3xl md:text-4xl text-text-primary">{treatment.boxName}</h1>
        {cardDescriptionText && <p className="text-base text-text-secondary">{cardDescriptionText}</p>}
      </div>

      {imageUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stroke">
          <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 960px" />
        </div>
      )}
    </div>
  )
}
