import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const sourceBase = 'https://developer.teamgridapp.com'
const guides = [
  'authentication',
  'common-workflows',
  'data-model-and-ids',
  'dates-and-time-zones',
  'getting-started',
  'overview',
  'pagination',
  'rate-limit',
  'recipes',
  'requests-and-responses',
  'using-openapi',
  'webhook-event-catalog',
  'webhooks',
]
const recipes = [
  'build-a-webhook-receiver',
  'create-a-project-with-tasks',
  'import-contacts',
  'start-and-stop-task-time-tracking',
  'sync-time-entries-for-reporting',
]
const changelog = [
  'documentation-refresh-2026',
  'more-filters-on-tasks',
  'new-endpoints-for-project-templates-and-journal-entries',
  'scheduled-work-of-tasks',
  'specifying-userid-on-stoptracking',
]

async function fetchText(url) {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`Could not fetch ${url}: ${response.status}`)
  return response.text()
}

function extractTitle(markdown, fallback) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

function description(markdown) {
  return markdown
    .replace(/^#\s+.+$/m, '')
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('```'))
}

function yaml(value) {
  return JSON.stringify(String(value).replace(/\s+/g, ' ').trim())
}

function rewriteLinks(markdown, referenceMap) {
  return markdown
    .replace(/\]\(\/docs\/recipes\)/g, '](/api/v0/recipes/)')
    .replace(/\]\(\/docs\/([a-z0-9-]+)\)/g, '](/api/v0/guides/$1/)')
    .replace(/\]\(\/recipes\/([a-z0-9-]+)\)/g, '](/api/v0/recipes/$1/)')
    .replace(/\]\(\/reference\/([a-z0-9-]+)\)/g, (_match, slug) => {
      const target = referenceMap[slug]?.target || '/api/v0/migration/#legacy-reference-differences'
      return `](${target})`
    })
}

async function writeImported(kind, slug, markdown, referenceMap) {
  const title = extractTitle(markdown, slug)
  const summary = description(markdown) || `Legacy TeamGrid API v0 ${kind}.`
  const body = rewriteLinks(markdown.replace(/^#\s+.+\n+/, ''), referenceMap).trim()
  const directory = path.join(root, 'src', 'content', 'docs', 'api', 'v0', kind)
  await mkdir(directory, { recursive: true })
  await writeFile(
    path.join(directory, `${slug}.md`),
    `---\ntitle: ${yaml(title)}\ndescription: ${yaml(summary)}\n---\n\n> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).\n\n${body}\n`,
  )
}

const llms = await fetchText(`${sourceBase}/llms.txt`)
const referenceUrls = [
  ...llms.matchAll(/https:\/\/developer\.teamgridapp\.com\/reference\/[^)\s]+\.md/g),
].map((match) => match[0])
const runtime = JSON.parse(await readFile(path.join(root, 'public', 'openapi', 'v0.json'), 'utf8'))
const runtimeOperations = new Map()
for (const [route, item] of Object.entries(runtime.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    if (!['delete', 'get', 'patch', 'post', 'put'].includes(method)) continue
    runtimeOperations.set(`${method.toUpperCase()} ${route}`, operation.operationId)
  }
}

const referenceMap = {}
for (const url of referenceUrls) {
  const slug = new URL(url).pathname.split('/').pop().replace(/\.md$/, '')
  const markdown = await fetchText(url)
  const match = markdown.match(/# OpenAPI definition\s*```json\s*([\s\S]*?)\s*```/)
  if (!match) throw new Error(`No embedded OpenAPI operation in ${url}.`)
  const document = JSON.parse(match[1])
  const [route, item] = Object.entries(document.paths)[0] || []
  const [method] = Object.keys(item || {}).filter((value) =>
    ['delete', 'get', 'patch', 'post', 'put'].includes(value),
  )
  const signature = method && route ? `${method.toUpperCase()} ${route}` : null
  const operationId = signature ? runtimeOperations.get(signature) : null
  referenceMap[slug] = {
    signature,
    status: operationId ? 'matched' : 'not-in-frozen-runtime-contract',
    target: operationId
      ? `/api/v0/reference/operations/${operationId.toLowerCase()}/`
      : null,
  }
}

for (const slug of guides) {
  await writeImported('guides', slug, await fetchText(`${sourceBase}/docs/${slug}.md`), referenceMap)
}
for (const slug of recipes) {
  await writeImported('recipes', slug, await fetchText(`${sourceBase}/recipes/${slug}.md`), referenceMap)
}
for (const slug of changelog) {
  await writeImported(
    'legacy-changelog',
    slug,
    await fetchText(`${sourceBase}/changelog/${slug}.md`),
    referenceMap,
  )
}

await mkdir(path.join(root, 'sources'), { recursive: true })
await writeFile(
  path.join(root, 'sources', 'readme-v0-reference-map.json'),
  `${JSON.stringify(referenceMap, null, 2)}\n`,
)

console.log(
  `Imported ${guides.length} guides, ${recipes.length} recipes, ${changelog.length} changelog entries, and mapped ${Object.keys(referenceMap).length} legacy reference URLs.`,
)
