import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type SectionSubtitleSize = 'body-lg' | 'body' | 'small' | 'caption'

const sizeClassMap: Record<SectionSubtitleSize, string> = {
  'body-lg': 'typo-body-lg',
  body: 'typo-body',
  small: 'typo-small',
  caption: 'typo-caption',
}

export function SectionSubtitle({
  as = 'p',
  size = 'body',
  uppercase = false,
  className,
  children,
}: {
  as?: 'p' | 'div' | 'span' | 'h2' | 'h3' | 'h4'
  size?: SectionSubtitleSize
  uppercase?: boolean
  className?: string
  children: ReactNode
}) {
  const Component = as
  const typoClass = `${sizeClassMap[size]}${uppercase ? '-upper' : ''}`

  return <Component className={cn(typoClass, className)}>{children}</Component>
}
