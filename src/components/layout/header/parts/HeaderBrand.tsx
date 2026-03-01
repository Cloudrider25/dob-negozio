'use client'

import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/cn'
import styles from '../Header.module.css'

type HeaderBrandProps = {
  locale: string
  brandLabel: string
}

export const HeaderBrand = ({ locale, brandLabel }: HeaderBrandProps) => {
  return (
    <div className={cn(styles.brand, 'typo-caption-upper')}>
      <Link href={`/${locale}`} className={cn(styles.brand, 'typo-caption-upper')}>
        <span className={styles.brandMark}>
          <Image
            className={styles.logoDark}
            src="/brand/logo-black.png"
            alt=""
            width={54}
            height={54}
            priority
          />
          <Image
            className={styles.logoLight}
            src="/brand/logo-white.png"
            alt=""
            width={54}
            height={54}
            priority
          />
        </span>
        <h1 className={`${styles.brandTitle} dob-font typo-display-upper`}>DOB</h1>
        <span className="sr-only">{brandLabel}</span>
      </Link>
    </div>
  )
}
