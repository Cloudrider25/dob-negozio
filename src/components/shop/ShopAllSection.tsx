'use client'

import { getCarouselItemKey, UICCarouselCard, type CarouselItem } from '@/components/carousel'
import styles from './ShopAllSection.module.css'

export function ShopAllSection({ items }: { items: CarouselItem[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <UICCarouselCard key={getCarouselItemKey(item, index)} item={item} />
        ))}
      </div>
    </section>
  )
}
