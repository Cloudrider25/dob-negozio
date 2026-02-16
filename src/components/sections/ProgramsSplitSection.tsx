'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

import styles from './ProgramsSplitSection.module.css'
import serviceCardStyles from '@/components/carousel/UIC_CarouselCard.module.css'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { CircleArrowLeft, CircleArrowRight } from '@/components/ui/icons'

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
        {activeIndex === 0 ? (
          <>
            <h3 className={styles.title}>{program.title}</h3>
            <p className={`${styles.subtitle} ${styles.subtitleCentered}`}>{program.description}</p>
            <div className={styles.metaRow}>
              {programHref ? (
                <ButtonLink className={serviceCardStyles.cta} href={programHref} kind="card" size="sm" interactive>
                  Scopri {program.title}
                  {program.price ? ` - ${program.price}` : ''}
                </ButtonLink>
              ) : (
                <Button className={serviceCardStyles.cta} type="button" kind="card" size="sm" interactive>
                  Scopri {program.title}
                  {program.price ? ` - ${program.price}` : ''}
                </Button>
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
                  <ButtonLink className={serviceCardStyles.cta} href={programHref} kind="card" size="sm" interactive>
                    Scopri {program.title}
                    {program.price ? ` - ${program.price}` : ''}
                  </ButtonLink>
                ) : (
                  <Button className={serviceCardStyles.cta} type="button" kind="card" size="sm" interactive>
                    Scopri {program.title}
                    {program.price ? ` - ${program.price}` : ''}
                  </Button>
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
