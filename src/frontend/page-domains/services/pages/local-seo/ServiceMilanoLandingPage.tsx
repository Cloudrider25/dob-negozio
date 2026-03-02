import { Hero } from '@/frontend/components/heroes/Hero'
import { ButtonLink } from '@/frontend/components/ui/primitives/button-link'

type ServiceMilanoLandingPageProps = {
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  phoneLink: string
  whatsappLink: string
  locale: string
}

export default function ServiceMilanoLandingPage({
  eyebrow,
  title,
  description,
  bullets,
  phoneLink,
  whatsappLink,
  locale,
}: ServiceMilanoLandingPageProps) {
  return (
    <div>
      <Hero
        eyebrow={eyebrow}
        title={title}
        description={description}
        variant="style1"
        ctas={[
          { href: whatsappLink, label: 'Prenota via WhatsApp', kind: 'hero', external: true },
          { href: phoneLink, label: 'Prenota via telefono', kind: 'hero', external: true },
        ]}
      />

      <section className="mx-auto w-full max-w-6xl px-[2.5vw] py-[var(--s80)]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="typo-h2-upper">Trattamenti a Milano con approccio personalizzato</h2>
            <p className="typo-body mt-4 max-w-[72ch]">
              Se cerchi un centro estetico a Milano con protocolli professionali, consulenza
              dedicata e risultati misurabili, DOB Milano ti accompagna con percorsi su misura.
            </p>
            <ul className="mt-6 grid gap-3">
              {bullets.map((item) => (
                <li key={item} className="typo-body">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-[24px] border border-stroke p-6">
            <p className="typo-caption-upper">Prenota ora</p>
            <h3 className="typo-h3-upper mt-2">Consulenza estetica a Milano</h3>
            <p className="typo-body mt-3">
              Contattaci per una prima valutazione e scopri il trattamento piu adatto alle tue
              esigenze.
            </p>
            <div className="mt-6 grid gap-3">
              <ButtonLink href={whatsappLink} kind="main" external interactive>
                WhatsApp
              </ButtonLink>
              <ButtonLink href={phoneLink} kind="card" external interactive>
                Telefono
              </ButtonLink>
              <ButtonLink href={`/${locale}/services`} kind="card" interactive>
                Vedi tutti i servizi
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
