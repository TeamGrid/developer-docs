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
const canonicalManifestSource = path.join(
  sourceRoot,
  'contracts',
  'developer-platform-manifest.json',
)
const canonicalManifestContent = await readFile(canonicalManifestSource)
const canonicalManifest = JSON.parse(canonicalManifestContent.toString('utf8'))
if (canonicalManifest.schemaVersion !== 1 || !Array.isArray(canonicalManifest.artifacts)) {
  throw new Error(`${canonicalManifestSource} is not the expected contract manifest.`)
}
for (const artifact of canonicalManifest.artifacts) {
  const content = await readFile(path.join(sourceRoot, artifact.path))
  const digest = createHash('sha256').update(content).digest('hex')
  if (content.length !== artifact.bytes || digest !== artifact.sha256) {
    throw new Error(`Canonical contract digest mismatch for ${artifact.path}.`)
  }
}
await copyFile(
  canonicalManifestSource,
  path.join(destination, 'developer-platform-manifest.json'),
)
await copyFile(
  path.join(sourceRoot, 'contracts', 'v0-routes.json'),
  path.join(destination, 'v0-routes.json'),
)
manifest.canonical = {
  contractVersion: canonicalManifest.contractVersion,
  sha256: createHash('sha256').update(canonicalManifestContent).digest('hex'),
}
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

const capabilitySource = path.join(sourceRoot, 'contracts', 'developer-capabilities.json')
const capabilityTarget = path.join(destination, 'developer-capabilities.json')
const capabilityContent = await readFile(capabilitySource)
const capabilityDocument = JSON.parse(capabilityContent.toString('utf8'))
if (
  capabilityDocument.schemaVersion !== 1 ||
  capabilityDocument.apiVersion !== 'v1' ||
  !Array.isArray(capabilityDocument.operationPolicy)
) {
  throw new Error(`${capabilitySource} is not the expected developer capability contract.`)
}
await copyFile(capabilitySource, capabilityTarget)
manifest.capabilities = {
  operations: capabilityDocument.operationPolicy.length,
  productCapabilities: capabilityDocument.productCapabilities.length,
  sha256: createHash('sha256').update(capabilityContent).digest('hex'),
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
