export type LabelVariant = 'field' | 'section' | 'meta'
export type LabelTone = 'default' | 'muted' | 'inverse'

export const resolveLabelVariant = (variant?: LabelVariant | null): LabelVariant => variant ?? 'field'
export const resolveLabelTone = (tone?: LabelTone | null): LabelTone => tone ?? 'default'

export type LabelPalette = {
  color: string
  size: string
  line: string
  tracking: string
  transform: 'none' | 'uppercase'
  weight: number
}

const getTypographyByVariant = (variant: LabelVariant) => {
  if (variant === 'section') {
    return {
      size: 'var(--type-caption-size)',
      line: 'var(--type-caption-line)',
      tracking: 'var(--type-caption-track)',
      transform: 'uppercase' as const,
      weight: 400,
    }
  }

  if (variant === 'meta') {
    return {
      size: 'var(--type-small-size)',
      line: 'var(--type-small-line)',
      tracking: 'var(--type-small-track)',
      transform: 'uppercase' as const,
      weight: 400,
    }
  }

  return {
    size: 'var(--type-small-size)',
    line: 'var(--type-small-line)',
    tracking: 'var(--type-small-track)',
    transform: 'none' as const,
    weight: 400,
  }
}

const getColorByTone = (tone: LabelTone) => {
  if (tone === 'inverse') return 'var(--text-inverse)'
  if (tone === 'muted') return 'var(--text-muted)'
  return 'var(--text-secondary)'
}

export const getLabelPalette = (variant: LabelVariant, tone: LabelTone): LabelPalette => {
  const type = getTypographyByVariant(variant)

  return {
    color: getColorByTone(tone),
    size: type.size,
    line: type.line,
    tracking: type.tracking,
    transform: type.transform,
    weight: type.weight,
  }
}
