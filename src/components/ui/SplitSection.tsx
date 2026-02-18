import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type SplitSectionProps = {
  left?: ReactNode
  right?: ReactNode
  className?: string
  leftClassName?: string
  rightClassName?: string
} & Omit<ComponentPropsWithoutRef<'section'>, 'children'>

export const SplitSection = ({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
  ...props
}: SplitSectionProps) => {
  return (
    <section className={cn('ui-split-section', className)} {...props}>
      <div className={cn('ui-split-column', leftClassName)}>{left}</div>
      <div className={cn('ui-split-column', rightClassName)}>{right}</div>
    </section>
  )
}
