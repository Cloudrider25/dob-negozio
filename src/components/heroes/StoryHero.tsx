import Image from 'next/image'

import styles from './StoryHero.module.css'
import { ButtonLink } from '@/components/ui/button-link'

type StoryHeroProps = {
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

export const StoryHero = ({ locale, title, body, ctaLabel, ctaHref, media }: StoryHeroProps) => {
  return (
    <section className={styles.section} aria-label="Story highlight">
      <div className={styles.media}>
        <Image
          src={media?.url || '/media/hero_homepage_light.png'}
          alt={media?.alt || ''}
          fill
          priority={false}
          sizes="100vw"
        />
      </div>
      <div className={styles.card}>
        <h2 className={`${styles.title} typo-h3`}>{title || 'il necessario, fatto davvero bene'}</h2>
        <p className={`${styles.body} typo-body`}>
          {body ||
            'In DOB Milano crediamo in pochi essenziali, curati in ogni dettaglio. Formule mirate, performance reale e un gesto quotidiano che diventa rituale: pulizia, trattamento, luce.'}
        </p>
        <ButtonLink href={ctaHref || `/${locale}/shop`} kind="main" interactive>
          {ctaLabel || 'Scopri DOB'}
        </ButtonLink>
      </div>
    </section>
  )
}
