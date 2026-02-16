'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import styles from './ProgramsSplitSection.module.css'
import serviceCardStyles from './UIC_CarouselCard.module.css'

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
  const maxIndex = Math.max(total - 1, 0)
  const counter = useMemo(() => `${activeIndex}/${maxIndex}`, [activeIndex, maxIndex])

  if (!program || total === 0) return null

  const leftMedia =
    activeIndex === 0 ? program.heroMedia : activeStep?.heroMedia || program.heroMedia
  const programHref = program.slug ? `/${locale}/programs/${program.slug}` : undefined

  return (
    <section className={styles.section} aria-label="Programmi DOB">
      <div className={styles.left}>
        {leftMedia?.url && (
          <Image
            src={leftMedia.url}
            alt={leftMedia.alt || 'Program media'}
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            className={direction === 'next' ? styles.slideNext : styles.slidePrev}
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
      </div>
      <div className={`${styles.right} ${activeIndex === 0 ? styles.stepZero : ''}`}>
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
            <svg className={styles.arrowIcon} viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M26 16L18 24L26 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 24H30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
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
            <svg className={styles.arrowIcon} viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M22 16L30 24L22 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 24H29"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {activeIndex === 0 ? (
          <>
            <h3 className={styles.title}>{program.title}</h3>
            <p className={`${styles.subtitle} ${styles.subtitleCentered}`}>{program.description}</p>
            <div className={styles.metaRow}>
              {programHref ? (
                <Link className={serviceCardStyles.cta} href={programHref}>
                  Scopri {program.title}
                  {program.price ? ` - ${program.price}` : ''}
                </Link>
              ) : (
                <button className={serviceCardStyles.cta} type="button">
                  Scopri {program.title}
                  {program.price ? ` - ${program.price}` : ''}
                </button>
              )}
              <span className={`${styles.counter} ${styles.counterLarge}`}>{counter}</span>
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.title}>{program.title}</h3>
            <div className={styles.stepMediaRow}>
              {activeStep?.badge && <span className={styles.stepBadge}>{activeStep.badge}</span>}
              <div className={styles.stepMedia}>
                {activeStep?.detailMedia?.url && (
                  <Image
                    src={activeStep.detailMedia.url}
                    alt={activeStep.detailMedia.alt || ''}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className={direction === 'next' ? styles.slideNext : styles.slidePrev}
                  />
                )}
              </div>
            </div>
            <div className={styles.stepFooter}>
              <div className={styles.stepInfo}>
                <p className={styles.stepTitle}>{activeStep?.title}</p>
                <p className={styles.stepSubtitle}>{activeStep?.subtitle}</p>
                {programHref ? (
                  <Link className={serviceCardStyles.cta} href={programHref}>
                    Scopri {program.title}
                    {program.price ? ` - ${program.price}` : ''}
                  </Link>
                ) : (
                  <button className={serviceCardStyles.cta} type="button">
                    Scopri {program.title}
                    {program.price ? ` - ${program.price}` : ''}
                  </button>
                )}
              </div>
              <span className={styles.counter}>{counter}</span>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
