'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

import styles from './ProgramsSplitSection.module.css'

type ProgramItem = {
  id: string
  title: string
  subtitle: string
  price: string
  rating: string
  cta: string
  image: string
  alt: string
}

const items: ProgramItem[] = [
  {
    id: 'barrier',
    title: 'Barrier Restore Cream',
    subtitle: 'Comforting daily moisturizer',
    price: '€42,00',
    rating: '★★★★☆ (3,566)',
    cta: 'Buy BRC - €42,00',
    image: '/media/hero_homepage_light.png',
    alt: 'Barrier Restore Cream',
  },
  {
    id: 'glow',
    title: 'Glaze Serum',
    subtitle: 'Hydrating glow serum',
    price: '€38,00',
    rating: '★★★★☆ (2,410)',
    cta: 'Buy Glaze - €38,00',
    image: '/media/hero_homepage_light.png',
    alt: 'Glaze Serum',
  },
]

export const ProgramsSplitSection = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = items[activeIndex]

  const total = items.length
  const counter = useMemo(() => `${activeIndex + 1}/${total}`, [activeIndex, total])

  return (
    <section className={styles.section} aria-label="Programmi DOB">
      <div className={styles.left}>
        <Image
          src="/media/hero_homepage_light.png"
          alt="DOB program"
          fill
          sizes="(max-width: 900px) 100vw, 48vw"
        />
        <div className={styles.dots}>
          {items.map((item, index) => (
            <button
              key={item.id}
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
              onClick={() => setActiveIndex(index)}
              type="button"
              aria-label={`Vai a ${item.title}`}
            />
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.productMedia}>
          <Image src={active.image} alt={active.alt} fill sizes="40vw" />
        </div>
        <div className={styles.controls}>
          <button
            className={styles.arrow}
            type="button"
            onClick={() => setActiveIndex((i) => (i - 1 + total) % total)}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className={styles.arrow}
            type="button"
            onClick={() => setActiveIndex((i) => (i + 1) % total)}
            aria-label="Next"
          >
            ›
          </button>
        </div>
        <div className={styles.meta}>
          <span>{active.rating}</span>
          <span className={styles.price}>{active.price}</span>
        </div>
        <h3 className={styles.title}>{active.title}</h3>
        <p className={styles.subtitle}>{active.subtitle}</p>
        <button className={styles.cta} type="button">
          {active.cta}
        </button>
        <span className={styles.counter}>{counter}</span>
      </div>
    </section>
  )
}
