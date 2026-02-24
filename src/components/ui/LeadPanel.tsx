import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import styles from './LeadPanel.module.css'

type LeadPanelProps = {
  header?: ReactNode
  stickyHeader?: boolean
  contentClassName?: string
} & ComponentPropsWithoutRef<'div'>

export const LeadPanel = ({
  header,
  stickyHeader = false,
  className,
  contentClassName,
  children,
  ...props
}: LeadPanelProps) => {
  return (
    <div className={cn(styles.panel, className)} {...props}>
      {header ? (
        <div className={cn(styles.header, stickyHeader ? styles.headerSticky : undefined)}>
          {header}
        </div>
      ) : null}
      <div className={cn(styles.content, contentClassName)}>{children}</div>
    </div>
  )
}

