import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type SectionTitleLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
type SectionTitleSize = 'h1' | 'h2' | 'h3' | 'h4' | 'body'

const sizeClassMap: Record<SectionTitleSize, string> = {
  h1: 'typo-h1',
  h2: 'typo-h2',
  h3: 'typo-h3',
  h4: 'typo-body-lg',
  body: 'typo-body',
}

export function SectionTitle({
  as = 'h2',
  size = 'h2',
  uppercase = false,
  className,
  children,
}: {
  as?: SectionTitleLevel
  size?: SectionTitleSize
  uppercase?: boolean
  className?: string
  children: ReactNode
}) {
  const Component = as
  const typoClass = `${sizeClassMap[size]}${uppercase ? '-upper' : ''}`

  return <Component className={cn(typoClass, className)}>{children}</Component>
}
