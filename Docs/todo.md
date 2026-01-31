# Homepage data map

## Fonte dati: pages (pageKey = "home")
- heroTitleMode ("fixed" | altro)
- heroTitle (usato solo se heroTitleMode = "fixed")
- heroDescription (fallback: dictionary.hero.subtitle)
- heroStyle ("style1" | "style2")
- heroMedia (array: [dark, light]) → media { url, alt, mimeType }
- storyHeroTitle
- storyHeroBody
- storyHeroCtaLabel
- storyHeroCtaHref
- storyHeroMedia → media { url, alt }
- productsCarousel (Sezione 5)
  - limit
  - categories
  - needs
  - lines
  - textures

## Fonte dati: dictionary (i18n)
- hero.eyebrow
- hero.title
- hero.subtitle
- nav.services
- nav.shop
- shop.title (per fallback alt)

## Sezione: Hero
- Condizione: render solo se esiste almeno un media (dark o light)
- Props:
  - eyebrow, title, description
  - variant (heroStyle)
  - mediaDark, mediaLight
  - ctas: servizi e shop con label i18n

## Sezione: ServicesCarousel
- Query: collection "services"
  - filter: active = true
  - limit: 6, depth: 1, sort: -createdAt
- Card fields:
  - title: service.name
  - subtitle: service.description
  - price: service.price (EUR) → formatPrice
  - duration: service.durationMinutes → "{n} min"
  - image: gallery cover (isCover) oppure fallback image
  - tag: serviceType ("package" → "Pacchetto", "single" → "Singolo")
  - badgeLeft: intent.label
  - badgeRight: badge.name
  - href: /[locale]/services/service/[slug]

## Sezione: StoryHero
- Props:
  - locale
  - title: storyHeroTitle (fallback: default text)
  - body: storyHeroBody (fallback: default text)
  - ctaLabel: storyHeroCtaLabel (fallback: "Scopri DOB")
  - ctaHref: storyHeroCtaHref (fallback: /[locale]/shop)
  - media: storyHeroMedia (fallback: /media/hero_homepage_light.png)

## Sezione: ProgramsSplitSection
- Nessun dato da payload in pagina (gestione interna)
  - Ora usa collection "programs" (selezionato via Sezione 4: homeProgram)
  - Steps con dati dinamici (manual / service / product)

## Sezione: ShopCarousel
- Query: collection "products"
  - filter: active = true (+ eventuali filtri Sezione 5)
  - limit: 6 (default) o productsCarousel.limit
  - depth: 1, sort: -createdAt
  - Card fields:
  - title: product.title
  - subtitle: product.description
  - price: product.price + product.currency → formatPrice
  - image: coverImage oppure images[0] oppure fallback image

## Sezione: ValuesSection
- Props: locale
- Dati interni al componente (nessun fetch qui in pagina)

## Utility usate nella pagina
- resolveMedia(media, fallbackAlt)
- resolveGalleryCover(gallery, fallbackAlt)
- formatPrice(value, currency)
- formatDuration(minutes)
- fallbackImage: /media/493b3205c13b5f67b36cf794c2222583.jpg
