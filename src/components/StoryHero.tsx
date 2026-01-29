import Image from 'next/image'

import styles from './StoryHero.module.css'
import { ButtonLink } from '@/components/ui/button-link'

export const StoryHero = ({ locale }: { locale: string }) => {
  return (
    <section className={styles.section} aria-label="Story highlight">
      <div className={styles.media}>
        <Image
          src="/media/hero_homepage_light.png"
          alt=""
          fill
          priority={false}
          sizes="100vw"
        />
      </div>
      <div className={styles.card}>
        <h2 className={styles.title}>il necessario, fatto davvero bene</h2>
        <p className={styles.body}>
          In DOB Milano crediamo in pochi essenziali, curati in ogni dettaglio. Formule mirate,
          performance reale e un gesto quotidiano che diventa rituale: pulizia, trattamento, luce.
        </p>
        <ButtonLink href={`/${locale}/shop`} variant="outline">
          Scopri DOB
        </ButtonLink>
      </div>
    </section>
  )
}
