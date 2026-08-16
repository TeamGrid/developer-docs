import { readFile } from 'node:fs/promises'
import path from 'node:path'

const baseUrl = (process.argv[2] || process.env.DEVELOPER_PORTAL_URL || '').replace(/\/+$/, '')
if (!baseUrl) throw new Error('Provide the deployed portal URL.')

const root = path.resolve(import.meta.dirname, '..')
const packageManifest = JSON.parse(
  await readFile(path.join(root, 'sources', 'packages.json'), 'utf8'),
)
const cliReference = JSON.parse(
  await readFile(path.join(root, 'sources', 'cli-reference.json'), 'utf8'),
)
const stableVersion = packageManifest.version
const smokeRun = (
  process.env.GITHUB_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  Date.now().toString(36)
).slice(0, 12)

const checks = [
  ['/', 'Build dependable integrations with TeamGrid API v1'],
  ['/guides/get-started/', 'Create a developer credential'],
  ['/guides/production-go-live/', 'Production go-live checklist'],
  ['/de/', 'deutscher Einstieg'],
  ['/api/v0/migration-matrix/', '87 frozen API v0 runtime routes'],
  ['/sdk/reference/', '210 API methods'],
  ['/sdk/reference/tasks/', 'tasks.update'],
  ['/cli/', `@teamgrid/cli@${stableVersion}`],
  ['/cli/browser-login/', 'The CLI performs this sequence'],
  ['/cli/browser-login/', 'Windows Credential Manager'],
  ['/cli/commands/', 'This workflow guide covers every command group in CLI'],
  ['/cli/reference/', `${cliReference.executableCommandCount} executable commands`],
  ['/cli/reference/tasks/', 'teamgrid tasks update'],
  ['/mcp/reference/', '29 read-only tools'],
  ['/mcp/reference/teamgrid_tasks_list/', 'exact JSON Schema'],
  ['/resources/compatibility/', `@teamgrid/mcp-server@${stableVersion}`],
  ['/changelog/', `Developer Platform ${stableVersion}`],
  ['/api/v1/reference/operations/getworkspace/', 'Interactive request builder'],
  ['/openapi/v1.json', '"openapi": "3.1.0"'],
  ['/api/status', '"overallStatus"'],
  ['/search-index.json', '"category":"API v1"'],
  ['/changelog/feed.xml', '<feed xmlns="http://www.w3.org/2005/Atom">'],
]

async function check(path, expected) {
  let lastError
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const url = new URL(path, `${baseUrl}/`)
      // Pages can finish the upload before every canonical-domain edge has
      // switched to the deployment. A unique query prevents one transient
      // 404 from being served from cache throughout the whole retry window.
      url.searchParams.set('__teamgrid_smoke', `${smokeRun}-${attempt}`)
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'User-Agent': 'TeamGrid-Developer-Portal-Smoke/1.0',
        },
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      })
      const body = await response.text()
      if (response.ok && body.includes(expected)) return
      lastError = new Error(`${path} returned ${response.status} without the expected marker.`)
    } catch (error) {
      lastError = error
    }
    if (attempt < 10) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 3_000, 15_000)))
    }
  }
  throw lastError
}

await Promise.all(checks.map(([path, expected]) => check(path, expected)))
console.log(`Deployment smoke checks passed for ${checks.length} public routes at ${baseUrl}.`)
