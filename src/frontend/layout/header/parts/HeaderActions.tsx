'use client'

import Link from 'next/link'

import { CartDrawerIconTrigger } from '@/frontend/components/cart/ui/CartDrawerIconTrigger'
import { CartDrawerTrigger } from '@/frontend/components/cart/ui/CartDrawerTrigger'
import { SearchDrawerTrigger } from '@/frontend/layout/search/SearchDrawerTrigger'
import { Search, ShoppingBag } from '@/frontend/components/ui/primitives/icons'
import { cn } from '@/lib/shared/ui/cn'
import styles from '../Header.module.css'

type HeaderActionsProps = {
  accountHref: string
}

export const HeaderActions = ({ accountHref }: HeaderActionsProps) => {
  return (
    <>
      <div className={styles.mobileRight}>
        <SearchDrawerTrigger className={styles.mobilePlainIcon} ariaLabel="Search">
          <Search />
        </SearchDrawerTrigger>
        <CartDrawerIconTrigger
          className={styles.mobilePlainIcon}
          badgeClassName={`${styles.mobileCartBadge} typo-caption-upper`}
          ariaLabel="Carrello"
        >
          <ShoppingBag />
        </CartDrawerIconTrigger>
      </div>
      <div className={styles.right}>
        <nav className={styles.rightNav} aria-label="Account e carrello">
          <SearchDrawerTrigger className={cn(styles.rightNavLink, 'typo-small-upper')} ariaLabel="Search">
            Search
          </SearchDrawerTrigger>
          <Link href={accountHref} className={cn(styles.rightNavLink, 'typo-small-upper')}>
            {accountHref.includes('/signin') ? 'Sign in' : 'Account'}
          </Link>
          <CartDrawerTrigger className={cn(styles.rightNavLink, 'typo-small-upper')} ariaLabel="Carrello">
            Cart
          </CartDrawerTrigger>
        </nav>
      </div>
    </>
  )
}
