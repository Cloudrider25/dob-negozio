'use client'

import { useEffect, useState } from 'react'

export const useDesktopViewport = (query = '(min-width: 1025px)') => {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const syncViewport = () => setIsDesktop(media.matches)
    syncViewport()
    media.addEventListener('change', syncViewport)
    return () => media.removeEventListener('change', syncViewport)
  }, [query])

  return isDesktop
}
