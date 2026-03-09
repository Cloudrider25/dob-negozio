'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/shared/ui/cn'
import styles from './SideDrawer.module.css'

type SideDrawerProps = {
  open: boolean
  onClose: () => void
  ariaLabel: string
  title: ReactNode
  headerCenter?: ReactNode
  children: ReactNode
  panelClassName?: string
  placement?: 'right' | 'left' | 'bottom'
}

export function SideDrawer({
  open,
  onClose,
  ariaLabel,
  title,
  headerCenter,
  children,
  panelClassName,
  placement = 'right',
}: SideDrawerProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, open])

  return (
    <div className={cn(styles.root, open && styles.open)}>
      <div className={styles.backdrop} aria-hidden={!open} onClick={onClose} />
      <aside
        className={cn(
          styles.panel,
          placement === 'left' && styles.panelLeft,
          placement === 'bottom' && styles.panelBottom,
          panelClassName,
        )}
        aria-label={ariaLabel}
      >
        <div className={`${styles.header} typo-caption-upper`}>
          <span className={styles.title}>{title}</span>
          <span className={styles.center}>{headerCenter}</span>
          <button className={`${styles.closeButton} typo-h3`} type="button" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}
