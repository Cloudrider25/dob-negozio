import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import styles from './SplitSection.module.css'

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
    <section className={cn(styles.splitSection, className)} {...props}>
      <div className={cn(styles.splitColumn, leftClassName)}>{left}</div>
      <div className={cn(styles.splitColumn, rightClassName)}>{right}</div>
    </section>
  )
}
