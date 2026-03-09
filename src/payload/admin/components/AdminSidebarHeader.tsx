'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

const AdminSidebarHeader = () => {
  const suppressAccordionRef = useRef(false)

  useEffect(() => {
    const closeOtherGroups = (activeToggle: HTMLButtonElement) => {
      const openToggles = Array.from(
        document.querySelectorAll<HTMLButtonElement>('.nav-group__toggle--open'),
      )

      for (const toggle of openToggles) {
        if (toggle === activeToggle) continue
        suppressAccordionRef.current = true
        toggle.click()
        suppressAccordionRef.current = false
      }
    }

    const onClickCapture = (event: MouseEvent) => {
      if (suppressAccordionRef.current) return

      const target = event.target as HTMLElement | null
      const toggle = target?.closest('.nav-group__toggle') as HTMLButtonElement | null
      if (!toggle) return

      window.setTimeout(() => {
        if (!toggle.classList.contains('nav-group__toggle--open')) return
        closeOtherGroups(toggle)
      }, 0)
    }

    document.addEventListener('click', onClickCapture, true)

    return () => {
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  return (
    <div className="adminSidebarHeader">
      <div className="adminSidebarBrand" aria-label="DOB Admin">
        <Image className="adminSidebarBrand__logo" src="/brand/logo-white.png" alt="DOB" width={42} height={42} priority />
        <span className="adminSidebarBrand__text">DOB</span>
      </div>
    </div>
  )
}

export default AdminSidebarHeader
