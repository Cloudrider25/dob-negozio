export type HeroVariant = 'style1' | 'style2' | 'style3'

export type HeroMedia = {
  url: string
  alt?: string | null
  mimeType?: string | null
}

export type HeroCta = {
  href: string
  label: string
  kind?: 'main' | 'card' | 'hero'
  external?: boolean
}

export type StoryHighlightMedia = {
  url: string
  alt?: string | null
}

export type StoryHighlightProps = {
  locale: string
  title?: string | null
  body?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  media?: StoryHighlightMedia | null
}
