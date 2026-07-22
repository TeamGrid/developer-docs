import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const referenceMap = JSON.parse(
  await readFile(path.join(root, 'sources', 'readme-v0-reference-map.json'), 'utf8'),
)

const lines = [
  '# ReadMe compatibility redirects. Keep these stable for external integrations and search engines.',
  '/docs / 301',
  '/docs/recipes /api/v0/recipes/ 301',
  '/docs/:slug /api/v0/guides/:slug/ 301',
  '/recipes/:slug /api/v0/recipes/:slug/ 301',
  '/reference /api/v0/reference/ 301',
  '/reference/team-grid-api-v1 /api/v0/reference/ 301',
  '/api/v1 /api/v1/ 301',
]

for (const [slug, mapping] of Object.entries(referenceMap).sort(([left], [right]) =>
  left.localeCompare(right),
)) {
  lines.push(
    `/reference/${slug} ${mapping.target || '/api/v0/migration/#legacy-reference-differences'} 301`,
  )
}

lines.push('/changelog/:slug /api/v0/legacy-changelog/:slug/ 301', '')
await writeFile(path.join(root, 'public', '_redirects'), `${lines.join('\n')}\n`)
console.log(`Generated ${lines.filter((line) => line && !line.startsWith('#')).length} redirects.`)
