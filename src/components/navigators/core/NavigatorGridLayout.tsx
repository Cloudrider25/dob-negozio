'use client'

import type { ReactNode } from 'react'

type NavigatorGridLayoutClassNames = {
  wrapper: string
  topSpacing: string
  grid: string
  mainCol: string
  sideCol: string
}

type NavigatorGridLayoutProps = {
  classNames: NavigatorGridLayoutClassNames
  breadcrumb: ReactNode
  main: ReactNode
  side: ReactNode
  sideClassName?: string
}

export function NavigatorGridLayout({
  classNames,
  breadcrumb,
  main,
  side,
  sideClassName,
}: NavigatorGridLayoutProps) {
  return (
    <div className={classNames.wrapper}>
      <div className={classNames.topSpacing}>{breadcrumb}</div>

      <div className={classNames.grid}>
        <div className={classNames.mainCol}>{main}</div>
        <div className={[classNames.sideCol, sideClassName].filter(Boolean).join(' ')}>{side}</div>
      </div>
    </div>
  )
}
