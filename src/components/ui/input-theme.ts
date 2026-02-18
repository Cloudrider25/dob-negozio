export type InputKind = 'default' | 'admin'

export const resolveInputKind = (kind?: InputKind | null): InputKind => kind ?? 'default'

export const getInputPalette = (kind: InputKind) => {
  if (kind === 'admin') {
    return {
      bg: 'var(--theme-elevation-0)',
      text: 'var(--theme-text)',
      border: 'var(--theme-elevation-200)',
      placeholder: 'var(--theme-text-light)',
      focusBorder: 'color-mix(in srgb, var(--theme-text) 40%, var(--theme-elevation-200))',
      focusRing: 'color-mix(in srgb, var(--theme-text) 20%, transparent)',
    }
  }

  return {
    bg: 'var(--paper)',
    text: 'var(--text-primary)',
    border: 'var(--stroke)',
    placeholder: 'var(--text-muted)',
    focusBorder: 'color-mix(in srgb, var(--text-primary) 45%, var(--stroke))',
    focusRing: 'color-mix(in srgb, var(--text-primary) 22%, transparent)',
  }
}
