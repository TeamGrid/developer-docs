import { appendFile, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const release = JSON.parse(await readFile(path.join(root, 'sources/release-status.json'), 'utf8'))
const packageNames = ['@teamgrid/api-client', '@teamgrid/cli', '@teamgrid/mcp-server']
let ref = 'HEAD'

if (release.status === 'published') {
  const packages = await Promise.all(packageNames.map(async (name) => {
    const url = `https://registry.npmjs.org/${name.replace('/', '%2F')}`
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error(`Cannot resolve the public release of ${name}: HTTP ${response.status}.`)
    const metadata = await response.json()
    const version = metadata['dist-tags']?.latest
    const source = metadata.versions?.[version]?.gitHead
    if (!/^\d+\.\d+\.\d+$/.test(version || '') || !/^[a-f0-9]{40}$/.test(source || '')) {
      throw new Error(`The public release of ${name} has no exact stable version and source commit.`)
    }
    return { name, version, source }
  }))
  const first = packages[0]
  if (packages.some((item) => item.version !== first.version || item.source !== first.source)) {
    throw new Error('The three public TeamGrid packages do not share one latest version and source commit.')
  }
  ref = first.source
  console.log(`Compare the public npm ${first.version} package source at ${ref}.`)
} else if (release.status === 'candidate') {
  console.log('Compare the candidate official-client repository source.')
} else {
  throw new Error(`Unsupported documentation release status: ${release.status}`)
}

if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `ref=${ref}\n`)
else console.log(`ref=${ref}`)
