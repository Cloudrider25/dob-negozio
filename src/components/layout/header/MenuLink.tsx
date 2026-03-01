'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

type MenuLinkProps = {
  href: string
  children: ReactNode
  className?: string
  external?: boolean
  onNavigate?: () => void
}

export const MenuLink = ({ href, children, className, external, onNavigate }: MenuLinkProps) => {
  if (external) {
    return (
      <a
        className={className}
        href={href}
        onClick={onNavigate}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    )
  }

  return (
    <Link className={className} href={href} onClick={onNavigate}>
      {children}
    </Link>
  )
}
