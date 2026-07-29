const baseUrl = (process.argv[2] || process.env.DEVELOPER_PORTAL_URL || '').replace(/\/+$/, '')
if (!baseUrl) throw new Error('Provide the deployed portal URL.')

const checks = [
  ['/', 'TeamGrid, built into your workflow.'],
  ['/guides/get-started/', 'Create a developer credential'],
  ['/api/v1/reference/operations/getworkspace/', 'Interactive request builder'],
  ['/openapi/v1.json', '"openapi": "3.1.0"'],
  ['/search-index.json', '"category":"API v1"'],
  ['/changelog/feed.xml', '<feed xmlns="http://www.w3.org/2005/Atom">'],
]

async function check(path, expected) {
  let lastError
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { 'User-Agent': 'TeamGrid-Developer-Portal-Smoke/1.0' },
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      })
      const body = await response.text()
      if (response.ok && body.includes(expected)) return
      lastError = new Error(`${path} returned ${response.status} without the expected marker.`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 2_000))
  }
  throw lastError
}

await Promise.all(checks.map(([path, expected]) => check(path, expected)))
console.log(`Deployment smoke checks passed for ${checks.length} public routes at ${baseUrl}.`)
