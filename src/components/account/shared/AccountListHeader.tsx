import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './AccountListHeader.module.css'

type AccountListHeaderProps = {
  className?: string
  variant: 'orders' | 'services'
  columns: ReadonlyArray<ReactNode>
}

export function AccountListHeader({ className, variant, columns }: AccountListHeaderProps) {
  return (
    <div className={cn(styles.root, styles[variant], className)} aria-hidden="true">
      {columns.map((column, index) => (
        <span key={typeof column === 'string' ? column : `col-${index}`}>{column}</span>
      ))}
    </div>
  )
}
