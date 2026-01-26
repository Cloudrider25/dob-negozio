import Image from 'next/image'

import { ButtonLink } from '@/components/ui/button-link'
import { cn } from '@/lib/cn'
import styles from './Hero.module.css'

export type HeroMedia = {
  url: string
  alt: string
  mimeType?: string | null
}

type HeroCta = {
  href: string
  label: string
  variant?: 'primary' | 'outline'
  external?: boolean
}

type HeroProps = {
  eyebrow?: string
  title: string
  description?: string | null
  variant?: 'style1' | 'style2'
  mediaDark?: HeroMedia | null
  mediaLight?: HeroMedia | null
  ctas?: HeroCta[]
}

export const Hero = ({
  eyebrow,
  title,
  description,
  variant = 'style1',
  mediaDark,
  mediaLight,
  ctas = [],
}: HeroProps) => {
  return (
    <section
      data-hero="true"
      className={cn(styles.hero, variant === 'style2' ? styles.heroStyle2 : styles.heroStyle1)}
    >
      <div className={styles.mediaWrap}>
        {mediaDark &&
          (mediaDark.mimeType?.startsWith('video/') ? (
            <video
              className={cn(styles.media, styles.mediaDark)}
              src={mediaDark.url}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              className={cn(styles.media, styles.mediaDark)}
              src={mediaDark.url}
              alt={mediaDark.alt}
              fill
              priority
              sizes="100vw"
            />
          ))}
        {mediaLight &&
          (mediaLight.mimeType?.startsWith('video/') ? (
            <video
              className={cn(styles.media, styles.mediaLight)}
              src={mediaLight.url}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              className={cn(styles.media, styles.mediaLight)}
              src={mediaLight.url}
              alt={mediaLight.alt}
              fill
              priority
              sizes="100vw"
            />
          ))}
      </div>
      <div className={styles.overlay} />
      <div className={cn(styles.content, variant === 'style2' && styles.contentCenter)}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {variant === 'style1' && ctas.length > 0 && (
          <div className={styles.ctaRow}>
            {ctas.map((cta) => (
              <ButtonLink
                key={cta.href}
                href={cta.href}
                variant={cta.variant || 'primary'}
                external={cta.external}
                className="pill"
              >
                {cta.label}
              </ButtonLink>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
