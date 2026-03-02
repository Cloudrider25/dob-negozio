import Image from 'next/image'

import { FaqAccordion } from '@/frontend/components/ui/compositions/FaqAccordion'
import { SectionSubtitle } from '@/frontend/components/ui/primitives/section-subtitle'
import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'
import { SplitSection } from '@/frontend/components/ui/compositions/SplitSection'

export type DetailFaqItem = {
  question: string
  answerHtml: string
}

type DetailFaqSectionClassNames = {
  section: string
  copy: string
  title: string
  subtitle: string
  media: string
  image: string
  placeholder: string
}

type DetailFaqSectionProps = {
  ariaLabel: string
  title: string
  subtitle: string
  items: DetailFaqItem[]
  fallbackItems?: DetailFaqItem[]
  media: { url: string; alt: string } | null
  classNames: DetailFaqSectionClassNames
  mobileOrder?: 'left-first' | 'right-first'
}

export function DetailFaqSection({
  ariaLabel,
  title,
  subtitle,
  items,
  fallbackItems,
  media,
  classNames,
  mobileOrder,
}: DetailFaqSectionProps) {
  const resolvedItems = items.length > 0 ? items : fallbackItems || []

  return (
    <section className={classNames.section} aria-label={ariaLabel}>
      <SplitSection
        mobileOrder={mobileOrder}
        left={
          <div className={classNames.copy}>
            <SectionTitle as="h2" size="h1" uppercase className={classNames.title}>
              {title}
            </SectionTitle>
            <SectionSubtitle className={classNames.subtitle}>{subtitle}</SectionSubtitle>
            {resolvedItems.length > 0 ? <FaqAccordion items={resolvedItems} /> : null}
          </div>
        }
        right={
          <div className={classNames.media}>
            {media?.url ? (
              <Image
                src={media.url}
                alt={media.alt}
                fill
                className={classNames.image}
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                fetchPriority="auto"
              />
            ) : (
              <div className={classNames.placeholder} />
            )}
          </div>
        }
      />
    </section>
  )
}
