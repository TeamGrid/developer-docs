import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')
const candidates = [
  process.argv[2],
  process.env.TEAMGRID_API_REPOSITORY,
  path.resolve(root, '..', 'teamgrid-api-developer-platform-v1'),
  path.resolve(root, '..', 'teamgrid-api'),
].filter(Boolean)

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

let sourceRoot = null
for (const candidate of candidates) {
  const normalized = path.resolve(candidate)
  if (await exists(path.join(normalized, 'openapi', 'v1.json'))) {
    sourceRoot = normalized
    break
  }
}

if (!sourceRoot) {
  throw new Error('Could not find a TeamGrid API repository with openapi/v0.json and v1.json.')
}

const destination = path.join(root, 'public', 'openapi')
await mkdir(destination, { recursive: true })

const manifest = { contracts: {}, sourceRepository: 'TeamGrid/teamgrid-api' }
for (const version of ['v0', 'v1']) {
  const source = path.join(sourceRoot, 'openapi', `${version}.json`)
  const target = path.join(destination, `${version}.json`)
  const content = await readFile(source)
  const document = JSON.parse(content.toString('utf8'))
  if (document.openapi !== '3.1.0' || !document.paths || !document.info) {
    throw new Error(`${source} is not the expected OpenAPI 3.1 contract.`)
  }
  await copyFile(source, target)
  manifest.contracts[version] = {
    operations: Object.values(document.paths).reduce(
      (total, item) =>
        total +
        Object.keys(item).filter((method) =>
          ['delete', 'get', 'patch', 'post', 'put'].includes(method),
        ).length,
      0,
    ),
    sha256: createHash('sha256').update(content).digest('hex'),
  }
}

try {
  const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot })
  manifest.sourceCommit = stdout.trim()
} catch {
  manifest.sourceCommit = null
}

await mkdir(path.join(root, 'sources'), { recursive: true })
await writeFile(
  path.join(root, 'sources', 'contracts.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

console.log(`Synchronized v0 and v1 contracts from ${sourceRoot}.`)
