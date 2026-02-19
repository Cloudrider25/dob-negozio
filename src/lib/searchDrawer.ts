export const SEARCH_DRAWER_OPEN_EVENT = 'dob:search-drawer-open'
export const SEARCH_DRAWER_OPEN_REQUESTED_FLAG = '__dobSearchDrawerRequestedOpen'

declare global {
  interface Window {
    __dobSearchDrawerRequestedOpen?: boolean
  }
}

export const emitSearchDrawerOpen = () => {
  if (typeof window === 'undefined') return
  window[SEARCH_DRAWER_OPEN_REQUESTED_FLAG] = true
  window.dispatchEvent(new Event(SEARCH_DRAWER_OPEN_EVENT))
}

export const consumeSearchDrawerOpenRequest = (): boolean => {
  if (typeof window === 'undefined') return false
  const requested = Boolean(window[SEARCH_DRAWER_OPEN_REQUESTED_FLAG])
  if (requested) {
    window[SEARCH_DRAWER_OPEN_REQUESTED_FLAG] = false
  }
  return requested
}
