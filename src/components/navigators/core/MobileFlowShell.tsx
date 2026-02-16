'use client'

import type { ComponentType, ReactNode } from 'react'

type MobileFlowShellClassNames = {
  overlay: string
  header: string
  headerRow: string
  iconButton: string
  icon: string
  headerTitle: string
  stepLabel: string
  breadcrumb: string
  content: string
}

type MobileFlowShellProps = {
  classNames: MobileFlowShellClassNames
  stepLabel: string
  breadcrumb?: string
  isRootStep: boolean
  onBack: () => void
  onClose: () => void
  BackIcon: ComponentType<{ className?: string }>
  CloseIcon: ComponentType<{ className?: string }>
  children: ReactNode
  footer?: ReactNode
}

export function MobileFlowShell({
  classNames,
  stepLabel,
  breadcrumb,
  isRootStep,
  onBack,
  onClose,
  BackIcon,
  CloseIcon,
  children,
  footer,
}: MobileFlowShellProps) {
  return (
    <div className={classNames.overlay}>
      <div className={classNames.header}>
        <div className={classNames.headerRow}>
          <button onClick={onBack} className={classNames.iconButton} disabled={isRootStep}>
            {!isRootStep && <BackIcon className={classNames.icon} />}
          </button>

          <div className={classNames.headerTitle}>
            <div className={classNames.stepLabel}>{stepLabel}</div>
            {breadcrumb ? <div className={classNames.breadcrumb}>{breadcrumb}</div> : null}
          </div>

          <button onClick={onClose} className={classNames.iconButton}>
            <CloseIcon className={classNames.icon} />
          </button>
        </div>
      </div>

      <div className={classNames.content}>{children}</div>
      {footer}
    </div>
  )
}
