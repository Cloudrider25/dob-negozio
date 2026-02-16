import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { ProtocolSplit, type ProtocolSplitStep } from '@/components/sections/ProtocolSplit'

export default async function DobProtocolPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const pageConfig = await payload.find({
    collection: 'pages',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      pageKey: {
        equals: 'dob-protocol',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]

  const resolveMedia = (media: unknown, fallbackAlt = '') => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || fallbackAlt }
  }

  const resolveMediaValue = async (value: unknown, fallbackAlt = '') => {
    const direct = resolveMedia(value, fallbackAlt)
    if (direct) return direct
    if (typeof value === 'string' || typeof value === 'number') {
      const mediaDoc = await payload.findByID({
        collection: 'media',
        id: String(value),
        depth: 0,
        overrideAccess: false,
      })
      return resolveMedia(mediaDoc ?? null, fallbackAlt)
    }
    return null
  }

  const protocolStepsRaw = Array.isArray(pageDoc?.protocolSplit?.steps)
    ? pageDoc?.protocolSplit?.steps
    : []
  const protocolSteps = (
    await Promise.all(
      protocolStepsRaw.map(async (step, index) => {
        if (!step || typeof step !== 'object') return null
        const record = step as {
          label?: string | null
          title?: string | null
          subtitle?: string | null
          media?: unknown
        }
        const media = await resolveMediaValue(record.media, record.title || record.label || '')
        if (!record.title || !record.subtitle) return null
        return {
          id: String(index + 1).padStart(2, '0'),
          label: record.label || `0${index + 1}`,
          title: record.title,
          subtitle: record.subtitle,
          image: media?.url || '/media/hero_homepage_light.png',
          imageAlt: media?.alt || record.title,
        } satisfies ProtocolSplitStep
      }),
    )
  ).filter(Boolean) as ProtocolSplitStep[]

  return (
    <div className="flex flex-col gap-10">
      <ProtocolSplit
        eyebrow={pageDoc?.protocolSplit?.eyebrow || t.story.title}
        steps={protocolSteps.length > 0 ? protocolSteps : undefined}
      />
    </div>
  )
}
