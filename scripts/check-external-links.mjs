import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const urls = new Set()

async function htmlFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await htmlFiles(file)))
    else if (entry.name.endsWith('.html')) files.push(file)
  }
  return files
}

for (const file of await htmlFiles(dist)) {
  const content = await readFile(file, 'utf8')
  for (const match of content.matchAll(/<a\b[^>]*\bhref="(https:\/\/[^"#]+(?:#[^"]*)?)"/g)) {
    const url = new URL(match[1])
    url.hash = ''
    urls.add(url.toString())
  }
}

const queue = [...urls]
const failures = []

async function check(url) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    try {
      let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
      if (response.status === 405) response = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal })
      clearTimeout(timeout)
      if (response.status < 400 || [401, 403, 429].includes(response.status)) return
      if (attempt === 1) failures.push(`${url} returned ${response.status}`)
    } catch (error) {
      clearTimeout(timeout)
      if (attempt === 1) failures.push(`${url} failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

const workers = Array.from({ length: Math.min(6, queue.length) }, async () => {
  while (queue.length) {
    const url = queue.shift()
    if (url) await check(url)
  }
})
await Promise.all(workers)

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(`External-link checks passed for ${urls.size} URLs.`)
}
