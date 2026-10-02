// Only pages that explicitly declare a refresh may redirect during the audit.
export function publicationRedirect(html, pageUrl) {
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = Object.fromEntries([...tag[0].matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)].map(match => [match[1].toLowerCase(), match[3]]))
    if (attributes['http-equiv']?.toLowerCase() !== 'refresh') continue
    const destination = attributes.content?.match(/^\s*0\s*;\s*url=(.+?)\s*$/i)?.[1]
    if (!destination) throw new Error('Invalid built redirect declaration')
    const target = new URL(destination, pageUrl)
    if (target.origin !== pageUrl.origin || target.username || target.password || target.search || target.hash) {
      throw new Error('Built redirect must target a page on the canonical origin')
    }
    return target
  }
  return null
}

export function assertPublicationRedirect(response, pageUrl, target) {
  const location = response.headers.get('location')
  const actual = location ? new URL(location, pageUrl) : null
  // Cloudflare carries the audit's own cache-busting parameter through a redirect.
  const auditParameter = '__teamgrid_docs_audit'
  if (actual?.searchParams.has(auditParameter) && actual.searchParams.getAll(auditParameter).length === 1 && actual.searchParams.get(auditParameter) === pageUrl.searchParams.get(auditParameter)) {
    actual.searchParams.delete(auditParameter)
  }
  if (![301, 302, 303, 307, 308].includes(response.status) || actual?.href !== target.href) {
    throw new Error(`Published redirect does not match ${target.pathname} (HTTP ${response.status})`)
  }
}
