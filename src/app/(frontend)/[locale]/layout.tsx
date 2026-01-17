import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { getPayload } from 'payload'

import { getDictionary, isLocale, locales } from '@/lib/i18n'
import { MenuLink } from '@/components/MenuLink'
import configPromise from '@/payload.config'

const whatsappLink = 'https://wa.me/39XXXXXXXXXX'
const phoneLink = 'tel:+39XXXXXXXXXX'

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayload({ config: await configPromise })
  const serviceCategories = await payload.find({
    collection: 'service-categories',
    locale,
    overrideAccess: false,
    where: {
      active: {
        equals: true,
      },
    },
    sort: 'title',
    limit: 50,
  })
  const sortedServiceCategories = [...serviceCategories.docs].sort((a, b) => {
    const groupA = (a.dobGroup || '').toLowerCase()
    const groupB = (b.dobGroup || '').toLowerCase()
    if (groupA !== groupB) {
      return groupA.localeCompare(groupB)
    }
    return (a.title || '').localeCompare(b.title || '')
  })

  return (
    <div className="shell" data-locale={locale}>
      <input className="menu-toggle" id="menu-toggle" type="checkbox" />
      <header className="site-header">
        <div className="nav-left">
          <label className="menu-toggle-button" htmlFor="menu-toggle" aria-label="Apri menu">
            <span />
            <span />
            <span />
          </label>
        </div>
        <div className="brand">
          <Link href={`/${locale}`} className="brand-mark">
            {t.brand}
          </Link>
          <span className="brand-subtitle">Milano Rasori</span>
        </div>
        <div className="nav-meta">
          <a className="cta-text" href={whatsappLink}>
            {t.cta.appointment}
          </a>
          <div className="locale-switch">
            <button className="locale-button" type="button" aria-haspopup="true">
              {locale.toUpperCase()}
            </button>
            <div className="locale-options" role="menu">
              {locales.map((item) => (
                <Link
                  key={item}
                  href={`/${item}`}
                  className={item === locale ? 'active' : undefined}
                >
                  {item.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div className="menu-overlay" aria-hidden="true">
        <div className="menu-overlay-content">
          <div className="menu-left">
            <label className="menu-close" htmlFor="menu-toggle" aria-label="Chiudi menu">
              ×
            </label>
            <h2>Menu</h2>
            <div className="menu-links">
              <MenuLink external href="https://facebook.com">
                Facebook
              </MenuLink>
              <MenuLink external href="https://instagram.com">
                Instagram
              </MenuLink>
              <MenuLink href={`/${locale}/our-story`}>/ {t.nav.story}</MenuLink>
              <MenuLink href={`/${locale}/journal`}>/ {t.nav.journal}</MenuLink>
              <MenuLink href={`/${locale}/location`}>/ {t.nav.location}</MenuLink>
              <MenuLink href={`/${locale}/services`}>/ {t.nav.services}</MenuLink>
              <MenuLink href={`/${locale}/shop`}>/ {t.nav.shop}</MenuLink>
            </div>
            <div className="menu-booking">
              <p>For booking</p>
              <MenuLink external href={whatsappLink}>
                / {t.cta.whatsapp}
              </MenuLink>
              <MenuLink external href={phoneLink}>
                / {t.cta.call}
              </MenuLink>
            </div>
          </div>
          <div className="menu-right">
            <div className="menu-services">
              {sortedServiceCategories.map((category, index) => (
                <div className="menu-service" key={category.id}>
                  <span className="menu-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="menu-service-name">{category.title}</span>
                  <span className="menu-service-tag">{category.dobGroup || 'DOB'}</span>
                  <span className="menu-service-arrow">↗</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="content">{children}</div>
      <footer className="site-footer">
        <div className="footer-block">
          <p>{t.brand}</p>
          <p>Via Giovanni Rasori 9, Milano</p>
        </div>
        <div className="footer-block">
          <p>WhatsApp: +39 XXX XXX XXXX</p>
          <p>Telefono: +39 XXX XXX XXXX</p>
        </div>
        <div className="footer-block">
          <p>© {new Date().getFullYear()} DOB Milano</p>
          <p>All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}
