'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

import styles from './ProgramsSplitSection.module.css'
import serviceCardStyles from '@/components/carousel/UIC_CarouselCard.module.css'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { CircleArrowLeft, CircleArrowRight } from '@/components/ui/icons'
import { SplitSection } from '@/components/ui/SplitSection'

type ProgramStep = {
  id: string
  title?: string | null
  subtitle?: string | null
  badge?: string | null
  heroMedia?: { url: string; alt?: string | null } | null
  detailMedia?: { url: string; alt?: string | null } | null
}

type ProgramData = {
  title?: string | null
  description?: string | null
  price?: string | null
  slug?: string | null
  heroMedia?: { url: string; alt?: string | null } | null
  steps: ProgramStep[]
}

export const ProgramsSplitSection = ({
  program,
  locale,
}: {
  program?: ProgramData | null
  locale: string
}) => {
  const steps = program?.steps ?? []
  const total = steps.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const activeStep = steps[activeIndex]
  const isIntroStep = activeIndex === 0
  const maxIndex = Math.max(total - 1, 0)
  const counter = useMemo(() => `${activeIndex}/${maxIndex}`, [activeIndex, maxIndex])

  if (!program || total === 0) return null

  const leftMedia =
    activeIndex === 0 ? program.heroMedia : activeStep?.heroMedia || program.heroMedia
  const programHref = program.slug ? `/${locale}/programs/${program.slug}` : undefined
  const badgeText = isIntroStep ? 'descrizione' : activeStep?.badge
  const stepTitle = isIntroStep ? 'Trattamento' : activeStep?.title

  return (
    <SplitSection
      aria-label="Programmi DOB"
      leftClassName={styles.left}
      rightClassName={styles.right}
      left={
        <>
          {leftMedia?.url && (
            <Image
              src={leftMedia.url}
              alt={leftMedia.alt || 'Program media'}
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className={`object-cover ${direction === 'next' ? styles.slideNext : styles.slidePrev}`}
              loading="lazy"
              fetchPriority="auto"
            />
          )}
          <div className={styles.dots}>
            {steps.map((item, index) => (
              <button
                key={item.id}
                className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                onClick={() => setActiveIndex(index)}
                type="button"
                aria-label={`Vai a ${item.title || `Step ${index}`}`}
              />
            ))}
          </div>
        </>
      }
      right={
        <>
          <div className={styles.controls}>
            <button
              className={styles.arrow}
              type="button"
              onClick={() => {
                setDirection('prev')
                setActiveIndex((i) => (i - 1 + total) % total)
              }}
              aria-label="Previous"
            >
              <CircleArrowLeft className={styles.arrowIcon} />
            </button>
            <button
              className={styles.arrow}
              type="button"
              onClick={() => {
                setDirection('next')
                setActiveIndex((i) => (i + 1) % total)
              }}
              aria-label="Next"
            >
              <CircleArrowRight className={styles.arrowIcon} />
            </button>
          </div>
          <div className={styles.titleRow}>
            <SectionTitle as="h3" size="h2" uppercase className={styles.title}>
              {program.title}
            </SectionTitle>
            <span className={`${styles.counter} typo-h2`}>{counter}</span>
          </div>
          <div className={styles.stepMediaRow}>
            {badgeText ? (
              <SectionTitle as="span" size="h3" uppercase className={styles.stepBadge}>
                {badgeText}
              </SectionTitle>
            ) : null}
            <div className={styles.stepMedia}>
              {isIntroStep ? (
                <SectionSubtitle className={styles.stepMediaTextDesktop}>{program.description}</SectionSubtitle>
              ) : activeStep?.detailMedia?.url ? (
                <Image
                  src={activeStep.detailMedia.url}
                  alt={activeStep.detailMedia.alt || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className={`object-cover ${
                    direction === 'next' ? styles.slideNext : styles.slidePrev
                  }`}
                  loading="lazy"
                  fetchPriority="auto"
                />
              ) : null}
            </div>
            <div className={styles.mobileStepMediaNav}>
              <button
                className={styles.arrow}
                type="button"
                onClick={() => {
                  setDirection('prev')
                  setActiveIndex((i) => (i - 1 + total) % total)
                }}
                aria-label="Previous"
              >
                <CircleArrowLeft className={styles.arrowIcon} />
              </button>
              <div className={styles.stepMediaMobile}>
                {!isIntroStep && activeStep?.detailMedia?.url ? (
                  <Image
                    src={activeStep.detailMedia.url}
                    alt={activeStep.detailMedia.alt || ''}
                    fill
                    sizes="(max-width: 1024px) 45vw, 0px"
                    className={`object-cover ${
                      direction === 'next' ? styles.slideNext : styles.slidePrev
                    }`}
                    loading="lazy"
                    fetchPriority="auto"
                  />
                ) : (
                  <SectionSubtitle className={styles.stepMediaText}>{program.description}</SectionSubtitle>
                )}
              </div>
              <button
                className={styles.arrow}
                type="button"
                onClick={() => {
                  setDirection('next')
                  setActiveIndex((i) => (i + 1) % total)
                }}
                aria-label="Next"
              >
                <CircleArrowRight className={styles.arrowIcon} />
              </button>
            </div>
          </div>
          <div className={styles.stepFooter}>
            <div className={styles.stepInfo}>
              <SectionSubtitle size="small" uppercase className={styles.stepTitle}>
                {stepTitle}
              </SectionSubtitle>
              {programHref ? (
                <ButtonLink
                  className={`${serviceCardStyles.cta} ${styles.programCta}`}
                  href={programHref}
                  kind="card"
                  size="sm"
                  interactive
                >
                  Scopri {program.title}
                  {program.price ? ` - ${program.price}` : ''}
                </ButtonLink>
              ) : (
                <Button
                  className={`${serviceCardStyles.cta} ${styles.programCta}`}
                  type="button"
                  kind="card"
                  size="sm"
                  interactive
                >
                  Scopri {program.title}
                  {program.price ? ` - ${program.price}` : ''}
                </Button>
              )}
            </div>
          </div>
        </>
      }
    />
  )
}
