'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ProductCard } from '@/components/shop-navigator/types/navigator'
import shared from './columns-shared.module.css'
import styles from './ColumnProducts.module.css'

interface ShopProductCardProps {
  product: ProductCard
  onAddToCart?: () => void
  href: string
}

export function ShopProductCard({ product, onAddToCart, href }: ShopProductCardProps) {
  const imageUrl = product.coverImage?.url ?? product.images?.[0]?.url
  const isRemote = Boolean(imageUrl && /^https?:\/\//i.test(imageUrl))
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${styles.card} ${shared.box}`}
    >
      <div className={styles.cardBody}>
        <div className={styles.media}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.coverImage?.alt || product.images?.[0]?.alt || product.title}
              fill
              className={styles.mediaImage}
              sizes="(max-width: 1024px) 100vw, 320px"
              unoptimized={isRemote}
            />
          ) : (
            <div className={styles.mediaFallback} />
          )}
        </div>

        <div className={styles.textBlock}>
          <h4 className={styles.productTitle}>{product.title}</h4>
          {product.brand && <p className={styles.productBrand}>{product.brand}</p>}
        </div>

        <div className={styles.priceRow}>
          {typeof product.price === 'number' && (
            <span className={styles.price}>
              {product.currency ?? '€'} {product.price}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onAddToCart}
            className={styles.actionButton}
          >
            Aggiungi al carrello
          </button>
          <Link
            href={href}
            className={styles.actionButton}
          >
            Scopri di più
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

interface ColumnProductsProps {
  products: ProductCard[]
  onAddToCart: (product: ProductCard) => void
  productBasePath: string
}

export function ColumnProducts({ products, onAddToCart, productBasePath }: ColumnProductsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
      className={styles.column}
    >
      <div className={styles.heading}>
        <h3 className={styles.title}>Prodotti</h3>
      </div>

      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((product) => (
            <ShopProductCard
              key={product.id}
              product={product}
              onAddToCart={() => onAddToCart(product)}
              href={`${productBasePath}/${product.slug ?? product.id}`}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          Nessun prodotto disponibile per questa selezione
        </div>
      )}
    </motion.div>
  )
}
