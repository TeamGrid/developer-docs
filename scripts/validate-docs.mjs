import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const failures = []
const methods = new Set(['delete', 'get', 'patch', 'post', 'put'])

function fail(message) {
  failures.push(message)
}

function countOperations(document) {
  return Object.values(document.paths || {}).reduce(
    (total, item) => total + Object.keys(item).filter((method) => methods.has(method)).length,
    0,
  )
}

const manifest = JSON.parse(await readFile(path.join(root, 'sources', 'contracts.json'), 'utf8'))
if (
  manifest.schemaVersion !== 1 ||
  manifest.sourceRepository !== 'TeamGrid/teamgrid-api' ||
  !/^[0-9a-f]{40}$/.test(manifest.sourceCommit || '')
) {
  fail('Contract source provenance is missing or invalid.')
}
const canonicalManifestFile = path.join(
  root,
  'public',
  'openapi',
  'developer-platform-manifest.json',
)
const canonicalManifestContent = await readFile(canonicalManifestFile)
const canonicalManifest = JSON.parse(canonicalManifestContent.toString('utf8'))
const canonicalManifestSha256 = createHash('sha256')
  .update(canonicalManifestContent)
  .digest('hex')
if (manifest.canonical?.sha256 !== canonicalManifestSha256) {
  fail('Canonical contract manifest does not match sources/contracts.json.')
}
if (manifest.canonical?.bytes !== canonicalManifestContent.length) {
  fail('Canonical contract manifest byte count does not match sources/contracts.json.')
}
const canonicalArtifactFiles = {
  'contracts/developer-capabilities.json': 'developer-capabilities.json',
  'contracts/developer-operation-bindings.json': 'developer-operation-bindings.json',
  'contracts/developer-scopes.json': 'developer-scopes.json',
  'contracts/v0-routes.json': 'v0-routes.json',
  'contracts/v0-to-v1-migration.json': 'v0-to-v1-migration.json',
  'openapi/v0.json': 'v0.json',
  'openapi/v1.json': 'v1.json',
}
for (const artifact of canonicalManifest.artifacts || []) {
  const filename = canonicalArtifactFiles[artifact.path]
  if (!filename) {
    fail(`Canonical contract artifact has no documentation mapping: ${artifact.path}.`)
    continue
  }
  const content = await readFile(path.join(root, 'public', 'openapi', filename))
  const sha256 = createHash('sha256').update(content).digest('hex')
  if (content.length !== artifact.bytes || sha256 !== artifact.sha256) {
    fail(`Canonical contract artifact drift detected: ${artifact.path}.`)
  }
}
for (const [version, expectedOperations] of [
  ['v0', canonicalManifest.summary?.v0Operations],
  ['v1', canonicalManifest.summary?.v1Operations],
]) {
  const file = path.join(root, 'public', 'openapi', `${version}.json`)
  const content = await readFile(file)
  const document = JSON.parse(content.toString('utf8'))
  const operations = countOperations(document)
  const sha256 = createHash('sha256').update(content).digest('hex')
  if (document.openapi !== '3.1.0') fail(`${version} must use OpenAPI 3.1.0.`)
  if (operations !== expectedOperations) {
    fail(`${version} contains ${operations} operations; expected ${expectedOperations}.`)
  }
  if (manifest.contracts?.[version]?.sha256 !== sha256) {
    fail(`${version} does not match sources/contracts.json.`)
  }
}

const capabilityFile = path.join(root, 'public', 'openapi', 'developer-capabilities.json')
const capabilityContent = await readFile(capabilityFile)
const capabilities = JSON.parse(capabilityContent.toString('utf8'))
const capabilitySha256 = createHash('sha256').update(capabilityContent).digest('hex')
if (manifest.capabilities?.sha256 !== capabilitySha256) {
  fail('Developer capabilities do not match sources/contracts.json.')
}
const operationBindingFile = path.join(
  root,
  'public',
  'openapi',
  'developer-operation-bindings.json',
)
const operationBindingContent = await readFile(operationBindingFile)
const operationBindings = JSON.parse(operationBindingContent.toString('utf8'))
const operationBindingSha256 = createHash('sha256')
  .update(operationBindingContent)
  .digest('hex')
if (
  manifest.operationBindings?.sha256 !== operationBindingSha256 ||
  manifest.operationBindings?.operations !== operationBindings.operations?.length ||
  manifest.operationBindings?.referencedAppMethods !==
    operationBindings.summary?.referencedAppMethodIds?.length ||
  manifest.operationBindings?.remainingDirectCellReads !==
    operationBindings.summary?.directCellReadOperations?.length ||
  canonicalManifest.summary?.operationBindings !== operationBindings.operations?.length ||
  canonicalManifest.summary?.referencedAppMethods !==
    operationBindings.summary?.referencedAppMethodIds?.length ||
  canonicalManifest.summary?.remainingDirectCellReads !==
    operationBindings.summary?.directCellReadOperations?.length
) {
  fail('Developer operation bindings do not match sources/contracts.json and the manifest.')
}
const v1 = JSON.parse(await readFile(path.join(root, 'public', 'openapi', 'v1.json'), 'utf8'))
if (v1.info?.version !== canonicalManifest.contractVersion) {
  fail('OpenAPI v1 info.version and canonical manifest contractVersion differ.')
}
const contractOperations = []
for (const [operationPath, pathItem] of Object.entries(v1.paths || {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method) || !operation.operationId) continue
    if ((operation.security || []).some((item) => item.bearerAuth?.length)) {
      fail(`${operation.operationId} incorrectly puts TeamGrid scopes on HTTP bearer auth.`)
    }
    contractOperations.push({
      method: method.toUpperCase(),
      operationId: operation.operationId,
      path: operationPath,
      scope: (operation['x-teamgrid-required-scopes'] || [])[0] || null,
    })
  }
}
const policyOperations = capabilities.operationPolicy.map((operation) => ({
  method: operation.method,
  operationId: operation.operationId,
  path: operation.path,
  scope: operation.scope,
}))
const executionOperations = operationBindings.operations.map((operation) => ({
  method: operation.method,
  operationId: operation.operationId,
  path: operation.path,
  scope: operation.requiredScopes[0] || null,
}))
const byOperationId = (left, right) => left.operationId.localeCompare(right.operationId)
if (
  JSON.stringify(contractOperations.sort(byOperationId)) !==
  JSON.stringify(policyOperations.sort(byOperationId))
) {
  fail('OpenAPI and Developer Platform operation policies differ.')
}
if (
  JSON.stringify(contractOperations.sort(byOperationId)) !==
  JSON.stringify(executionOperations.sort(byOperationId))
) {
  fail('OpenAPI and Developer Platform execution bindings differ.')
}

const resourceCasOperations = []
for (const [operationPath, pathItem] of Object.entries(v1.paths || {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method) || operation['x-teamgrid-resource-cas'] !== 'resource-cas-v1') continue
    resourceCasOperations.push({ method: method.toUpperCase(), path: operationPath })
    for (const status of ['400', '412', '428', '503']) {
      if (!operation.responses?.[status]) {
        fail(`${operation.operationId} is missing the resource-CAS ${status} response.`)
      }
    }
  }
}
if (
  resourceCasOperations.length !== 14 ||
  canonicalManifest.summary?.resourceCasMutationOperations !== resourceCasOperations.length
) {
  fail(
    `Expected the manifest and OpenAPI to expose exactly 14 resource-CAS mutations; found ${resourceCasOperations.length}.`,
  )
}
const resourceConcurrencyDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'api', 'v1', 'resource-concurrency.md'),
  'utf8',
)
for (const operation of resourceCasOperations) {
  const marker = `\`${operation.method} /v1${operation.path}\``
  if (!resourceConcurrencyDocumentation.includes(marker)) {
    fail(`Resource concurrency documentation is missing ${marker}.`)
  }
}
for (const marker of [
  '`developerRevision`',
  '`developerUpdatedAt`',
  '`400 invalid_precondition`',
  '`410 resource_operation_revision_unavailable`',
  '`412 precondition_failed`',
  '`428 precondition_required`',
  '`503 service_unavailable`',
  '`"prj1-<developerRevision>"`',
  '`"tpl1-<developerRevision>"`',
  '`"tsk1-<developerRevision>"`',
]) {
  if (!resourceConcurrencyDocumentation.includes(marker)) {
    fail(`Resource concurrency documentation is missing required marker: ${marker}.`)
  }
}
for (const operationId of ['getProjectLifecycleOperation', 'getProjectTemplateInstantiation']) {
  const operation = contractOperations.find((item) => item.operationId === operationId)
  const pathItem = operation && v1.paths?.[operation.path]
  const operationContract = pathItem && pathItem[operation.method.toLowerCase()]
  if (!operationContract?.responses?.['410']) {
    fail(`${operationId} is missing its legacy-operation 410 response.`)
  }
}

const mcpDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'mcp', 'tools-and-security.md'),
  'utf8',
)
const mcpOperations = capabilities.operationPolicy.filter((item) => item.mcp.exposure === 'read')
for (const operation of mcpOperations) {
  if (!mcpDocumentation.includes(`\`${operation.mcp.tool}\``)) {
    fail(`MCP documentation is missing ${operation.mcp.tool}.`)
  }
}
const mcpOverview = await readFile(
  path.join(root, 'src', 'content', 'docs', 'mcp', 'index.md'),
  'utf8',
)
if (!mcpOverview.includes(`profile exposes ${mcpOperations.length}`)) {
  fail(`MCP overview does not report the current ${mcpOperations.length}-tool all profile.`)
}

const authenticationDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'api', 'v1', 'authentication.md'),
  'utf8',
)
const scopeFile = path.join(root, 'public', 'openapi', 'developer-scopes.json')
const scopeContent = await readFile(scopeFile)
const scopeContract = JSON.parse(scopeContent.toString('utf8'))
const scopeSha256 = createHash('sha256').update(scopeContent).digest('hex')
if (
  manifest.scopes?.sha256 !== scopeSha256 ||
  manifest.scopes?.count !== scopeContract.scopes?.length ||
  canonicalManifest.summary?.canonicalScopes !== scopeContract.scopes?.length
) {
  fail('Developer scope contract does not match sources/contracts.json and the canonical manifest.')
}
const documentedScopes = new Set()
for (const pathItem of Object.values(v1.paths || {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method)) continue
    for (const scope of [
      ...(operation['x-teamgrid-required-scopes'] || []),
      ...(operation['x-teamgrid-optional-scopes'] || []),
    ]) {
      documentedScopes.add(scope)
    }
  }
}
for (const scope of documentedScopes) {
  if (!authenticationDocumentation.includes(`\`${scope}\``)) {
    fail(`Credential documentation is missing ${scope}.`)
  }
}
for (const scope of scopeContract.scopes || []) {
  if (!authenticationDocumentation.includes(`\`${scope.name}\``)) {
    fail(`Credential documentation is missing canonical scope ${scope.name}.`)
  }
}

const migrationFile = path.join(root, 'public', 'openapi', 'v0-to-v1-migration.json')
const migrationContent = await readFile(migrationFile)
const migrationContract = JSON.parse(migrationContent.toString('utf8'))
const migrationSha256 = createHash('sha256').update(migrationContent).digest('hex')
if (
  manifest.migration?.sha256 !== migrationSha256 ||
  manifest.migration?.routes !== migrationContract.routes?.length ||
  canonicalManifest.summary?.v0MigrationRoutes !== migrationContract.routes?.length
) {
  fail('v0-to-v1 migration contract does not match sources/contracts.json and the manifest.')
}

const cliDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'cli', 'commands.md'),
  'utf8',
)
for (const group of new Set(
  capabilities.operationPolicy.map((operation) => operation.cli.split(' ')[0]),
)) {
  if (!cliDocumentation.includes(`teamgrid ${group}`)) {
    fail(`CLI documentation is missing the ${group} command group.`)
  }
}

const sdkDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'sdk', 'index.md'),
  'utf8',
)
for (const resource of new Set(
  capabilities.operationPolicy.map((operation) => operation.sdk.split('.')[0]),
)) {
  if (!sdkDocumentation.includes(`\`${resource}\``)) {
    fail(`SDK documentation is missing the ${resource} client.`)
  }
}

const coverageDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'guides', 'capability-coverage.md'),
  'utf8',
)
const currentV1PathCount = Object.keys(v1.paths || {}).length
for (const marker of [
  `${currentV1PathCount} paths and ${canonicalManifest.summary?.v1Operations} operations`,
  `classifies ${canonicalManifest.summary?.classifiedProductCapabilities} capabilities`,
]) {
  if (!coverageDocumentation.includes(marker)) {
    fail(`Capability coverage documentation is missing current marker: ${marker}.`)
  }
}

const openApiDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'openapi', 'index.md'),
  'utf8',
)
for (const marker of [
  `\`${canonicalManifest.contractVersion}\` manifest`,
  `${currentV1PathCount} v1 paths`,
  `${canonicalManifest.summary?.governedV1Operations} governed v1 operations`,
  `${canonicalManifest.summary?.canonicalScopes} canonical scopes`,
  `exactly ${canonicalManifest.summary?.resourceCasMutationOperations} \`resource-cas-v1\` mutation operations`,
]) {
  if (!openApiDocumentation.includes(marker)) {
    fail(`OpenAPI documentation is missing current manifest marker: ${marker}.`)
  }
}
const capabilityStatusCounts = capabilities.productCapabilities.reduce((counts, capability) => {
  counts[capability.status] = (counts[capability.status] || 0) + 1
  return counts
}, {})
for (const [label, status] of [
  ['Released in the controlled-beta contract', 'released'],
  ['Partial', 'partial'],
  ['Planned', 'planned'],
  ['Intentionally private', 'private'],
]) {
  const marker = `| ${label} | ${capabilityStatusCounts[status]} |`
  if (!coverageDocumentation.includes(marker)) {
    fail(`Capability coverage documentation is missing current status count: ${marker}.`)
  }
}

const referenceMap = JSON.parse(
  await readFile(path.join(root, 'sources', 'readme-v0-reference-map.json'), 'utf8'),
)
if (Object.keys(referenceMap).length !== 54) fail('Expected 54 legacy ReadMe reference URLs.')

const redirects = await readFile(path.join(root, 'public', '_redirects'), 'utf8')
for (const slug of Object.keys(referenceMap)) {
  if (!redirects.includes(`/reference/${slug} `)) fail(`Missing legacy redirect for ${slug}.`)
}

const headers = await readFile(path.join(root, 'public', '_headers'), 'utf8')
for (const pattern of ['https://:project.pages.dev/*', 'https://:version.:project.pages.dev/*']) {
  if (!headers.includes(`${pattern}\n  X-Robots-Tag: noindex`)) {
    fail(`Missing Pages noindex rule for ${pattern}.`)
  }
}

for (const file of ['llms.txt', 'llms-full.txt']) {
  const content = await readFile(path.join(root, 'public', file), 'utf8')
  if (!content.includes('API v1 is the source of truth')) fail(`${file} is missing platform guidance.`)
}

for (const route of ['cli', 'mcp', 'sdk', 'security', 'openapi', 'changelog']) {
  try {
    await readFile(path.join(root, 'src', 'content', 'docs', route, 'index.md'), 'utf8')
  } catch {
    fail(`Missing required documentation section: ${route}.`)
  }
}

const requiredDirectories = {
  'src/content/docs/api/v0/guides': 13,
  'src/content/docs/api/v0/legacy-changelog': 5,
  'src/content/docs/api/v0/recipes': 6,
}
for (const [directory, expected] of Object.entries(requiredDirectories)) {
  const files = (await readdir(path.join(root, directory))).filter((file) => file.endsWith('.md'))
  if (files.length !== expected) fail(`${directory} contains ${files.length} files; expected ${expected}.`)
}

async function collectFiles(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await collectFiles(file)))
    else result.push(file)
  }
  return result
}

for (const file of await collectFiles(path.join(root, 'src'))) {
  if (!/\.(astro|css|md|mdx|ts)$/.test(file)) continue
  const content = await readFile(file, 'utf8')
  if (/tg_sk_v1_[a-z0-9-]+_[a-z0-9-]+_[a-f0-9]{24}_[a-f0-9]{64}/.test(content)) {
    fail(`${path.relative(root, file)} contains a credential-shaped value.`)
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exitCode = 1
} else {
  console.log('Documentation sources and contracts are consistent.')
}
