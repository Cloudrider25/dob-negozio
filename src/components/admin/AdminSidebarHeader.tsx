'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const OPEN_GROUP_STORAGE_KEY = 'dob-admin-open-nav-group'

const AdminSidebarHeader = () => {
  const pathname = usePathname()

  useEffect(() => {
    const getGroup = (toggle: HTMLButtonElement) => toggle.closest('.nav-group') as HTMLElement | null
    const getGroupKey = (group: HTMLElement | null) => {
      if (!group) return null
      return (
        group.getAttribute('class')
          ?.split(/\s+/)
          .find((cls) => cls && cls !== 'nav-group' && cls !== 'dob-nav-group-open') ?? null
      )
    }
    const persistOpenGroup = (group: HTMLElement | null) => {
      const key = getGroupKey(group)
      if (!key) {
        sessionStorage.removeItem(OPEN_GROUP_STORAGE_KEY)
        return
      }
      sessionStorage.setItem(OPEN_GROUP_STORAGE_KEY, key)
    }

    const setOpenGroup = (openGroup: HTMLElement | null) => {
      const groups = Array.from(document.querySelectorAll<HTMLElement>('.nav-group'))
      for (const group of groups) {
        const isOpen = group === openGroup
        group.classList.toggle('dob-nav-group-open', isOpen)
        const toggle = group.querySelector<HTMLButtonElement>('.nav-group__toggle')
        if (toggle) toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
      }
      persistOpenGroup(openGroup)
    }

    const findCurrentGroup = () => {
      const activeLink = document.querySelector('.nav-group .nav__link--active') as HTMLElement | null
      if (activeLink) return activeLink.closest('.nav-group') as HTMLElement | null

      const currentPath = window.location.pathname
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-group .nav__link[href]'))
      const matched = links.find((link) => {
        try {
          const url = new URL(link.href, window.location.origin)
          return url.pathname === currentPath
        } catch {
          return false
        }
      })
      return (matched?.closest('.nav-group') as HTMLElement | null) ?? null
    }

    const initFromActiveLink = () => {
      const activeGroup = findCurrentGroup()
      if (activeGroup) {
        setOpenGroup(activeGroup)
        return
      }

      const storedGroupKey = sessionStorage.getItem(OPEN_GROUP_STORAGE_KEY)
      if (storedGroupKey) {
        const storedGroup = document.querySelector<HTMLElement>(`.nav-group.${CSS.escape(storedGroupKey)}`)
        if (storedGroup) {
          setOpenGroup(storedGroup)
          return
        }
      }

      // Do not force-close everything if Payload hasn't marked the active link yet.
    }

    const scheduleInitSync = () => {
      // Payload updates active nav classes slightly after route changes.
      requestAnimationFrame(initFromActiveLink)
      setTimeout(initFromActiveLink, 30)
      setTimeout(initFromActiveLink, 120)
    }

    const onClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const toggle = target?.closest('.nav-group__toggle') as HTMLButtonElement | null
      if (toggle) {
        // We own accordion behavior completely to guarantee single-click/single-open.
        event.preventDefault()
        event.stopPropagation()

        const group = getGroup(toggle)
        if (!group) return
        const isOpen = group.classList.contains('dob-nav-group-open')
        setOpenGroup(isOpen ? null : group)
        return
      }

      const navLink = target?.closest('.nav-group .nav__link') as HTMLElement | null
      if (navLink) {
        const group = navLink.closest('.nav-group') as HTMLElement | null
        if (group) persistOpenGroup(group)
      }
    }

    document.addEventListener('click', onClickCapture, true)

    // Keep current page group open after route changes.
    scheduleInitSync()

    return () => {
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [pathname])

  return (
    <div className="adminSidebarHeader">
      <div className="adminSidebarBrand" aria-label="DOB Admin">
        <img className="adminSidebarBrand__logo" src="/brand/logo-white.png" alt="DOB" />
        <span className="adminSidebarBrand__text">DOB</span>
      </div>
    </div>
  )
}

export default AdminSidebarHeader
