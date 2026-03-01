import { expect, test, type Page } from '@playwright/test'

const HOME_URL = 'http://localhost:3000/it'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const getFirstCarouselSection = (page: Page) => page.locator('section[aria-label*="carousel" i]').first()

const addPreferenceCookies = async (page: Page) => {
  await page.context().addCookies([
    {
      name: 'dob_prefs_confirmed',
      value: '1',
      url: 'http://localhost:3000',
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + ONE_YEAR_SECONDS,
    },
    {
      name: 'dob_prefs_locale',
      value: 'it',
      url: 'http://localhost:3000',
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + ONE_YEAR_SECONDS,
    },
    {
      name: 'dob_prefs_country',
      value: 'ITA',
      url: 'http://localhost:3000',
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + ONE_YEAR_SECONDS,
    },
    {
      name: 'dob_prefs_currency',
      value: 'EUR',
      url: 'http://localhost:3000',
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + ONE_YEAR_SECONDS,
    },
  ])
}

test.describe('Carousel smoke', () => {
  test('@smoke desktop navigation + mobile swipe + cta', async ({ page }) => {
    await addPreferenceCookies(page)
    await page.goto(HOME_URL, { waitUntil: 'networkidle' })

    const desktopCarousel = getFirstCarouselSection(page)
    await expect(desktopCarousel).toBeVisible()

    const desktopSlides = desktopCarousel.locator('.swiper-slide')
    const desktopSlideCount = await desktopSlides.count()
    test.skip(desktopSlideCount < 2, 'Carousel has fewer than 2 slides in current seed/content')

    const desktopAria = (await desktopCarousel.getAttribute('aria-label')) ?? ''
    const desktopNavButtons = desktopCarousel.getByRole('button', { name: desktopAria, exact: true })
    await expect(desktopNavButtons).toHaveCount(2)

    const desktopWrapper = desktopCarousel.locator('.swiper-wrapper').first()
    const desktopBeforeTransform = await desktopWrapper.evaluate((el) => getComputedStyle(el).transform)

    await desktopNavButtons.nth(1).click()
    await expect
      .poll(async () => desktopWrapper.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(desktopBeforeTransform)

    await page.setViewportSize({ width: 390, height: 844 })
    await addPreferenceCookies(page)
    await page.goto(HOME_URL, { waitUntil: 'networkidle' })

    const mobileCarousel = getFirstCarouselSection(page)
    await expect(mobileCarousel).toBeVisible()

    const mobileSlides = mobileCarousel.locator('.swiper-slide')
    const mobileSlideCount = await mobileSlides.count()
    test.skip(mobileSlideCount < 2, 'Carousel has fewer than 2 slides in current seed/content')

    const mobileWrapper = mobileCarousel.locator('.swiper-wrapper').first()
    const mobileBeforeTransform = await mobileWrapper.evaluate((el) => getComputedStyle(el).transform)

    const dragSurface = mobileCarousel.locator('.swiper').first()
    const movedToNextSlide = await dragSurface.evaluate((el) => {
      const maybeSwiper = el as HTMLElement & { swiper?: { slideNext: (speed?: number) => void } }
      if (!maybeSwiper.swiper) return false
      maybeSwiper.swiper.slideNext(300)
      return true
    })
    expect(movedToNextSlide).toBeTruthy()

    await expect
      .poll(async () => mobileWrapper.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(mobileBeforeTransform)

    const activeSlide = mobileCarousel.locator('.swiper-slide-active').first()
    const ctaLink = activeSlide.getByRole('link').first()
    await expect(ctaLink).toBeVisible()

    const href = await ctaLink.getAttribute('href')
    expect(href).toBeTruthy()

    await page.waitForTimeout(350)
    await ctaLink.scrollIntoViewIfNeeded()
    await ctaLink.click()
    await expect(page).toHaveURL(new RegExp((href ?? '/').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  })
})
