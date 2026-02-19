'use client'

import Image from 'next/image'
import { useState } from 'react'

import styles from './ProtocolSplit.module.css'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { StateCircleButton } from '@/components/ui/StateCircleButton'
import { SplitSection } from '@/components/ui/SplitSection'
import type { Locale } from '@/lib/i18n'

export type ProtocolSplitStep = {
  id: string
  label: string
  title: string
  subtitle: string
  image: string
  imageAlt: string
}

const defaultStepMedia = [
  '/api/media/file/hero_homepage_light-1.png',
  '/api/media/file/hero_homepage_dark-1.png',
  '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg',
] as const

const protocolDefaultsByLocale: Record<
  Locale,
  { eyebrow: string; ariaLabel: string; steps: Omit<ProtocolSplitStep, 'id' | 'image'>[] }
> = {
  it: {
    eyebrow: 'DOB protocol',
    ariaLabel: 'DOB protocol split',
    steps: [
      {
        label: 'Diagnosi',
        title: 'Diagnosi su misura',
        subtitle: 'Analisi approfondita della pelle e degli obiettivi per definire il protocollo.',
        imageAlt: 'Diagnosi su misura',
      },
      {
        label: 'Tecnologia',
        title: 'Tecnologia mirata',
        subtitle: 'Tecniche avanzate e macchinari selezionati per risultati visibili e duraturi.',
        imageAlt: 'Tecnologia mirata',
      },
      {
        label: 'Rituale',
        title: 'Rituale personalizzato',
        subtitle: 'Rituali di bellezza calibrati per mantenere e potenziare i risultati.',
        imageAlt: 'Rituale personalizzato',
      },
    ],
  },
  en: {
    eyebrow: 'DOB protocol',
    ariaLabel: 'DOB protocol split',
    steps: [
      {
        label: 'Diagnosis',
        title: 'Tailored diagnosis',
        subtitle: 'In-depth skin and goals analysis to define the right protocol.',
        imageAlt: 'Tailored diagnosis',
      },
      {
        label: 'Technology',
        title: 'Targeted technology',
        subtitle: 'Advanced techniques and selected devices for visible, lasting results.',
        imageAlt: 'Targeted technology',
      },
      {
        label: 'Ritual',
        title: 'Personalized ritual',
        subtitle: 'Customized beauty rituals to maintain and boost your results.',
        imageAlt: 'Personalized ritual',
      },
    ],
  },
  ru: {
    eyebrow: 'DOB protocol',
    ariaLabel: 'DOB protocol split',
    steps: [
      {
        label: 'Диагностика',
        title: 'Индивидуальная диагностика',
        subtitle: 'Глубокий анализ кожи и целей для выбора оптимального протокола.',
        imageAlt: 'Индивидуальная диагностика',
      },
      {
        label: 'Технология',
        title: 'Точная технология',
        subtitle: 'Передовые техники и оборудование для заметного и стойкого результата.',
        imageAlt: 'Точная технология',
      },
      {
        label: 'Ритуал',
        title: 'Персонализированный ритуал',
        subtitle: 'Индивидуальные бьюти-ритуалы для поддержания и усиления результата.',
        imageAlt: 'Персонализированный ритуал',
      },
    ],
  },
}

type ProtocolSplitProps = {
  locale?: Locale
  eyebrow?: string
  steps?: ProtocolSplitStep[]
}

export const ProtocolSplit = ({ locale = 'it', eyebrow, steps }: ProtocolSplitProps) => {
  const defaults = protocolDefaultsByLocale[locale]
  const resolvedEyebrow = eyebrow || defaults.eyebrow
  const resolvedSteps =
    steps && steps.length > 0
      ? steps
      : defaults.steps.map((step, index) => ({
          id: String(index + 1).padStart(2, '0'),
          label: step.label,
          title: step.title,
          subtitle: step.subtitle,
          image: defaultStepMedia[index] || defaultStepMedia[0],
          imageAlt: step.imageAlt,
        }))
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  const activateStep = (index: number) => {
    setDirection(index > activeIndex ? 'forward' : 'backward')
    setActiveIndex(index)
  }

  const getSlideState = (index: number) => {
    if (index === activeIndex) return styles.slideActive
    const prevIndex = (activeIndex - 1 + resolvedSteps.length) % resolvedSteps.length
    const nextIndex = (activeIndex + 1) % resolvedSteps.length
    if (direction === 'forward') {
      return index === prevIndex ? styles.slidePrev : styles.slideNext
    }
    return index === nextIndex ? styles.slideNext : styles.slidePrev
  }

  return (
    <SplitSection
      aria-label={defaults.ariaLabel}
      leftClassName={styles.panel}
      rightClassName={styles.media}
      left={
        <>
          <div>
            <p className={`${styles.eyebrow} typo-caption-upper`}>{resolvedEyebrow}</p>
            <div className={styles.textSlider}>
              {resolvedSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`${styles.slide} ${styles.textSlide} ${getSlideState(index)}`}
                >
                  <SectionTitle as="h3" size="h2" uppercase>
                    {step.title}
                  </SectionTitle>
                  <SectionSubtitle className={styles.subtitle}>{step.subtitle}</SectionSubtitle>
                </div>
              ))}
            </div>
          </div>
          <div
            className={styles.steps}
            style={{ gridTemplateColumns: `repeat(${resolvedSteps.length}, minmax(0, 1fr))` }}
          >
            {resolvedSteps.map((step, index) => (
              <div key={step.id} className={styles.step}>
                <StateCircleButton
                  baseClassName={styles.stepBtn}
                  typographyClassName="typo-small-upper"
                  active={index === activeIndex}
                  aria-pressed={index === activeIndex}
                  onMouseEnter={() => activateStep(index)}
                  onFocus={() => activateStep(index)}
                  onClick={() => activateStep(index)}
                >
                  {step.id}
                </StateCircleButton>
                <p className={`${styles.stepLabel} typo-caption-upper`}>{step.label}</p>
              </div>
            ))}
          </div>
        </>
      }
      right={
        <div className={styles.imageSlider}>
          {resolvedSteps[activeIndex] && (
            <div key={resolvedSteps[activeIndex].id} className={`${styles.slide} ${styles.slideActive}`}>
              <Image
                src={resolvedSteps[activeIndex].image}
                alt={resolvedSteps[activeIndex].imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
                fetchPriority="auto"
              />
            </div>
          )}
        </div>
      }
    />
  )
}
