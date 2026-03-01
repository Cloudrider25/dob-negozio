import Image from 'next/image'

import { ButtonLink } from '@/components/ui/button-link'
import { resolveButtonKind } from '@/components/ui/button-theme'
import { cn } from '@/lib/cn'
import type { HeroCta, HeroMedia, HeroVariant } from './shared/contracts'
import { isHeroVideoMime, normalizeHeroMedia, resolveHeroMediaLayers, type HeroMediaLayer } from './shared/media'
import styles from './Hero.module.css'

type HeroProps = {
  eyebrow?: string
  title: string
  description?: string | null
  variant?: HeroVariant
  mediaDark?: HeroMedia | null
  mediaLight?: HeroMedia | null
  eagerMedia?: 'dark' | 'light' | 'both'
  titleAs?: 'h1' | 'h2'
  ariaLabel?: string
  showOverlay?: boolean
  ctas?: HeroCta[]
}

const resolveLayerClassName = (mode: HeroMediaLayer['mode']) => {
  if (mode === 'single') return styles.mediaSingle
  if (mode === 'dark') return styles.mediaDark
  return styles.mediaLight
}

const HeroMediaAsset = ({
  layer,
  fallbackAlt,
}: {
  layer: HeroMediaLayer
  fallbackAlt: string
}) => {
  if (isHeroVideoMime(layer.media.mimeType)) {
    return (
      <video
        className={cn(styles.media, resolveLayerClassName(layer.mode))}
        src={layer.media.url}
        autoPlay
        muted
        loop
        playsInline
        preload={layer.priority ? 'auto' : 'metadata'}
      />
    )
  }

  return (
    <Image
      className={cn(styles.media, resolveLayerClassName(layer.mode))}
      src={layer.media.url}
      alt={layer.media.alt || fallbackAlt}
      fill
      priority={layer.priority}
      loading={layer.priority ? 'eager' : 'lazy'}
      fetchPriority={layer.priority ? 'high' : 'low'}
      quality={68}
      sizes="100vw"
    />
  )
}

export const Hero = ({
  title,
  description,
  variant = 'style1',
  mediaDark,
  mediaLight,
  eagerMedia = 'both',
  titleAs = 'h1',
  ariaLabel,
  showOverlay = true,
  ctas = [],
}: HeroProps) => {
  const isStyle2 = variant === 'style2'
  const isStyle3 = variant === 'style3'
  const isStyle1 = !isStyle2 && !isStyle3
  const darkMedia = normalizeHeroMedia({ media: mediaDark, fallbackAlt: title })
  const lightMedia = normalizeHeroMedia({ media: mediaLight, fallbackAlt: title })
  const mediaLayers = resolveHeroMediaLayers({ darkMedia, lightMedia, eagerMedia })
  const TitleTag = titleAs

  return (
    <section
      data-hero="true"
      aria-label={ariaLabel}
      className={cn(styles.hero, isStyle1 && styles.style1, isStyle2 && styles.style2, isStyle3 && styles.style3)}
    >
      <div className={styles.mediaWrap}>
        {mediaLayers.map((layer) => (
          <HeroMediaAsset
            key={`${layer.mode}-${layer.media.url}`}
            layer={layer}
            fallbackAlt={title}
          />
        ))}
      </div>
      {showOverlay && <div className={styles.overlay} />}
      <div className={cn(styles.content, (isStyle2 || isStyle3) && styles.contentCenter)}>
        <TitleTag>{title}</TitleTag>
        {description && <p className={styles.description}>{description}</p>}
        {!isStyle2 && ctas.length > 0 && (
          <div className={styles.ctaRow}>
            {ctas.map((cta) => (
              <ButtonLink
                key={cta.href}
                href={cta.href}
                kind={resolveButtonKind(cta.kind)}
                className={styles.heroCta}
                external={cta.external}
                interactive
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
