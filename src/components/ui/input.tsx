import { forwardRef } from 'react'
import type { CSSProperties, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import { getInputPalette, resolveInputKind, type InputKind } from '@/components/ui/input-theme'

type InputSharedProps = {
  kind?: InputKind
  size?: 'default' | 'compact'
}

type UIInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & InputSharedProps
type UISelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & InputSharedProps
type UITextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & InputSharedProps

const sharedClasses =
  'w-full rounded-[14px] border px-4 bg-[var(--input-bg)] text-[color:var(--input-text)] border-[color:var(--input-border)] placeholder:text-[color:var(--input-placeholder)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--input-focus-ring)] focus-visible:border-[color:var(--input-focus-border)]'

const toStyleVars = (kind?: InputKind, style?: CSSProperties): CSSProperties => {
  const palette = getInputPalette(resolveInputKind(kind))
  return {
    '--input-bg': palette.bg,
    '--input-text': palette.text,
    '--input-border': palette.border,
    '--input-placeholder': palette.placeholder,
    '--input-focus-border': palette.focusBorder,
    '--input-focus-ring': palette.focusRing,
    ...(style ?? {}),
  } as CSSProperties
}

export const Input = forwardRef<HTMLInputElement, UIInputProps>(function Input(
  { className, kind, size = 'default', style, ...props },
  ref,
) {
  const sizeClass = size === 'compact' ? 'h-[38px] text-[0.85rem] px-3' : 'h-12'
  return (
    <input
      ref={ref}
      className={cn(sharedClasses, sizeClass, className)}
      style={toStyleVars(kind, style)}
      {...props}
    />
  )
})

export const Select = forwardRef<HTMLSelectElement, UISelectProps>(function Select(
  { className, kind, size = 'default', style, ...props },
  ref,
) {
  const sizeClass = size === 'compact' ? 'h-[38px] text-[0.85rem] px-3' : 'h-12'
  return (
    <select
      ref={ref}
      className={cn(sharedClasses, sizeClass, className)}
      style={toStyleVars(kind, style)}
      {...props}
    />
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, UITextareaProps>(function Textarea(
  { className, kind, style, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(sharedClasses, 'min-h-28 py-3', className)}
      style={toStyleVars(kind, style)}
      {...props}
    />
  )
})
