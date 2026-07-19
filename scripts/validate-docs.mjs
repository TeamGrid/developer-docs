import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const failures = []
const methods = new Set(['delete', 'get', 'patch', 'post', 'put'])

function fail(message) {
  failures.push(message)
}

function countOperations(document) {
  return Object.values(document.paths || {}).reduce(
    (total, item) => total + Object.keys(item).filter((method) => methods.has(method)).length,
    0,
  )
}

const manifest = JSON.parse(await readFile(path.join(root, 'sources', 'contracts.json'), 'utf8'))
for (const [version, expectedOperations] of [
  ['v0', 87],
  ['v1', 25],
]) {
  const file = path.join(root, 'public', 'openapi', `${version}.json`)
  const content = await readFile(file)
  const document = JSON.parse(content.toString('utf8'))
  const operations = countOperations(document)
  const sha256 = createHash('sha256').update(content).digest('hex')
  if (document.openapi !== '3.1.0') fail(`${version} must use OpenAPI 3.1.0.`)
  if (operations !== expectedOperations) {
    fail(`${version} contains ${operations} operations; expected ${expectedOperations}.`)
  }
  if (manifest.contracts?.[version]?.sha256 !== sha256) {
    fail(`${version} does not match sources/contracts.json.`)
  }
}

const referenceMap = JSON.parse(
  await readFile(path.join(root, 'sources', 'readme-v0-reference-map.json'), 'utf8'),
)
if (Object.keys(referenceMap).length !== 54) fail('Expected 54 legacy ReadMe reference URLs.')

const redirects = await readFile(path.join(root, 'public', '_redirects'), 'utf8')
for (const slug of Object.keys(referenceMap)) {
  if (!redirects.includes(`/reference/${slug} `)) fail(`Missing legacy redirect for ${slug}.`)
}

for (const file of ['llms.txt', 'llms-full.txt']) {
  const content = await readFile(path.join(root, 'public', file), 'utf8')
  if (!content.includes('API v1 is the source of truth')) fail(`${file} is missing platform guidance.`)
}

for (const route of ['cli', 'mcp', 'sdk', 'security', 'openapi', 'changelog']) {
  try {
    await readFile(path.join(root, 'src', 'content', 'docs', route, 'index.md'), 'utf8')
  } catch {
    fail(`Missing required documentation section: ${route}.`)
  }
}

const requiredDirectories = {
  'src/content/docs/api/v0/guides': 13,
  'src/content/docs/api/v0/legacy-changelog': 5,
  'src/content/docs/api/v0/recipes': 6,
}
for (const [directory, expected] of Object.entries(requiredDirectories)) {
  const files = (await readdir(path.join(root, directory))).filter((file) => file.endsWith('.md'))
  if (files.length !== expected) fail(`${directory} contains ${files.length} files; expected ${expected}.`)
}

async function collectFiles(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await collectFiles(file)))
    else result.push(file)
  }
  return result
}

for (const file of await collectFiles(path.join(root, 'src'))) {
  if (!/\.(astro|css|md|mdx|ts)$/.test(file)) continue
  const content = await readFile(file, 'utf8')
  if (/tg_sk_v1_[a-z0-9-]+_[a-z0-9-]+_[a-f0-9]{24}_[a-f0-9]{64}/.test(content)) {
    fail(`${path.relative(root, file)} contains a credential-shaped value.`)
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exitCode = 1
} else {
  console.log('Documentation sources and contracts are consistent.')
}
