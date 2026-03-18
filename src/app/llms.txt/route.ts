import type { NextRequest } from 'next/server'

import { toPublicSeoPath } from '@/lib/frontend/seo/routes'

const getBaseUrl = (): string => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    'https://dobmilano.com'

  const normalized = raw.trim().replace(/\s+/g, '')
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized
}

export async function GET(_req: NextRequest) {
  const baseUrl = getBaseUrl()

  const content = [
    '# DOB Milano - LLM Access',
    '',
    `Site: ${baseUrl}`,
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
    '## Preferred Public Sources',
    `- ${baseUrl}/it`,
    `- ${baseUrl}/it${toPublicSeoPath('it', '/shop')}`,
    `- ${baseUrl}/it${toPublicSeoPath('it', '/services')}`,
    `- ${baseUrl}/it${toPublicSeoPath('it', '/journal')}`,
    `- ${baseUrl}/it${toPublicSeoPath('it', '/privacy')}`,
    `- ${baseUrl}/it${toPublicSeoPath('it', '/cookie-policy')}`,
    `- ${baseUrl}/it${toPublicSeoPath('it', '/terms')}`,
    '',
    '## AI Crawling Policy',
    '- Public pages can be indexed.',
    '- Respect robots.txt directives.',
    '- Do not attempt authentication-protected routes.',
    '- Do not infer unavailable personal data.',
  ].join('\n')

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
