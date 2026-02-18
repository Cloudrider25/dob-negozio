import type { CSSProperties, HTMLAttributes, LabelHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import {
  getLabelPalette,
  resolveLabelTone,
  resolveLabelVariant,
  type LabelTone,
  type LabelVariant,
} from '@/components/ui/label-theme'

type SharedProps = {
  variant?: LabelVariant
  tone?: LabelTone
  required?: boolean
}

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & SharedProps

export const Label = ({
  className,
  style,
  variant,
  tone,
  required,
  children,
  ...props
}: LabelProps) => {
  const resolvedVariant = resolveLabelVariant(variant)
  const resolvedTone = resolveLabelTone(tone)
  const palette = getLabelPalette(resolvedVariant, resolvedTone)

  const labelStyle: CSSProperties = {
    '--label-color': palette.color,
    '--label-size': palette.size,
    '--label-line': palette.line,
    '--label-track': palette.tracking,
    '--label-transform': palette.transform,
    '--label-weight': palette.weight,
    ...(style ?? {}),
  } as CSSProperties

  return (
    <label className={cn('ui-label', className)} style={labelStyle} {...props}>
      {children}
      {required ? <span aria-hidden="true">*</span> : null}
    </label>
  )
}

type LabelTextProps = HTMLAttributes<HTMLSpanElement> &
  SharedProps & {
    as?: 'span' | 'div' | 'p'
  }

export const LabelText = ({
  as = 'span',
  className,
  style,
  variant,
  tone,
  required,
  children,
  ...props
}: LabelTextProps) => {
  const Comp = as
  const resolvedVariant = resolveLabelVariant(variant)
  const resolvedTone = resolveLabelTone(tone)
  const palette = getLabelPalette(resolvedVariant, resolvedTone)

  const labelStyle: CSSProperties = {
    '--label-color': palette.color,
    '--label-size': palette.size,
    '--label-line': palette.line,
    '--label-track': palette.tracking,
    '--label-transform': palette.transform,
    '--label-weight': palette.weight,
    ...(style ?? {}),
  } as CSSProperties

  return (
    <Comp className={cn('ui-label', className)} style={labelStyle} {...props}>
      {children}
      {required ? <span aria-hidden="true">*</span> : null}
    </Comp>
  )
}
