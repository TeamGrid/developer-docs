import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, writeFile } from 'node:fs/promises'
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
  throw new Error('Could not find the TeamGrid API Git repository.')
}

const destination = path.join(root, 'public', 'openapi')
await mkdir(destination, { recursive: true })

const requestedRef = process.argv[3] || process.env.TEAMGRID_API_REF || 'HEAD'
const { stdout: resolvedCommit } = await execFileAsync(
  'git',
  ['rev-parse', '--verify', `${requestedRef}^{commit}`],
  { cwd: sourceRoot, encoding: 'utf8' },
)
const sourceCommit = resolvedCommit.trim()
if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
  throw new Error(`Git resolved an invalid API source commit: ${sourceCommit}`)
}

const requestedRuntimeRef = process.argv[4]
  || process.env.TEAMGRID_API_RUNTIME_REF
  || requestedRef
const { stdout: resolvedRuntimeCommit } = await execFileAsync(
  'git',
  ['rev-parse', '--verify', `${requestedRuntimeRef}^{commit}`],
  { cwd: sourceRoot, encoding: 'utf8' },
)
const runtimeCommit = resolvedRuntimeCommit.trim()
if (!/^[0-9a-f]{40}$/.test(runtimeCommit)) {
  throw new Error(`Git resolved an invalid API runtime commit: ${runtimeCommit}`)
}

async function readSourceFile(relativePath) {
  try {
    const { stdout } = await execFileAsync('git', ['show', `${sourceCommit}:${relativePath}`], {
      cwd: sourceRoot,
      encoding: 'buffer',
      maxBuffer: 16 * 1024 * 1024,
    })
    return stdout
  } catch (error) {
    throw new Error(`Could not read ${relativePath} from API commit ${sourceCommit}.`, {
      cause: error,
    })
  }
}

async function readRuntimeFile(relativePath) {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['show', `${runtimeCommit}:${relativePath}`],
      {
        cwd: sourceRoot,
        encoding: 'buffer',
        maxBuffer: 16 * 1024 * 1024,
      },
    )
    return stdout
  } catch (error) {
    throw new Error(`Could not read ${relativePath} from API runtime ${runtimeCommit}.`, {
      cause: error,
    })
  }
}

const sourceRepository = 'TeamGrid/teamgrid-api'
const manifest = {
  schemaVersion: 1,
  contracts: {},
  sourceRepository,
  sourceCommit,
  runtimeCommit,
}
const canonicalManifestPath = 'contracts/developer-platform-manifest.json'
const canonicalManifestContent = await readSourceFile(canonicalManifestPath)
const canonicalManifest = JSON.parse(canonicalManifestContent.toString('utf8'))
if (canonicalManifest.schemaVersion !== 1 || !Array.isArray(canonicalManifest.artifacts)) {
  throw new Error('The API source commit has an unsupported developer contract manifest.')
}
const artifactDestinations = {
  'contracts/developer-action-policy-registry.json': 'developer-action-policy-registry.json',
  'contracts/developer-capabilities.json': 'developer-capabilities.json',
  'contracts/developer-operation-bindings.json': 'developer-operation-bindings.json',
  'contracts/developer-scopes.json': 'developer-scopes.json',
  'contracts/v0-routes.json': 'v0-routes.json',
  'contracts/v0-to-v1-migration.json': 'v0-to-v1-migration.json',
  'openapi/v0.json': 'v0.json',
  'openapi/v1.json': 'v1.json',
}
const expectedPaths = Object.keys(artifactDestinations).sort()
const actualPaths = canonicalManifest.artifacts.map((artifact) => artifact.path).sort()
if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
  throw new Error('The API contract manifest artifact set has no complete documentation mapping.')
}
for (const artifact of canonicalManifest.artifacts) {
  const content = await readSourceFile(artifact.path)
  const digest = createHash('sha256').update(content).digest('hex')
  if (content.length !== artifact.bytes || digest !== artifact.sha256) {
    throw new Error(`API source commit has an invalid contract digest for ${artifact.path}.`)
  }
  const runtimeContent = await readRuntimeFile(artifact.path)
  if (!runtimeContent.equals(content)) {
    throw new Error(
      `API runtime ${runtimeCommit} does not carry the synchronized ${artifact.path}.`,
    )
  }
  await writeFile(path.join(destination, artifactDestinations[artifact.path]), content)
}
await writeFile(
  path.join(destination, 'developer-platform-manifest.json'),
  canonicalManifestContent,
)
const scopeContent = await readSourceFile('contracts/developer-scopes.json')
const scopeDocument = JSON.parse(scopeContent.toString('utf8'))
if (scopeDocument.schemaVersion !== 1 || !Array.isArray(scopeDocument.scopes)) {
  throw new Error('Canonical developer scope contract has an unsupported shape.')
}
manifest.scopes = {
  count: scopeDocument.scopes.length,
  sha256: createHash('sha256').update(scopeContent).digest('hex'),
}
const migrationContent = await readSourceFile('contracts/v0-to-v1-migration.json')
const migrationDocument = JSON.parse(migrationContent.toString('utf8'))
if (migrationDocument.schemaVersion !== 1 || !Array.isArray(migrationDocument.routes)) {
  throw new Error('Canonical v0-to-v1 migration contract has an unsupported shape.')
}
manifest.migration = {
  routes: migrationDocument.routes.length,
  sha256: createHash('sha256').update(migrationContent).digest('hex'),
}
manifest.canonical = {
  contractVersion: canonicalManifest.contractVersion,
  bytes: canonicalManifestContent.length,
  sha256: createHash('sha256').update(canonicalManifestContent).digest('hex'),
}
for (const version of ['v0', 'v1']) {
  const source = `openapi/${version}.json`
  const content = await readSourceFile(source)
  const document = JSON.parse(content.toString('utf8'))
  if (document.openapi !== '3.1.0' || !document.paths || !document.info) {
    throw new Error(`${source} is not the expected OpenAPI 3.1 contract.`)
  }
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

const v1Content = await readSourceFile('openapi/v1.json')
const v1Document = JSON.parse(v1Content.toString('utf8'))
if (
  v1Document.paths?.['/changes']
  || v1Document.components?.schemas?.ChangeEvent
  || scopeDocument.scopes.some((scope) => scope.name === 'changes:read')
) {
  throw new Error('The beta 2 public contract must exclude the unqualified change feed.')
}
manifest.changeFeed = {
  availability: 'excluded',
}

const capabilitySource = 'contracts/developer-capabilities.json'
const capabilityContent = await readSourceFile(capabilitySource)
const capabilityDocument = JSON.parse(capabilityContent.toString('utf8'))
if (
  capabilityDocument.schemaVersion !== 1 ||
  capabilityDocument.apiVersion !== 'v1' ||
  !Array.isArray(capabilityDocument.operationPolicy)
) {
  throw new Error(`${capabilitySource} is not the expected developer capability contract.`)
}
manifest.capabilities = {
  operations: capabilityDocument.operationPolicy.length,
  productCapabilities: capabilityDocument.productCapabilities.length,
  sha256: createHash('sha256').update(capabilityContent).digest('hex'),
}

const operationBindingSource = 'contracts/developer-operation-bindings.json'
const operationBindingContent = await readSourceFile(operationBindingSource)
const operationBindingDocument = JSON.parse(operationBindingContent.toString('utf8'))
if (
  operationBindingDocument.schemaVersion !== 1 ||
  !Array.isArray(operationBindingDocument.operations) ||
  !operationBindingDocument.summary
) {
  throw new Error(`${operationBindingSource} is not the expected operation binding contract.`)
}
manifest.operationBindings = {
  operations: operationBindingDocument.operations.length,
  referencedAppMethods: operationBindingDocument.summary.referencedAppMethodIds.length,
  remainingDirectCellReads: operationBindingDocument.summary.directCellReadOperations.length,
  sha256: createHash('sha256').update(operationBindingContent).digest('hex'),
}

const actionPolicySource = 'contracts/developer-action-policy-registry.json'
const actionPolicyContent = await readSourceFile(actionPolicySource)
const actionPolicyDocument = JSON.parse(actionPolicyContent.toString('utf8'))
if (
  actionPolicyDocument.schemaVersion !== 1
  || actionPolicyDocument.registryVersion !== 'developer-action-policy-v5'
  || !/^[a-f0-9]{64}$/.test(actionPolicyDocument.registrySha256 || '')
  || actionPolicyDocument.actionPolicyCount !== operationBindingDocument.operations.length
  || actionPolicyDocument.authenticatedActionPolicyCount
    !== operationBindingDocument.summary.authenticatedOperations
  || !Array.isArray(actionPolicyDocument.principalPolicyFamilyIds)
) {
  throw new Error(`${actionPolicySource} is not the expected action-policy contract.`)
}
manifest.actionPolicyRegistry = {
  actionPolicies: actionPolicyDocument.actionPolicyCount,
  authenticatedActionPolicies: actionPolicyDocument.authenticatedActionPolicyCount,
  policyFamilies: actionPolicyDocument.principalPolicyFamilyIds.length,
  registrySha256: actionPolicyDocument.registrySha256,
  registryVersion: actionPolicyDocument.registryVersion,
  sha256: createHash('sha256').update(actionPolicyContent).digest('hex'),
}

await mkdir(path.join(root, 'sources'), { recursive: true })
await writeFile(
  path.join(root, 'sources', 'contracts.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

console.log(
  `Synchronized v0 and v1 contracts from ${sourceRepository}@${sourceCommit} `
  + `(runtime ${runtimeCommit}).`,
)
