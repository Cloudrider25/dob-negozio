'use client'

import { useState } from 'react'
import Image from 'next/image'

import { SplitSection } from '@/frontend/components/ui/compositions/SplitSection'
import { ScrollZoomOnScroll } from '@/frontend/components/ui/compositions/ScrollZoomOnScroll'
import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'
import { Button } from '@/frontend/components/ui/primitives/button'

type IncludedIngredientItem = {
  label: string
  description: string
}

type DetailInsideSectionClassNames = {
  section: string
  media: string
  image: string
  placeholder: string
  content: string
  label: string
  lead?: string
  rich?: string
  rightColumn?: string
  zoomLayer?: string
  contentExpanded?: string
  labelMobile?: string
  labelDesktop?: string
  ingredientsLabel?: string
  ingredientsList?: string
  ingredientItem?: string
  ingredientTitle?: string
  ingredientDescription?: string
  footer?: string
  cta?: string
  mediaCta?: string
  ctaDesktop?: string
  ctaMobile?: string
  closeButton?: string
  includeLabel?: string
}

type DetailInsideSectionProps = {
  ariaLabel: string
  title: string
  mediaUrl: string | null
  mediaAlt: string
  includedDescriptionHtml: string | null
  includedLeadText?: string | null
  includedIngredientsLabel?: string | null
  includedIngredientsItems?: IncludedIngredientItem[]
  includedFooter?: string | null
  includedCtaLabel?: string | null
  classNames: DetailInsideSectionClassNames
}

export function DetailInsideSection({
  ariaLabel,
  title,
  mediaUrl,
  mediaAlt,
  includedDescriptionHtml,
  includedLeadText,
  includedIngredientsLabel,
  includedIngredientsItems = [],
  includedFooter,
  includedCtaLabel,
  classNames,
}: DetailInsideSectionProps) {
  const [showIncludeContent, setShowIncludeContent] = useState(false)
  const hasExpandableContent = Boolean(includedCtaLabel)
  const isExpanded = hasExpandableContent && showIncludeContent

  return (
    <section className={classNames.section} aria-label={ariaLabel}>
      <SplitSection
        rightClassName={classNames.rightColumn}
        left={
          <div className={classNames.media}>
            <SectionTitle
              as="div"
              size="h1"
              uppercase
              className={[classNames.label, classNames.labelMobile].filter(Boolean).join(' ')}
            >
              {title}
            </SectionTitle>
            {mediaUrl ? (
              <ScrollZoomOnScroll className={classNames.zoomLayer}>
                <Image
                  src={mediaUrl}
                  alt={mediaAlt}
                  fill
                  className={classNames.image}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  fetchPriority="auto"
                />
              </ScrollZoomOnScroll>
            ) : (
              <div className={classNames.placeholder} />
            )}
            {includedCtaLabel && !isExpanded ? (
              <Button
                type="button"
                kind="card"
                className={[classNames.mediaCta, classNames.ctaDesktop, 'typo-caption-upper']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setShowIncludeContent(true)}
              >
                {includedCtaLabel}
              </Button>
            ) : null}
          </div>
        }
        right={
          <div
            className={[classNames.content, isExpanded ? classNames.contentExpanded : undefined]
              .filter(Boolean)
              .join(' ')}
          >
            {isExpanded ? (
              <>
                {classNames.closeButton ? (
                  <button
                    type="button"
                    className={classNames.closeButton}
                    onClick={() => setShowIncludeContent(false)}
                    aria-label="Close include panel"
                  >
                    X
                  </button>
                ) : null}
                {includedCtaLabel ? (
                  <p className={[classNames.includeLabel, 'typo-h1-upper'].filter(Boolean).join(' ')}>
                    {includedCtaLabel}
                  </p>
                ) : null}
                {includedDescriptionHtml ? (
                  <div className="typo-body" dangerouslySetInnerHTML={{ __html: includedDescriptionHtml }} />
                ) : null}
              </>
            ) : (
              <>
                <SectionTitle
                  as="h3"
                  size="h3"
                  uppercase
                  className={[classNames.label, classNames.labelDesktop].filter(Boolean).join(' ')}
                >
                  {title}
                </SectionTitle>
                {includedLeadText ? (
                  <p className={[classNames.lead, 'typo-body'].filter(Boolean).join(' ')}>
                    {includedLeadText}
                  </p>
                ) : null}
                {includedIngredientsLabel ? (
                  <p className={[classNames.ingredientsLabel, 'typo-body'].filter(Boolean).join(' ')}>
                    {includedIngredientsLabel}
                  </p>
                ) : null}
                {includedIngredientsItems.length ? (
                  <div className={classNames.ingredientsList}>
                    {includedIngredientsItems.map((item, index) => (
                      <div
                        key={`${item.label}-${index}`}
                        className={classNames.ingredientItem}
                      >
                        {item.label ? (
                          <p className={[classNames.ingredientTitle, 'typo-body-lg-upper'].filter(Boolean).join(' ')}>
                            {item.label}
                          </p>
                        ) : null}
                        {item.description ? (
                          <p className={[classNames.ingredientDescription, 'typo-body'].filter(Boolean).join(' ')}>
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {includedFooter ? (
                  <p className={[classNames.footer, 'typo-body'].filter(Boolean).join(' ')}>
                    {includedFooter}
                  </p>
                ) : null}
                {includedCtaLabel ? (
                  <Button
                    type="button"
                    kind="card"
                    className={[classNames.cta, classNames.ctaMobile, 'typo-caption-upper']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setShowIncludeContent(true)}
                  >
                    {includedCtaLabel}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        }
      />
    </section>
  )
}
