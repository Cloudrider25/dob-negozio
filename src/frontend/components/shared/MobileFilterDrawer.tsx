'use client'

import { useEffect } from 'react'
import { MinusIcon } from '@heroicons/react/24/outline'
import styles from './MobileFilterDrawer.module.css'

export type MobileFilterOption = {
  value: string
  label: string
}

export type MobileFilterGroup = {
  id: string
  label?: string
  value: string
  options: MobileFilterOption[]
  onChange: (value: string) => void
}

type MobileFilterDrawerProps = {
  open: boolean
  title: string
  groups: MobileFilterGroup[]
  onClose: () => void
}

export function MobileFilterDrawer({ open, title, groups, onClose }: MobileFilterDrawerProps) {
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const previousOverflow = document.body.style.overflow
    const previousPosition = document.body.style.position
    const previousTop = document.body.style.top
    const previousWidth = document.body.style.width

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.position = previousPosition
      document.body.style.top = previousTop
      document.body.style.width = previousWidth
      window.scrollTo(0, scrollY)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <p className={`${styles.title} typo-body-lg-upper`}>{title}</p>
          <button
            type="button"
            className={styles.close}
            aria-label="Chiudi filtri"
            onClick={onClose}
          >
            <MinusIcon width={20} height={20} aria-hidden="true" />
          </button>
        </div>

        {groups.map((group) => (
          <div key={group.id} className={styles.group}>
            {group.label ? (
              <p className={`${styles.groupLabel} typo-caption-upper`}>{group.label}</p>
            ) : null}
            {group.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${
                  group.value === option.value ? styles.optionActive : ''
                } typo-body-lg`}
                onClick={() => {
                  group.onChange(option.value)
                  onClose()
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
