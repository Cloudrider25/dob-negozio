'use client'

import type { MouseEvent, ReactNode } from 'react'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'

import styles from './ServicesTreatmentReveal.module.css'

type PanelContent = {
  title: string
  body: ReactNode
  rail: string[]
  imageUrl?: string | null
  imageAlt?: string
  imageLeft?: boolean
  imageInCopy?: boolean
  href?: string
  railBody?: string[]
  fullWidth?: boolean
  mediaBody?: ReactNode
  railAriaLabel?: string
  mediaDescription?: ReactNode
}

function Panel({
  content,
  onRailClick,
}: {
  content: PanelContent
  onRailClick: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  const copyContent = (
    <>
      {!content.imageInCopy ? (
        <h2 className={styles.treatmentTitle}>{content.title}</h2>
      ) : null}
      {!content.imageInCopy ? (
        <>
          {typeof content.body === 'string' ? (
            <p className={styles.treatmentText}>{content.body}</p>
          ) : (
            content.body
          )}
          {content.railBody && content.railBody.length > 0 ? (
            <ul className={styles.treatmentRailList}>
              {content.railBody.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
      {content.imageInCopy && content.imageUrl ? (
        <div className={styles.treatmentCopyMedia}>
          <Image
            src={content.imageUrl}
            alt={content.imageAlt || content.title}
            width={220}
            height={300}
            sizes="(max-width: 768px) 60vw, 220px"
            className={styles.treatmentDiagramThumbImage}
          />
        </div>
      ) : null}
    </>
  )

  return (
    <div className={styles.treatmentPanel}>
      <div
        className={`${styles.treatmentGrid} ${content.fullWidth ? styles.treatmentGridFull : ''}`}
      >
        <div
          className={`${styles.treatmentCopy} ${content.fullWidth ? styles.treatmentCopyFull : ''} ${
            content.imageInCopy ? styles.treatmentCopyStretch : ''
          }`}
        >
          {content.href ? (
            <Link
              href={content.href}
              className={styles.treatmentPanelLink}
              aria-label={content.title}
            >
              {copyContent}
            </Link>
          ) : (
            copyContent
          )}
        </div>
        <div
          className={`${styles.treatmentMedia} ${content.fullWidth ? styles.treatmentMediaFull : ''} ${
            content.imageLeft ? styles.treatmentMediaLeft : ''
          }`}
        >
          {content.imageInCopy ? (
            <div className={styles.treatmentMediaTitle}>
              <h2 className={styles.treatmentTitle}>{content.title}</h2>
            </div>
          ) : null}
          {content.imageInCopy && content.mediaDescription ? (
            <div className={styles.treatmentMediaDescription}>
              {typeof content.mediaDescription === 'string' ? (
                <p className={styles.treatmentText}>{content.mediaDescription}</p>
              ) : (
                content.mediaDescription
              )}
            </div>
          ) : null}
          {content.mediaBody ? (
            content.mediaBody
          ) : content.imageUrl && !content.imageInCopy ? (
            <Image
              src={content.imageUrl}
              alt={content.imageAlt || content.title}
              width={220}
              height={300}
              sizes="(max-width: 768px) 60vw, 220px"
              className={styles.treatmentDiagramThumbImage}
            />
          ) : null}
          <button
            type="button"
            className={styles.treatmentRailButton}
            onClick={onRailClick}
            aria-label={content.railAriaLabel || 'Show alternative treatments'}
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
                  <span
                    key={`${item}-${index}`}
                    className={`${styles.treatmentRailText} ${railClass}`}
                  >
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
}

type ServicesTreatmentRevealProps = {
  primary: PanelContent
  secondary: PanelContent
}

export function ServicesTreatmentReveal({ primary, secondary }: ServicesTreatmentRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const toggle = () => {
    setIsRevealed((prev) => !prev)
  }

  const handleRailClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    toggle()
  }

  return (
    <section className={styles.treatmentSection} aria-label={`${primary.title} options`}>
      <div className={styles.treatmentCard}>
        <div className={styles.treatmentViewport}>
          <div
            className={`${styles.treatmentSlider} ${isRevealed ? styles.treatmentSliderActive : ''}`}
          >
            <Panel content={{ ...primary, imageInCopy: true }} onRailClick={handleRailClick} />
            <Panel content={secondary} onRailClick={handleRailClick} />
          </div>
        </div>
      </div>
    </section>
  )
}
