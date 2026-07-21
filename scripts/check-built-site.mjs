import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const failures = []

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

const required = [
  'index.html',
  'api/v0/index.html',
  'api/v0/reference/index.html',
  'api/v1/index.html',
  'api/v1/resource-concurrency/index.html',
  'api/v1/reference/index.html',
  'sdk/index.html',
  'cli/index.html',
  'mcp/index.html',
  'openapi/v0.json',
  'openapi/v1.json',
  'llms.txt',
  'llms-full.txt',
  'social-card.png',
  'robots.txt',
  '_headers',
  '_redirects',
]
for (const file of required) {
  if (!(await exists(path.join(dist, file)))) failures.push(`Missing built file: ${file}`)
}

async function htmlFiles(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await htmlFiles(file)))
    else if (entry.name.endsWith('.html')) result.push(file)
  }
  return result
}

const html = await htmlFiles(dist)
if (html.length < 350) failures.push(`Only ${html.length} HTML pages were generated; expected at least 350.`)

function builtPageForUrl(url) {
  const pathname = url.split(/[?#]/, 1)[0]
  if (!pathname || pathname === '/') return path.join(dist, 'index.html')
  return path.join(dist, pathname.replace(/^\//, '').replace(/\/$/, ''), 'index.html')
}

for (const file of html) {
  const content = await readFile(file, 'utf8')
  const relative = path.relative(dist, file)
  if (!content.includes('<link rel="canonical"')) failures.push(`${relative} has no canonical URL.`)
  if (!content.includes('property="og:image"')) failures.push(`${relative} has no Open Graph image.`)
  if (!content.includes('TeamGrid')) failures.push(`${relative} has no TeamGrid identity.`)
  if (content.includes('ssl.readmessl.com')) failures.push(`${relative} still references ReadMe hosting.`)
  for (const match of content.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/g)) {
    const href = match[1]
    if (!href || /\.[a-z0-9]+(?:[?#]|$)/i.test(href)) continue
    if (!(await exists(builtPageForUrl(href)))) {
      failures.push(`${relative} links to missing page ${href}.`)
    }
  }
}

for (const file of ['sitemap-index.xml', 'llms.txt', 'llms-full.txt']) {
  if (!(await exists(path.join(dist, file)))) failures.push(`Missing discovery file: ${file}`)
}

const redirects = await readFile(path.join(dist, '_redirects'), 'utf8')
for (const line of redirects.split('\n')) {
  if (!line.startsWith('/reference/')) continue
  const [, target] = line.trim().split(/\s+/)
  if (target && !(await exists(builtPageForUrl(target)))) {
    failures.push(`Legacy redirect points to missing page ${target}.`)
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(`Built-site checks passed for ${html.length} HTML pages.`)
}
