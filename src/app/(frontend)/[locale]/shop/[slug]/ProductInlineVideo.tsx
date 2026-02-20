'use client'

import { useRef, useState } from 'react'

import styles from './product-detail.module.css'
import { ScrollZoomOnScroll } from '@/components/ui/ScrollZoomOnScroll'

type ProductInlineVideoProps = {
  src: string
  poster?: string
  label?: string
}

export function ProductInlineVideo({ src, poster, label = 'Play video' }: ProductInlineVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [started, setStarted] = useState(false)

  const startPlayback = async () => {
    const node = videoRef.current
    if (!node) return
    try {
      await node.play()
      setStarted(true)
    } catch {
      // No-op: browser may block autoplay until user interaction.
    }
  }

  return (
    <div className={styles.videoPlaceholder}>
      <ScrollZoomOnScroll enabled={!started} className={styles.videoZoomLayer}>
        <video
          ref={videoRef}
          className={styles.video}
          src={src}
          controls={started}
          playsInline
          preload="none"
          poster={poster}
        />
      </ScrollZoomOnScroll>
      {!started ? (
        <button
          type="button"
          className={styles.videoPlayOverlay}
          onClick={startPlayback}
          aria-label={label}
        >
          <span className={styles.videoPlayIcon} aria-hidden="true">
            ▶
          </span>
        </button>
      ) : null}
    </div>
  )
}
