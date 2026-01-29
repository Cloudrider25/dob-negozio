'use client'

import type { CSSProperties, ReactNode } from 'react'
import { CustomCard } from '@tsamantanis/react-glassmorphism'

type GlassCardProps = {
  children: ReactNode
  className?: string
  paddingClassName?: string
  variant?: 'pill' | 'default'
  style?: CSSProperties
}

const GlassBase = CustomCard as unknown as React.FC<{
  effectColor: string
  blur?: number
  borderRadius?: number
  color?: string
  boxShadow?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}>

export function GlassCard({
  children,
  className,
  paddingClassName,
  variant = 'default',
  style,
}: GlassCardProps) {
  return (
    <GlassBase
      effectColor="rgba(255, 255, 255, 0.88);"
      blur={18}
      borderRadius={12}
      color="inherit"
      boxShadow="0 22px 54px rgba(10, 18, 30, 0.22), 0 8px 18px rgba(10, 18, 30, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -12px 20px rgba(0, 0, 0, 0.07)"
      className={`glass-card ${variant === 'pill' ? 'glass-pill' : ''} ${className ?? ''}`}
      style={{ padding: 0, width: '100%', ...style }}
    >
      <div className={paddingClassName}>{children}</div>
    </GlassBase>
  )
}
