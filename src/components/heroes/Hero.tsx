import Image from 'next/image'

import { ButtonLink } from '@/components/ui/button-link'
import { resolveButtonKind } from '@/components/ui/button-theme'

export type HeroMedia = {
  url: string
  alt: string
  mimeType?: string | null
}

type HeroCta = {
  href: string
  label: string
  kind?: 'main' | 'card' | 'hero'
  external?: boolean
}

type HeroProps = {
  eyebrow?: string
  title: string
  description?: string | null
  variant?: 'style1' | 'style2'
  mediaDark?: HeroMedia | null
  mediaLight?: HeroMedia | null
  eagerMedia?: 'dark' | 'light' | 'both'
  ctas?: HeroCta[]
}

export const Hero = ({
  eyebrow,
  title,
  description,
  variant = 'style1',
  mediaDark,
  mediaLight,
  eagerMedia = 'both',
  ctas = [],
}: HeroProps) => {
  const darkPriority = eagerMedia === 'dark' || eagerMedia === 'both'
  const lightPriority = eagerMedia === 'light' || eagerMedia === 'both'

  return (
    <section
      data-hero="true"
      className={`hero-global ${variant === 'style2' ? 'hero-global--style2' : 'hero-global--style1'}`}
    >
      <div className="hero-global__media-wrap">
        {mediaDark &&
          (mediaDark.mimeType?.startsWith('video/') ? (
            <video
              className="hero-global__media hero-global__media--dark"
              src={mediaDark.url}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              className="hero-global__media hero-global__media--dark"
              src={mediaDark.url}
              alt={mediaDark.alt}
              fill
              priority={darkPriority}
              loading={darkPriority ? 'eager' : 'lazy'}
              fetchPriority={darkPriority ? 'high' : 'low'}
              quality={68}
              sizes="100vw"
            />
          ))}
        {mediaLight &&
          (mediaLight.mimeType?.startsWith('video/') ? (
            <video
              className="hero-global__media hero-global__media--light"
              src={mediaLight.url}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              className="hero-global__media hero-global__media--light"
              src={mediaLight.url}
              alt={mediaLight.alt}
              fill
              priority={lightPriority}
              loading={lightPriority ? 'eager' : 'lazy'}
              fetchPriority={lightPriority ? 'high' : 'low'}
              quality={68}
              sizes="100vw"
            />
          ))}
      </div>
      <div className="hero-global__overlay" />
      <div className={`hero-global__content ${variant === 'style2' ? 'hero-global__content--center' : ''}`}>
        {eyebrow && <p className="hero-global__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="hero-global__description">{description}</p>}
        {variant === 'style1' && ctas.length > 0 && (
          <div className="hero-global__cta-row">
            {ctas.map((cta) => (
              <ButtonLink
                key={cta.href}
                href={cta.href}
                kind={resolveButtonKind(cta.kind)}
                external={cta.external}
                interactive
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
