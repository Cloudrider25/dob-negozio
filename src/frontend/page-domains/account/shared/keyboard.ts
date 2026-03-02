import type { KeyboardEvent } from 'react'

export function onEnterOrSpace(
  event: KeyboardEvent<HTMLElement>,
  callback: () => void,
) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  callback()
}
