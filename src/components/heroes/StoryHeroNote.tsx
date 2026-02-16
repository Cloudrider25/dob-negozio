import Image from 'next/image'

import styles from './StoryHeroNote.module.css'
import { ButtonLink } from '@/components/ui/button-link'

type StoryHeroNoteProps = {
  locale: string
  title?: string | null
  body?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  media?: {
    url: string
    alt?: string | null
  } | null
}

export const StoryHeroNote = ({
  locale,
  title,
  body,
  ctaLabel,
  ctaHref,
  media,
}: StoryHeroNoteProps) => {
  const hasMedia = Boolean(media?.url)

  return (
    <section
      className={styles.section}
      aria-label="Story highlight"
      data-has-media={hasMedia}
    >
      {hasMedia && media ? (
        <div className={styles.media}>
          <Image
            src={media.url}
            alt={media.alt || ''}
            fill
            priority={false}
            sizes="100vw"
          />
        </div>
      ) : null}
      <div className={styles.inner}>
        <div className={styles.noteHeader}>
          <span className={styles.bandEdge} aria-hidden="true" />
          <span className={styles.bandLabel}>{title || 'A note from our founder'}</span>
          <span className={styles.bandEdge} aria-hidden="true" />
        </div>
        <div className={styles.noteCard}>
          <p className={styles.noteText}>
            {body ||
              'In DOB Milano crediamo in pochi essenziali, curati in ogni dettaglio. Formule mirate, performance reale e un gesto quotidiano che diventa rituale: pulizia, trattamento, luce.'}
          </p>
        </div>
        <div className={styles.signature}>
          <span className={styles.signatureLead}>Xo</span>
          <span className={styles.signatureName}>DOB Milano</span>
        </div>
        {ctaLabel ? (
          <ButtonLink href={ctaHref || `/${locale}/shop`} kind="main" interactive>
            {ctaLabel}
          </ButtonLink>
        ) : null}
      </div>
    </section>
  )
}
