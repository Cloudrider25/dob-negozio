import type { ReactNode } from 'react'

import { SectionTitle } from '@/components/sections/SectionTitle'
import { cn } from '@/lib/cn'

import { AccountIconAction } from './AccountButtons'
import styles from './AccountModal.module.css'

type AccountModalProps = {
  open: boolean
  titleId: string
  title: ReactNode
  onClose: () => void
  children: ReactNode
  overlayClassName?: string
  cardClassName?: string
  headerClassName?: string
  titleClassName?: string
  closeButtonClassName?: string
}

export function AccountModal({
  open,
  titleId,
  title,
  onClose,
  children,
  overlayClassName,
  cardClassName,
  headerClassName,
  titleClassName,
  closeButtonClassName,
}: AccountModalProps) {
  if (!open) return null

  return (
    <div
      className={cn(styles.overlay, overlayClassName)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={cn(styles.card, cardClassName)}>
        <div className={cn(styles.header, headerClassName)}>
          <SectionTitle as="h3" size="h3" className={cn(styles.title, titleClassName)}>
            <span id={titleId}>{title}</span>
          </SectionTitle>
          <AccountIconAction
            type="button"
            className={cn(styles.closeButton, 'typo-caption-upper', closeButtonClassName)}
            onClick={onClose}
          >
            Chiudi
          </AccountIconAction>
        </div>
        {children}
      </div>
    </div>
  )
}

export const accountModalClassNames = {
  grid: styles.grid,
  input: styles.input,
  actions: styles.actions,
}
