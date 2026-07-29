import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const governance = JSON.parse(
  await readFile(path.join(root, 'sources', 'content-governance.json'), 'utf8'),
)
const failures = []
const now = new Date()

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? collect(file) : [file]
  }))
  return nested.flat()
}

const contentRoot = path.join(root, 'src', 'content', 'docs')
const required = { ...(governance.required || {}) }
if (governance.enforceAllMaintained) {
  const files = await collect(contentRoot)
  files
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => path.relative(contentRoot, file))
    .filter((relativePath) => !governance.excludedPrefixes
      ?.some((prefix) => relativePath.startsWith(prefix)))
    .forEach((relativePath) => {
      if (!(relativePath in required)) required[relativePath] = null
    })
}

for (const [relativePath, expectedOwner] of Object.entries(required)) {
  const file = path.join(root, 'src', 'content', 'docs', relativePath)
  const content = await readFile(file, 'utf8')
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
  const owner = frontmatter?.[1].match(/^owner:\s*(.+)$/m)?.[1]?.trim()
  const reviewedAt = frontmatter?.[1].match(/^reviewedAt:\s*(.+)$/m)?.[1]?.trim()
  if (expectedOwner && owner !== expectedOwner) {
    failures.push(`${relativePath} must be owned by ${expectedOwner}.`)
  } else if (!owner || !governance.allowedOwners?.includes(owner)) {
    failures.push(`${relativePath} must declare one allowed content owner.`)
  }
  if (!reviewedAt || !/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
    failures.push(`${relativePath} must have a YYYY-MM-DD reviewedAt value.`)
    continue
  }
  const ageDays = Math.floor((now.getTime() - new Date(`${reviewedAt}T00:00:00Z`).getTime()) / 86_400_000)
  if (ageDays < 0 || ageDays > governance.maxReviewAgeDays) {
    failures.push(`${relativePath} review is ${ageDays} days old; maximum is ${governance.maxReviewAgeDays}.`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Content governance passed for ${Object.keys(required).length} maintained pages.`)
