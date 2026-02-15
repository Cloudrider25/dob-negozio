'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

type MenuLinkProps = {
  href: string
  children: ReactNode
  className?: string
  external?: boolean
}

const closeMenu = () => {
  const toggle = document.getElementById('menu-toggle') as HTMLInputElement | null
  if (toggle) {
    toggle.checked = false
  }
}

export const MenuLink = ({ href, children, className, external }: MenuLinkProps) => {
  if (external) {
    return (
      <a
        className={className}
        href={href}
        onClick={closeMenu}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    )
  }

  return (
    <Link className={className} href={href} onClick={closeMenu}>
      {children}
    </Link>
  )
}
