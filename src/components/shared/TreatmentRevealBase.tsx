'use client'

import type { MouseEvent, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import styles from './TreatmentRevealBase.module.css'

export type TreatmentRevealPanelContent = {
  title: string
  body: ReactNode
  rail: string[]
  copyDetails?: Array<{
    label: string
    value: ReactNode
  }>
  imageUrl?: string | null
  imageAlt?: string
  imageLeft?: boolean
  imageInCopy?: boolean
  href?: string
  railBody?: string[]
  fullWidth?: boolean
  mediaBody?: ReactNode
  railAriaLabel?: string
}

type PanelProps = {
  content: TreatmentRevealPanelContent
  onRailClick: (event: MouseEvent<HTMLButtonElement>) => void
}

function Panel({ content, onRailClick }: PanelProps) {
  const copyContent = (
    <>
      {!content.imageInCopy ? (
        <SectionTitle as="h2" size="h2" className={styles.treatmentTitle}>
          {content.title}
        </SectionTitle>
      ) : null}
      {content.imageInCopy ? (
        <SectionTitle
          as="h2"
          size="h2"
          className={`${styles.treatmentTitle} ${styles.treatmentTitleMobile}`}
        >
          {content.title}
        </SectionTitle>
      ) : null}
      {!content.imageInCopy ? (
        <>
          {typeof content.body === 'string' ? (
            <SectionSubtitle className={styles.treatmentText}>{content.body}</SectionSubtitle>
          ) : (
            content.body
          )}
          {content.railBody && content.railBody.length > 0 ? (
            <ul className={`${styles.treatmentRailList} typo-body`}>
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
            loading="lazy"
            fetchPriority="auto"
          />
        </div>
      ) : null}
      {content.imageInCopy && content.copyDetails && content.copyDetails.length > 0 ? (
        <div className={styles.treatmentCopyDetails}>
          {content.copyDetails
            .filter((detail) => Boolean(detail.value))
            .map((detail, index) => (
              <div key={`${detail.label}-${index}`} className={styles.treatmentCopyDetailRow}>
                <span className={`${styles.treatmentCopyDetailValue} typo-body`}>
                  {detail.value}
                </span>
              </div>
            ))}
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
          {content.mediaBody ? (
            <div className={styles.treatmentInlineMedia}>{content.mediaBody}</div>
          ) : content.imageUrl && !content.imageInCopy ? (
            <div className={styles.treatmentInlineMedia}>
              <Image
                src={content.imageUrl}
                alt={content.imageAlt || content.title}
                width={220}
                height={300}
                sizes="(max-width: 768px) 60vw, 220px"
                className={styles.treatmentDiagramThumbImage}
                loading="lazy"
                fetchPriority="auto"
              />
            </div>
          ) : null}
        </div>
      </div>
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
                className={`${styles.treatmentRailText} ${railClass} ${
                  isLast ? 'typo-small-upper' : 'typo-body-lg-upper'
                }`}
              >
                {item}
              </span>
            )
          })}
        </div>
      </button>
    </div>
  )
}

export type TreatmentRevealBaseProps = {
  primary: TreatmentRevealPanelContent
  secondary: TreatmentRevealPanelContent
}

export function TreatmentRevealBase({ primary, secondary }: TreatmentRevealBaseProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleRailClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIsRevealed((prev) => !prev)
  }

  return (
    <section className={styles.treatmentSection} aria-label={`${primary.title} options`}>
      <div className={styles.treatmentCard}>
        <div className={styles.treatmentRotateFrame}>
          <div className={styles.treatmentRotateContent}>
            <div className={styles.treatmentViewport}>
              <div
                className={`${styles.treatmentSlider} ${isRevealed ? styles.treatmentSliderActive : ''}`}
              >
                <Panel content={{ ...primary, imageInCopy: true }} onRailClick={handleRailClick} />
                <Panel content={secondary} onRailClick={handleRailClick} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
