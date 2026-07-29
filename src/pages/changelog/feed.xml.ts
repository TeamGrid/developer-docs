import type { APIRoute } from 'astro'
import { developerReleases } from '../../data/releases'

export const prerender = true

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export const GET: APIRoute = () => {
  const items = developerReleases.map((release) => `
    <entry>
      <id>tag:developer.teamgridapp.com,${release.date}:release-${escapeXml(release.version)}</id>
      <title>${escapeXml(release.title)}</title>
      <updated>${release.date}T00:00:00Z</updated>
      <link href="https://developer.teamgridapp.com/changelog/" />
      <summary>${escapeXml(release.description)}</summary>
    </entry>`).join('')

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>https://developer.teamgridapp.com/changelog/</id>
  <title>TeamGrid Developer Platform changelog</title>
  <updated>${developerReleases[0].date}T00:00:00Z</updated>
  <link href="https://developer.teamgridapp.com/changelog/feed.xml" rel="self" />
  <link href="https://developer.teamgridapp.com/changelog/" />
  <author><name>TeamGrid</name></author>${items}
</feed>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
