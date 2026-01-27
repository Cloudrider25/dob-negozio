'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ProductCard } from '@/components/shop-navigator/types/navigator'

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
      className="navigator-box group relative p-4 rounded-lg transition-all duration-300 w-full text-left"
    >
      <div className="flex flex-col gap-3">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.coverImage?.alt || product.images?.[0]?.alt || product.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 320px"
              unoptimized={isRemote}
            />
          ) : (
            <div className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--paper)_50%,transparent)]" />
          )}
        </div>

        <div className="space-y-1">
          <h4 className="text-base font-medium text-text-primary leading-tight">
            {product.title}
          </h4>
          {product.brand && <p className="text-xs text-text-muted">{product.brand}</p>}
        </div>

        <div className="flex items-center gap-2 text-sm text-text-muted">
          {typeof product.price === 'number' && (
            <span className="text-text-primary font-medium">
              {product.currency ?? '€'} {product.price}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={onAddToCart}
            className="px-4 py-2 rounded-full border border-stroke text-sm text-text-primary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
          >
            Aggiungi al carrello
          </button>
          <Link
            href={href}
            className="px-4 py-2 rounded-full border border-stroke text-sm text-text-primary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
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
      className="navigator-column"
    >
      <div className="mb-1">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          Prodotti
        </h3>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto overflow-x-visible">
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
        <div className="p-6 text-center text-text-muted text-sm">
          Nessun prodotto disponibile per questa selezione
        </div>
      )}
    </motion.div>
  )
}
