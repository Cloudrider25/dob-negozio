import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type SplitSectionProps = {
  left?: ReactNode
  right?: ReactNode
  className?: string
  leftClassName?: string
  rightClassName?: string
  mobileOrder?: 'default' | 'left-first' | 'right-first'
} & Omit<ComponentPropsWithoutRef<'section'>, 'children'>

export const SplitSection = ({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
  mobileOrder = 'default',
  ...props
}: SplitSectionProps) => {
  const leftMobileClass = mobileOrder === 'left-first' ? 'ui-split-mobile-first' : undefined
  const rightMobileClass = mobileOrder === 'right-first' ? 'ui-split-mobile-first' : undefined

  return (
    <section className={cn('ui-split-section', className)} {...props}>
      <div className={cn('ui-split-column', leftMobileClass, leftClassName)}>{left}</div>
      <div className={cn('ui-split-column', rightMobileClass, rightClassName)}>{right}</div>
    </section>
  )
}
