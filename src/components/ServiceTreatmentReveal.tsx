'use client'

import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'

import styles from '../app/(frontend)/[locale]/services/service/[slug]/service-detail.module.css'

type PanelContent = {
  title: string
  body: ReactNode
  rail: string[]
  imageUrl?: string | null
  imageAlt?: string
  imageLeft?: boolean
  href?: string
  railBody?: string[]
  fullWidth?: boolean
  mediaBody?: ReactNode
}

function Panel({
  content,
  onRailClick,
}: {
  content: PanelContent
  onRailClick: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  const panelInner = (
    <div className={styles.treatmentPanel}>
      <div className={`${styles.treatmentGrid} ${content.fullWidth ? styles.treatmentGridFull : ''}`}>
        <div className={`${styles.treatmentCopy} ${content.fullWidth ? styles.treatmentCopyFull : ''}`}>
          <h2 className={styles.treatmentTitle}>{content.title}</h2>
          {typeof content.body === 'string' ? (
            <p className={styles.treatmentText}>{content.body}</p>
          ) : (
            content.body
          )}
          {content.railBody && content.railBody.length > 0 ? (
            <ul className={styles.treatmentRailList}>
              {content.railBody.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div
          className={`${styles.treatmentMedia} ${content.fullWidth ? styles.treatmentMediaFull : ''} ${
            content.imageLeft ? styles.treatmentMediaLeft : ''
          }`}
        >
          {content.mediaBody ? (
            content.mediaBody
          ) : content.imageUrl ? (
            <Image
              src={content.imageUrl}
              alt={content.imageAlt || content.title}
              width={220}
              height={300}
              className={styles.treatmentDiagramThumbImage}
            />
          ) : null}
          <button
            type="button"
            className={styles.treatmentRailButton}
            onClick={onRailClick}
            aria-label="Show alternative treatments"
          >
            <div className={styles.treatmentRail}>
              {content.rail.map((item, index) => {
                const isFirst = index === 0
                const isLast = index === content.rail.length - 1
                const railClass = isFirst
                  ? styles.treatmentRailTop
                  : isLast
                    ? styles.treatmentRailBottom
                    : styles.treatmentRailCenter
                return (
                  <span key={`${item}-${index}`} className={`${styles.treatmentRailText} ${railClass}`}>
                    {item}
                  </span>
                )
              })}
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  if (content.href) {
    return (
      <Link href={content.href} className={styles.treatmentPanelLink}>
        {panelInner}
      </Link>
    )
  }

  return panelInner
}

type ServiceTreatmentRevealProps = {
  primary: PanelContent
  secondary: PanelContent
}

export function ServiceTreatmentReveal({ primary, secondary }: ServiceTreatmentRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const toggle = () => {
    setIsRevealed((prev) => !prev)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggle()
    }
  }

  const handleRailClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggle()
  }

  return (
    <section className={styles.treatmentSection} aria-label="Sostenibilità packaging">
      <div
        className={styles.treatmentCard}
        role="group"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.treatmentViewport}>
          <div className={`${styles.treatmentSlider} ${isRevealed ? styles.treatmentSliderActive : ''}`}>
            <Panel content={primary} onRailClick={handleRailClick} />
            <Panel content={secondary} onRailClick={handleRailClick} />
          </div>
        </div>
      </div>
    </section>
  )
}
