'use client'

import type { ReactNode } from 'react'

type SidePreviewSectionClassNames = {
  section: string
  heading: string
  headingText: string
  panel: string
}

type SidePreviewSectionProps = {
  title: string
  classNames: SidePreviewSectionClassNames
  children: ReactNode
}

export function SidePreviewSection({ title, classNames, children }: SidePreviewSectionProps) {
  return (
    <div className={classNames.section}>
      <div className={classNames.heading}>
        <h3 className={classNames.headingText}>{title}</h3>
      </div>
      <div className={classNames.panel}>{children}</div>
    </div>
  )
}
