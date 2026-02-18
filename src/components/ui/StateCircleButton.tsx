'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import styles from './StateCircleButton.module.css'

type StateCircleButtonProps = {
  active?: boolean
  selected?: boolean
  dimmed?: boolean
  baseClassName: string
  activeClassName?: string
  selectedClassName?: string
  dimmedClassName?: string
  typographyClassName?: string
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function StateCircleButton({
  active = false,
  selected = false,
  dimmed = false,
  baseClassName,
  activeClassName,
  selectedClassName,
  dimmedClassName,
  typographyClassName,
  className,
  children,
  type = 'button',
  ...props
}: StateCircleButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        styles.button,
        baseClassName,
        typographyClassName,
        active && styles.active,
        selected && styles.selected,
        dimmed && styles.dimmed,
        active && activeClassName,
        selected && selectedClassName,
        dimmed && dimmedClassName,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
