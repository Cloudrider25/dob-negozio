'use client'

import { useState } from 'react'
import Image from 'next/image'

import { SplitSection } from '@/components/ui/SplitSection'
import { ScrollZoomOnScroll } from '@/components/ui/ScrollZoomOnScroll'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { Button } from '@/components/ui/button'
import styles from './product-detail.module.css'

type IncludedIngredientItem = {
  label: string
  description: string
}

type ProductInsideSectionProps = {
  ariaLabel: string
  title: string
  mediaUrl: string | null
  mediaAlt: string
  includedDescriptionHtml: string | null
  includedIngredientsLabel: string | null
  includedIngredientsItems: IncludedIngredientItem[]
  includedFooter: string | null
  includedCtaLabel: string | null
}

export function ProductInsideSection({
  ariaLabel,
  title,
  mediaUrl,
  mediaAlt,
  includedDescriptionHtml,
  includedIngredientsLabel,
  includedIngredientsItems,
  includedFooter,
  includedCtaLabel,
}: ProductInsideSectionProps) {
  const [showIncludeContent, setShowIncludeContent] = useState(false)

  return (
    <section className={styles.insideSection} aria-label={ariaLabel}>
      <SplitSection
        rightClassName={styles.insideColumn}
        left={
          <div className={styles.insideMedia}>
            <SectionTitle
              as="div"
              size="h1"
              uppercase
              className={`${styles.insideLabel} ${styles.insideLabelMobile}`}
            >
              {title}
            </SectionTitle>
            {mediaUrl ? (
              <ScrollZoomOnScroll className={styles.insideZoomLayer}>
                <Image
                  src={mediaUrl}
                  alt={mediaAlt}
                  fill
                  className={styles.insideImage}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  fetchPriority="auto"
                />
              </ScrollZoomOnScroll>
            ) : (
              <div className={styles.insidePlaceholder} />
            )}
            {includedCtaLabel && !showIncludeContent ? (
              <Button
                type="button"
                kind="card"
                className={`${styles.insideMediaCta} ${styles.insideCtaDesktop} typo-caption-upper`}
                onClick={() => setShowIncludeContent(true)}
              >
                {includedCtaLabel}
              </Button>
            ) : null}
          </div>
        }
        right={
          <div className={`${styles.insideContent} ${showIncludeContent ? styles.insideContentExpanded : ''}`}>
            {showIncludeContent ? (
              <>
                <button
                  type="button"
                  className={styles.insideCloseButton}
                  onClick={() => setShowIncludeContent(false)}
                  aria-label="Close include panel"
                >
                  X
                </button>
                {includedCtaLabel ? (
                  <p className={`${styles.insideIncludeLabel} typo-h1-upper`}>
                    {includedCtaLabel}
                  </p>
                ) : null}
                {includedDescriptionHtml ? (
                  <div
                    className="typo-body"
                    dangerouslySetInnerHTML={{ __html: includedDescriptionHtml }}
                  />
                ) : null}
              </>
            ) : (
              <>
                <SectionTitle
                  as="h3"
                  size="h3"
                  uppercase
                  className={`${styles.insideLabel} ${styles.insideLabelDesktop}`}
                >
                  {title}
                </SectionTitle>
                {includedIngredientsLabel ? (
                  <p className={`${styles.insideIngredientsLabel} typo-body`}>
                    {includedIngredientsLabel}
                  </p>
                ) : null}
                {includedIngredientsItems.length ? (
                  <div className={styles.insideIngredientsList}>
                    {includedIngredientsItems.map((item, index) => (
                      <div key={`${item.label}-${index}`} className={styles.insideIngredientItem}>
                        {item.label ? (
                          <p className={`${styles.insideIngredientTitle} typo-body-lg-upper`}>
                            {item.label}
                          </p>
                        ) : null}
                        {item.description ? (
                          <p className={`${styles.insideIngredientDescription} typo-body`}>
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {includedFooter ? (
                  <p className={`${styles.insideFooter} typo-body`}>{includedFooter}</p>
                ) : null}
                {includedCtaLabel ? (
                  <Button
                    type="button"
                    kind="card"
                    className={`${styles.insideCta} ${styles.insideCtaMobile} typo-caption-upper`}
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
