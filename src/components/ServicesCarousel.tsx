'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type ServiceItem = {
  id: number | string
  name?: string | null
  description?: string | null
}

type ServicesCarouselProps = {
  items: ServiceItem[]
  groupLabel: string
  imageLeft: string
  imageRight: string
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
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(items.length / perView))

  const images = useMemo(() => [imageLeft, imageRight], [imageLeft, imageRight])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const update = () => {
      const width = el.clientWidth
      setPerView(getItemsPerView(width))
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
    el.scrollTo({ left: page * el.clientWidth, behavior: 'smooth' })
  }, [page])

  const goPrev = () => setPage((current) => (current - 1 + totalPages) % totalPages)
  const goNext = () => setPage((current) => (current + 1) % totalPages)

  return (
    <div className="services-carousel">
      <div className="services-carousel-controls">
        <button type="button" className="carousel-arrow" onClick={goPrev} aria-label="Previous">
          ←
        </button>
        <button type="button" className="carousel-arrow" onClick={goNext} aria-label="Next">
          →
        </button>
      </div>
      <div className="services-carousel-track" ref={trackRef}>
        {items.map((service, index) => {
          const serviceImage = images[index % images.length]
          return (
            <article className="service-tile" key={service.id}>
              <div className="service-tile-header">
                <div className="service-tile-meta">
                  <span className="service-tile-index">
                    {String(index + 1).padStart(3, '0')}
                  </span>
                  <span className="service-tile-group">{groupLabel}</span>
                </div>
                <h3 className="service-tile-title">{service.name}</h3>
                <p className="service-tile-desc">
                  {service.description || 'Trattamento su misura.'}
                </p>
              </div>
              <div className="service-tile-media">
                <img src={serviceImage} alt={service.name || 'Service image'} loading="lazy" />
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
