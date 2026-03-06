import { notFound } from 'next/navigation'
import Image from 'next/image'

import { isLocale } from '@/lib/i18n/core'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { SplitSection } from '@/frontend/components/ui/compositions/SplitSection'
import { SectionSubtitle } from '@/frontend/components/ui/primitives/section-subtitle'
import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'
import styles from './DobProtocolPage.module.css'

type ProtocolDetail = {
  key: string
  title: string
  description: string
  media: unknown
}

export default async function DobProtocolPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const payload = await getPayloadClient()
  const pageConfig = await payload.find({
    collection: 'pages',
    locale,
    fallbackLocale: 'it',
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

  const fallbackByLocale = {
    it: [
      {
        key: 'diagnosi',
        title: 'Diagnosi',
        description:
          'Analisi iniziale approfondita: valutiamo pelle, storico, obiettivi e priorita per costruire un piano realmente personalizzato.',
      },
      {
        key: 'trattamenti',
        title: 'Trattamenti',
        description:
          'Percorso in cabina con protocolli selezionati in base alla diagnosi, con intensita e frequenza calibrate sulla risposta reale.',
      },
      {
        key: 'routine',
        title: 'Routine',
        description:
          'Routine domiciliare semplice ma precisa, con prodotti e sequenze coerenti al protocollo professionale per continuita e risultati.',
      },
      {
        key: 'check-up',
        title: 'Check up',
        description:
          'Controlli periodici per verificare i progressi, ottimizzare il piano e mantenere i risultati nel tempo.',
      },
    ],
    en: [
      {
        key: 'diagnosis',
        title: 'Diagnosis',
        description:
          'Comprehensive initial assessment: we evaluate skin, history, goals, and priorities to build a truly personalized plan.',
      },
      {
        key: 'treatments',
        title: 'Treatments',
        description:
          'In-studio treatment path with protocols selected from the diagnosis, calibrated in intensity and frequency on real response.',
      },
      {
        key: 'routine',
        title: 'Routine',
        description:
          'Simple but precise home routine, with products and sequences aligned to the professional protocol for continuity and results.',
      },
      {
        key: 'check-up',
        title: 'Check up',
        description:
          'Regular checkups to review progress, optimize the plan, and keep results stable over time.',
      },
    ],
    ru: [
      {
        key: 'diagnostika',
        title: 'Диагностика',
        description:
          'Глубокая первичная оценка: анализируем кожу, историю, цели и приоритеты, чтобы сформировать персональный план.',
      },
      {
        key: 'procedury',
        title: 'Процедуры',
        description:
          'Курс процедур в студии по результатам диагностики, с настройкой интенсивности и частоты по фактическому отклику.',
      },
      {
        key: 'rutina',
        title: 'Рутина',
        description:
          'Домашняя рутина без лишней сложности, но с точной последовательностью, синхронизированной с профессиональным протоколом.',
      },
      {
        key: 'checkup',
        title: 'Чек-ап',
        description:
          'Регулярные проверки для оценки прогресса, корректировки плана и долгосрочного удержания результата.',
      },
    ],
  } as const

  const fallbackSections = fallbackByLocale[locale]
  const configuredSections: ProtocolDetail[] = [
    {
      key: 'diagnosi',
      title: pageDoc?.dobProtocolDiagnosi?.title || '',
      description: pageDoc?.dobProtocolDiagnosi?.description || '',
      media: pageDoc?.dobProtocolDiagnosi?.media,
    },
    {
      key: 'trattamenti',
      title: pageDoc?.dobProtocolTrattamenti?.title || '',
      description: pageDoc?.dobProtocolTrattamenti?.description || '',
      media: pageDoc?.dobProtocolTrattamenti?.media,
    },
    {
      key: 'routine',
      title: pageDoc?.dobProtocolRoutine?.title || '',
      description: pageDoc?.dobProtocolRoutine?.description || '',
      media: pageDoc?.dobProtocolRoutine?.media,
    },
    {
      key: 'check-up',
      title: pageDoc?.dobProtocolCheckUp?.title || '',
      description: pageDoc?.dobProtocolCheckUp?.description || '',
      media: pageDoc?.dobProtocolCheckUp?.media,
    },
  ]

  const sections = await Promise.all(
    configuredSections.map(async (section, index) => {
      const fallback = fallbackSections[index]
      const title = section.title || fallback.title
      const description = section.description || fallback.description
      const media = await resolveMediaValue(section.media, title)
      return {
        key: section.key,
        title,
        description,
        image: media?.url || '/api/media/file/hero_homepage_light-1.png',
        imageAlt: media?.alt || title,
      }
    }),
  )

  return (
    <div className={styles.page}>
      {sections.map((section, index) => {
        const isEven = index % 2 === 0
        const mediaNode = (
          <div className={styles.mediaWrap}>
            <Image
              src={section.image}
              alt={section.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={styles.mediaImage}
            />
          </div>
        )
        const textNode = (
          <div className={styles.panel}>
            <p className={`${styles.stepIndex} typo-small-upper`}>{String(index + 1).padStart(2, '0')}</p>
            <SectionTitle as="h2" size="h3" uppercase>
              {section.title}
            </SectionTitle>
            <SectionSubtitle className={styles.copy}>{section.description}</SectionSubtitle>
          </div>
        )
        return (
          <SplitSection
            key={section.key}
            className={styles.split}
            leftClassName={styles.splitCol}
            rightClassName={styles.splitCol}
            mobileOrder={isEven ? 'right-first' : 'left-first'}
            left={isEven ? textNode : mediaNode}
            right={isEven ? mediaNode : textNode}
          />
        )
      })}
    </div>
  )
}
