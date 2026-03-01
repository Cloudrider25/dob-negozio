'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/cn'
import styles from './MediaThumb.module.css'

type MediaThumbProps = {
  src?: string | null
  alt: string
  sizes: string
  className?: string
  imageClassName?: string
  fallback?: ReactNode
  children?: ReactNode
  unoptimized?: boolean
  priority?: boolean
}

export function MediaThumb({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  fallback = null,
  children,
  unoptimized = false,
  priority = false,
}: MediaThumbProps) {
  const normalizedSrc = typeof src === 'string' ? src.trim() : ''
  const hasImage = normalizedSrc.length > 0

  return (
    <span className={cn(styles.root, className)}>
      {hasImage ? (
        <Image
          src={normalizedSrc}
          alt={alt}
          fill
          sizes={sizes}
          className={cn(styles.image, imageClassName)}
          unoptimized={unoptimized}
          priority={priority}
        />
      ) : (
        fallback
      )}
      {children}
    </span>
  )
}
