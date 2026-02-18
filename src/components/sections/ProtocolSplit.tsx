'use client'

import Image from 'next/image'
import { useState } from 'react'

import styles from './ProtocolSplit.module.css'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { StateCircleButton } from '@/components/ui/StateCircleButton'
import { SplitSection } from '@/components/ui/SplitSection'

export type ProtocolSplitStep = {
  id: string
  label: string
  title: string
  subtitle: string
  image: string
  imageAlt: string
}

const defaultSteps: ProtocolSplitStep[] = [
  {
    id: '01',
    label: 'Diagnosi',
    title: 'Diagnosi su misura',
    subtitle: 'Analisi approfondita della pelle e degli obiettivi per definire il protocollo.',
    image: '/api/media/file/hero_homepage_light-1.png',
    imageAlt: 'Diagnosi su misura',
  },
  {
    id: '02',
    label: 'Tecnologia',
    title: 'Tecnologia mirata',
    subtitle: 'Tecniche avanzate e macchinari selezionati per risultati visibili e duraturi.',
    image: '/api/media/file/hero_homepage_dark-1.png',
    imageAlt: 'Tecnologia mirata',
  },
  {
    id: '03',
    label: 'Rituale',
    title: 'Rituale personalizzato',
    subtitle: 'Rituali di bellezza calibrati per mantenere e potenziare i risultati.',
    image: '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg',
    imageAlt: 'Rituale personalizzato',
  },
]

type ProtocolSplitProps = {
  eyebrow?: string
  steps?: ProtocolSplitStep[]
}

export const ProtocolSplit = ({ eyebrow = 'DOB protocol', steps }: ProtocolSplitProps) => {
  const resolvedSteps = steps && steps.length > 0 ? steps : defaultSteps
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
      aria-label="DOB protocol split"
      leftClassName={styles.panel}
      rightClassName={styles.media}
      left={
        <>
          <div>
            <p className={`${styles.eyebrow} typo-caption-upper`}>{eyebrow}</p>
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
