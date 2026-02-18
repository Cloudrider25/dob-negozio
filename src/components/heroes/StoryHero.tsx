import Image from 'next/image'

import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
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
          src={media?.url || '/api/media/file/hero_homepage_light-1.png'}
          alt={media?.alt || ''}
          fill
          priority={false}
          sizes="100vw"
        />
      </div>
      <div className={styles.card}>
        <SectionTitle as="h2" size="h3" className={styles.title}>
          {title || 'il necessario, fatto davvero bene'}
        </SectionTitle>
        <SectionSubtitle className={styles.body}>
          {body ||
            'In DOB Milano crediamo in pochi essenziali, curati in ogni dettaglio. Formule mirate, performance reale e un gesto quotidiano che diventa rituale: pulizia, trattamento, luce.'}
        </SectionSubtitle>
        <ButtonLink href={ctaHref || `/${locale}/shop`} kind="main" interactive>
          {ctaLabel || 'Scopri DOB'}
        </ButtonLink>
      </div>
    </section>
  )
}
