import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { publicationRedirect, assertPublicationRedirect } from './lib/publication-redirects.mjs'

// Read-only publication audit. Never signs in, executes tools or sends customer data.
const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const base = new URL(process.argv[2] || 'https://developer.teamgridapp.com')
if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/') {
  throw new Error('Provide a canonical public HTTPS origin without credentials or a path.')
}
const reportArgument = process.argv.find(value => value.startsWith('--report='))
async function collect(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collect(file))
    else files.push(file)
  }
  return files
}
const files = await collect(dist)
const html = files.filter(file => file.endsWith('.html') && !file.endsWith('/404.html'))
const contracts = files.filter(file => file.includes(`${path.sep}mcp${path.sep}contracts${path.sep}`) && file.endsWith('.json'))
const checks = [
  ...html.map(file => ({ file, route: `/${path.relative(dist, file).replace(/index\.html$/, '')}`, type: 'html' })),
  ...contracts.map(file => ({ file, route: `/${path.relative(dist, file)}`, type: 'contract' })),
  ...['search-index.json', 'llms.txt', 'llms-full.txt', 'openapi/v1.json', 'openapi/v0.json', 'collections/teamgrid-api-v1.postman.json', 'collections/teamgrid-api-v1.http', 'sitemap-index.xml', 'sitemap-0.xml'].map(file => ({ file: path.join(dist, file), route: `/${file}`, type: 'asset' })),
]
const results = []
const auditId = Date.now().toString(36)
async function check(item) {
  let failure
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      let expected = await readFile(item.file, 'utf8')
      const url = new URL(item.route, base)
      const target = item.type === 'html' ? publicationRedirect(expected, url) : null
      url.searchParams.set('__teamgrid_docs_audit', `${auditId}-${attempt}`)
      const options = {
        headers: { 'User-Agent': 'TeamGrid-Developer-Portal-Smoke/1.0', 'Cache-Control': 'no-cache' },
        redirect: target ? 'manual' : 'error', signal: AbortSignal.timeout(15000),
      }
      let response = await fetch(url, options)
      if (target) {
        assertPublicationRedirect(response, url, target)
        const targetFile = html.find(file => `/${path.relative(dist, file).replace(/index\.html$/, '')}` === target.pathname)
        if (!targetFile) throw new Error('Redirect destination is not a built HTML page')
        expected = await readFile(targetFile, 'utf8')
        await response.body?.cancel()
        const destination = new URL(target)
        destination.searchParams.set('__teamgrid_docs_audit', `${auditId}-${attempt}`)
        response = await fetch(destination, { ...options, redirect: 'error', signal: AbortSignal.timeout(15000) })
      }
      const body = await response.text()
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (item.type === 'html') {
        const h1 = value => value.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]
        if (!h1(expected) || h1(body) !== h1(expected)) throw new Error('Published heading does not match the built page')
        if (!body.includes('rel="canonical"')) throw new Error('Canonical link missing')
        const mainText = value => value.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
          .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        if (!mainText(expected) || mainText(body) !== mainText(expected)) throw new Error('Published page content differs from the build')
      } else if (item.type === 'contract' && JSON.stringify(JSON.parse(body)) !== JSON.stringify(JSON.parse(expected))) {
        throw new Error('Published MCP contract differs from the built reference')
      } else if (item.type === 'asset' && body !== expected) {
        throw new Error('Published discovery/download asset differs from the build')
      }
      results.push({ route: item.route, status: 'passed', type: item.type, ...(target ? { redirectTarget: target.pathname } : {}) })
      return
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error)
    }
  }
  results.push({ route: item.route, status: 'failed', type: item.type, failure })
}
const queue = [...checks]
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) await check(queue.shift())
}))
const failures = results.filter(result => result.status === 'failed')
const report = { auditedAt: new Date().toISOString(), origin: base.origin, pages: html.length, contracts: contracts.length, assets: checks.length - html.length - contracts.length, failures: failures.length, results: results.sort((a, b) => a.route.localeCompare(b.route)) }
if (reportArgument) await writeFile(path.resolve(reportArgument.slice(9)), `${JSON.stringify(report, null, 2)}\n`)
for (const failure of failures) console.error(`${failure.route}: ${failure.failure}`)
console.log(`Publication audit: ${html.length} pages, ${contracts.length} MCP contracts, ${report.assets} assets; ${failures.length} failures.`)
if (failures.length) process.exitCode = 1
