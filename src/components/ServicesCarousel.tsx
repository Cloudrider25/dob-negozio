'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

import styles from './ServicesCarousel.module.css'

type ServiceItem = {
  id: number | string
  name?: string | null
  description?: string | null
}

type ServicesCarouselProps = {
  items: ServiceItem[]
  groupLabel: string
  imageLeft: { url: string; alt: string; mimeType?: string | null }
  imageRight: { url: string; alt: string; mimeType?: string | null }
  autoplayMs?: number
}

const getItemsPerView = (width: number) => {
  if (width <= 700) return 1
  if (width <= 1200) return 2
  return 3
}

export const ServicesCarousel = ({
  items,
  groupLabel,
  imageLeft,
  imageRight,
  autoplayMs = 5000,
}: ServicesCarouselProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [perView, setPerView] = useState(3)
  const [cardWidth, setCardWidth] = useState(320)
  const [gap, setGap] = useState(28)
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(items.length / perView))
  const trackStyle = {
    '--carousel-gap': `${gap}px`,
    '--carousel-card-width': `${cardWidth}px`,
  } as CSSProperties

  const images = useMemo(() => [imageLeft, imageRight], [imageLeft, imageRight])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const update = () => {
      const width = el.getBoundingClientRect().width
      if (!width) return
      const viewport = window.innerWidth
      const nextPerView = getItemsPerView(viewport)
      const nextGap = viewport <= 768 ? 16 : viewport <= 1100 ? 19 : 28
      const nextCardWidthRaw = (width - nextGap * (nextPerView - 1)) / nextPerView
      const nextCardWidth = Number.isFinite(nextCardWidthRaw) ? nextCardWidthRaw : 320
      setPerView(nextPerView)
      setGap(nextGap)
      setCardWidth(Math.max(nextCardWidth, 240))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el || totalPages <= 1) return

    const id = window.setInterval(() => {
      setPage((current) => (current + 1) % totalPages)
    }, autoplayMs)

    return () => window.clearInterval(id)
  }, [autoplayMs, totalPages])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const offset = (cardWidth + gap) * perView
    el.scrollTo({ left: page * offset, behavior: 'smooth' })
  }, [page, cardWidth, gap, perView])

  const goPrev = () => setPage((current) => (current - 1 + totalPages) % totalPages)
  const goNext = () => setPage((current) => (current + 1) % totalPages)

  return (
    <div className="relative">
      <div className="absolute right-0 top-[calc(-1*var(--s32))] flex gap-2.5 max-[768px]:static max-[768px]:mb-4 max-[768px]:justify-end">
        <button
          type="button"
          className="button-base inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition hover:-translate-y-0.5 hover:border-accent-red"
          onClick={goPrev}
          aria-label="Previous"
        >
          ←
        </button>
        <button
          type="button"
          className="button-base inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition hover:-translate-y-0.5 hover:border-accent-red"
          onClick={goNext}
          aria-label="Next"
        >
          →
        </button>
      </div>
      <div className="overflow-x-auto scroll-smooth" ref={trackRef}>
        <div className={styles.track} style={trackStyle}>
          {items.map((service, index) => {
            const serviceImage = images[index % images.length]
            const isVideo = serviceImage?.mimeType?.startsWith('video/')
            return (
              <article
                className={`relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-[20px] border border-stroke bg-[var(--pearl-grad)] shadow-lux before:absolute before:inset-0 before:bg-[var(--pearl-highlight)] before:content-[''] ${styles.card}`}
                key={service.id}
              >
                <div className="relative z-[1] flex min-h-[260px] flex-1 flex-col gap-3 px-[2.2rem] pb-[1.6rem] pt-8">
                  <div className="flex items-center gap-4 text-[0.75rem] uppercase tracking-[0.24em] text-text-secondary">
                    <span className="font-semibold">
                      {String(index + 1).padStart(3, '0')}
                    </span>
                    <span>{groupLabel}</span>
                  </div>
                  <h3 className="text-[1.5rem] tracking-[0.02em] text-text-primary">
                    {service.name}
                  </h3>
                  <p className="m-0 text-[0.95rem] text-text-muted">
                    {service.description || 'Trattamento su misura.'}
                  </p>
                  <div className="mt-auto pt-4 text-[0.75rem] uppercase tracking-[0.18em] text-text-primary">
                    Scopri →
                  </div>
                </div>
                <div className="overflow-hidden border-t border-stroke">
                  {isVideo ? (
                    <video
                      className="h-[250px] w-full object-cover"
                      src={serviceImage.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <div className="relative h-[250px] w-full">
                      <Image
                        className="object-cover"
                        src={serviceImage.url}
                        alt={serviceImage.alt || service.name || 'Service image'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
