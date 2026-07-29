import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const contentRoot = path.join(root, 'src', 'content', 'docs')
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
  'collections/teamgrid-api-v1.postman.json',
  'collections/teamgrid-api-v1.http',
  'changelog/feed.xml',
  'changelog/releases.json',
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
const builtHtmlPaths = new Set(
  html.map((file) => path.relative(dist, file).split(path.sep).join('/')),
)
async function contentPageFiles(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await contentPageFiles(file)))
    else if (/\.mdx?$/.test(entry.name)) result.push(file)
  }
  return result
}

const contentPages = await contentPageFiles(contentRoot)
const contracts = JSON.parse(await readFile(path.join(root, 'sources', 'contracts.json'), 'utf8'))
let documentedOperations = 0

for (const version of ['v0', 'v1']) {
  const spec = JSON.parse(await readFile(path.join(root, 'public', 'openapi', `${version}.json`), 'utf8'))
  const operationIds = []
  for (const pathItem of Object.values(spec.paths ?? {})) {
    for (const operation of Object.values(pathItem ?? {})) {
      if (operation && typeof operation === 'object' && operation.operationId) {
        operationIds.push(operation.operationId)
      }
    }
  }

  const expectedOperations = contracts.contracts?.[version]?.operations
  if (operationIds.length !== expectedOperations) {
    failures.push(
      `${version} contains ${operationIds.length} operations; the synchronized contract records ${expectedOperations}.`,
    )
  }

  for (const operationId of operationIds) {
    const operationPage = path.join(
      dist,
      'api',
      version,
      'reference',
      'operations',
      operationId.toLowerCase(),
      'index.html',
    )
    if (!(await exists(operationPage))) {
      failures.push(`Missing generated ${version} operation page for ${operationId}.`)
    } else if (
      version === 'v1'
      && !(await readFile(operationPage, 'utf8')).includes('Interactive request builder')
    ) {
      failures.push(`API v1 operation ${operationId} has no request builder.`)
    }
  }
  documentedOperations += operationIds.length
}

const minimumExpectedPages = contentPages.length + documentedOperations + 3
if (html.length < minimumExpectedPages) {
  failures.push(
    `Only ${html.length} HTML pages were generated; expected at least ${minimumExpectedPages} from source pages, operations, reference indexes, and the not-found page.`,
  )
}

function builtPageForUrl(url) {
  const pathname = url.split(/[?#]/, 1)[0]
  if (!pathname || pathname === '/') return path.join(dist, 'index.html')
  return path.join(dist, pathname.replace(/^\//, '').replace(/\/$/, ''), 'index.html')
}

function hasBuiltPageWithExactCase(url) {
  const target = path.relative(dist, builtPageForUrl(url)).split(path.sep).join('/')
  return builtHtmlPaths.has(target)
}

for (const file of html) {
  const content = await readFile(file, 'utf8')
  const relative = path.relative(dist, file)
  if (!/<html\b[^>]*\blang="en"/.test(content)) failures.push(`${relative} does not declare an English document language.`)
  if (!/<meta\b[^>]*\bname="description"/.test(content)) failures.push(`${relative} has no meta description.`)
  if (!/<link\b[^>]*\brel="canonical"/.test(content)) failures.push(`${relative} has no canonical URL.`)
  if (!content.includes('property="og:image"')) failures.push(`${relative} has no Open Graph image.`)
  if (!content.includes('TeamGrid')) failures.push(`${relative} has no TeamGrid identity.`)
  if (content.includes('ssl.readmessl.com')) failures.push(`${relative} still references ReadMe hosting.`)
  const h1Count = [...content.matchAll(/<h1(?:\s|>)/g)].length
  if (h1Count !== 1) failures.push(`${relative} contains ${h1Count} h1 elements; expected exactly one.`)
  const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
  if (duplicateIds.length) failures.push(`${relative} contains duplicate ids: ${duplicateIds.join(', ')}.`)
  for (const match of content.matchAll(/<button\b([^>]*)>/g)) {
    if (!/\btype="(?:button|submit|reset)"/.test(match[1])) failures.push(`${relative} contains a button without an explicit type.`)
  }
  for (const match of content.matchAll(/<img\b([^>]*)>/g)) {
    if (!/\balt="[^"]*"/.test(match[1])) failures.push(`${relative} contains an image without alt text.`)
  }
  for (const match of content.matchAll(/<a\b([^>]*)\btarget="_blank"([^>]*)>/g)) {
    if (!/\brel="[^"]*(?:noopener|noreferrer)[^"]*"/.test(`${match[1]} ${match[2]}`)) {
      failures.push(`${relative} opens a new tab without a safe rel attribute.`)
    }
  }
  for (const match of content.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/g)) {
    const href = match[1]
    if (!href || /\.[a-z0-9]+(?:[?#]|$)/i.test(href)) continue
    if (!hasBuiltPageWithExactCase(href)) {
      failures.push(`${relative} links to missing page ${href}.`)
    }
  }
}

for (const file of ['sitemap-index.xml', 'llms.txt', 'llms-full.txt']) {
  if (!(await exists(path.join(dist, file)))) failures.push(`Missing discovery file: ${file}`)
}

const releaseFeed = await readFile(path.join(dist, 'changelog', 'feed.xml'), 'utf8')
if (!releaseFeed.includes('<feed xmlns="http://www.w3.org/2005/Atom">')) {
  failures.push('The changelog Atom feed is invalid.')
}
const releaseJson = JSON.parse(
  await readFile(path.join(dist, 'changelog', 'releases.json'), 'utf8'),
)
if (releaseJson.schemaVersion !== 1 || !Array.isArray(releaseJson.releases)) {
  failures.push('The machine-readable changelog is invalid.')
}

const redirects = await readFile(path.join(dist, '_redirects'), 'utf8')
if (redirects.includes('/changelog/:slug ')) {
  failures.push('Legacy redirects shadow current changelog resources.')
}

const builtHome = await readFile(path.join(dist, 'index.html'), 'utf8')
if (!builtHome.includes('fetch(`/api/status`')) {
  failures.push('The production header does not use the same-origin status endpoint.')
}
if (builtHome.includes('fetch(`https://status.teamgrid.app/')) {
  failures.push('The production header still performs a cross-origin status request.')
}
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
