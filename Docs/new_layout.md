# New layout style guide (service detail)

## Scope
Layout, spacing, and styling rules extracted from the service detail page.
Use this as a reference to keep new pages visually consistent (spacing, margins, heights).

## Page-level layout
- `.page`
  - flex column, gap: 3rem (computed 48px)
  - padding: 0
  - `--header-height: 140px`
  - first section top margin: `2.5vw` (computed ~35px at 1400px width)

## Hero section
- Grid layout: `.hero`
  - 2 columns (1fr / 1fr)
  - gap: 2.5rem (computed 40px)
- Media: `.heroMedia`
  - radius: 22px
  - min-height: 420px
  - height: `calc(100dvh - var(--header-height))`
  - background: #e9e6e2
- Copy: `.heroPanel`
  - radius: 22px
  - padding: `2.5rem 2.6rem`
  - border: 1px solid `color-mix(in srgb, var(--stroke) 60%, transparent)`
  - height: `calc(100dvh - var(--header-height))`
  - overflow: auto
  - gap: 1.1rem

## Section card patterns
- Card backgrounds: var(--bg) / #f7f6f3 / #f7f5f2
- Borders: 1px solid `color-mix(in srgb, var(--stroke) 60%, transparent)`
- Border radius: 16–22px
- Body copy: 0.9–0.95rem, line-height 1.6, color `--text-secondary`
- Labels: uppercase, 0.55–0.7rem, letter-spacing 0.16–0.24em

## Treatment reveal (ServiceTreatmentReveal)
- `.treatmentCard`: height 640px, radius 18px, bg var(--bg)
- `.treatmentSlider`: 2 panels, width 200%, transition 0.9s
- `.treatmentGrid`: 2 columns, gap 2.5rem, height 100%
- Left column (slide 1 image):
  - `.treatmentCopy`: padding 2.5vw, gap 1rem
  - `.treatmentCopyMedia`: flex center + vertical auto margins
- Right column (slide 1 text + rail):
  - `.treatmentMedia`: padding `2rem 4.5rem 2rem 2rem`, min-height 360px
  - `.treatmentMediaTitle`: width 70%, left-aligned, margin-top auto
  - `.treatmentMediaDescription`: width 70%, right-aligned block with custom margins
- Slide 2 carousel:
  - `.treatmentCarousel`: max-width 480px, shifted left by `translateX(-160px)`

## Inside / Protocol section
- `.insideGrid`: 2 columns, gap 2.5rem
- `.insideMedia`: min-height 640px, radius 18px, bg #e9e6e2
- `.insideContent`: min-height 640px, padding `2.2rem 3.2rem 2.2rem 2.4rem`, aligns content bottom-right

## FAQ section
- `.faqGrid`: 2 columns, gap 2.5rem
- `.faqCopy` + `.faqMedia`: min-height 640px, radius 18px

## Video section
- `.videoWrap`: height `calc(100dvh - var(--header-height))`, radius 12px

## Component-specific behaviors
### HeroGallery
- Swiper autoplay, non-interactive (no touch move)
- Thumbnails: 4 max, positioned bottom-left, 44x44px, radius 12px
- Slide changes on hover/focus on thumbnail
- Video slides auto-play and pause on slide change

### ServiceAccordion
- Single open item at a time (controlled by state)
- Trigger is uppercase label with plus/minus
- Panel text uses `.accordionPanel` (0.85rem, 1.6 line-height)

### FaqAccordion
- Single open item at a time
- Button uses `.faqQuestionRow` for label + icon
- Answer uses `.faqAnswer` with rich text styles

## Computed style dump (desktop 1400x900)
These are real computed values from the running page (for reference when matching spacing exactly):

- `.page`: width 1337px, gap 48px
- `.hero`: width 1337px, height 760px, gap 40px
- `.heroMedia`: width 648.5px, height 760px, radius 22px
- `.heroPanel`: width 648.5px, height 760px, padding 40px/41.6px, gap 17.6px
- `.treatmentCard`: width 1337px, height 640px, radius 18px
- `.treatmentGrid`: width 1335px, gap 40px
- `.treatmentCopy`: padding 35px, gap 16px
- `.treatmentCopyMedia`: height ~320px, margin-top/bottom ~126.98px
- `.treatmentMedia`: padding 32px/72px/32px/32px
- `.treatmentMediaTitle`: width ~380px, margin-top ~160px
- `.treatmentMediaDescription`: width ~380px, margin 72px, padding-bottom 24px
- `.treatmentCarousel`: width 480px, transform translateX(-160px)
- `.insideGrid`: width 1337px, height 640px, gap 40px
- `.insideMedia`: width 648.5px, height 640px, radius 18px
- `.insideContent`: width 648.5px, height 640px, padding 35.2/51.2/35.2/38.4px
- `.faqGrid`: width 1337px, gap 40px
- `.faqCopy`: width 648.5px, padding 35.2/38.4px
- `.faqMedia`: width 648.5px, min-height 640px
- `.videoWrap`: width 1337px, height 760px, radius 12px

## Mobile (<= 1024px)
- All 2-col grids collapse to 1 column
- Hero panels height auto
- Treatment rail becomes horizontal (height 48px)
- Media padding reduced
