import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const docsRoot = path.join(root, 'src', 'content', 'docs')
const site = 'https://developer.teamgridapp.com'

const links = [
  ['API v1 overview', '/api/v1/'],
  ['API v1 quickstart', '/api/v1/quickstart/'],
  ['API v1 reference', '/api/v1/reference/'],
  ['API v1 OpenAPI 3.1 JSON', '/openapi/v1.json'],
  ['API v0 legacy overview', '/api/v0/'],
  ['API v0 reference', '/api/v0/reference/'],
  ['API v0 OpenAPI 3.1 JSON', '/openapi/v0.json'],
  ['TypeScript SDK', '/sdk/'],
  ['CLI', '/cli/'],
  ['MCP server', '/mcp/'],
  ['Security', '/security/'],
  ['Changelog', '/changelog/'],
]

const summary = [
  '# TeamGrid Developer Documentation',
  '',
  '> Official documentation for TeamGrid API v1, legacy API v0, the TypeScript SDK, CLI, and optional read-only MCP server.',
  '',
  'API v1 is the source of truth for new integrations. The SDK, CLI, and MCP server are clients of API v1. API v0 is retained for compatibility.',
  '',
  '## Documentation',
  '',
  ...links.map(([label, url]) => `- [${label}](${site}${url})`),
  '',
]

async function collect(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await collect(file)))
    else if (/\.mdx?$/.test(entry.name)) files.push(file)
  }
  return files.sort()
}

const full = [...summary, '# Documentation source', '']
for (const file of await collect(docsRoot)) {
  const relative = path.relative(docsRoot, file)
  const content = await readFile(file, 'utf8')
  full.push(`<!-- ${relative} -->`, content.trim(), '')
}

await writeFile(path.join(root, 'public', 'llms.txt'), `${summary.join('\n')}\n`)
await writeFile(path.join(root, 'public', 'llms-full.txt'), `${full.join('\n')}\n`)
console.log('Generated llms.txt and llms-full.txt.')
