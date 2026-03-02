'use client'

import { getCarouselItemKey, CarouselCard, type CarouselItem } from '@/frontend/components/carousel'
import styles from './ShopAllSection.module.css'

export function ShopAllSection({ items }: { items: CarouselItem[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <CarouselCard key={getCarouselItemKey(item, index)} item={item} />
        ))}
      </div>
    </section>
  )
}
