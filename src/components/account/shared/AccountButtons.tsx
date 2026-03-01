'use client'

import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import styles from './AccountButtons.module.css'

type AccountButtonProps = Omit<ComponentProps<typeof Button>, 'kind' | 'size' | 'interactive'>
type AccountIconActionProps = AccountButtonProps & {
  compact?: boolean
}

export function AccountPillButton({ className, ...props }: AccountButtonProps) {
  return <Button kind="main" size="md" className={cn(styles.pillButton, className)} {...props} />
}

export function AccountIconAction({ className, compact = false, ...props }: AccountIconActionProps) {
  return (
    <Button
      kind="main"
      size="sm"
      className={cn(styles.inlineActionButton, compact && styles.inlineActionCompact, className)}
      {...props}
    />
  )
}
