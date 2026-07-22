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
  !/^[0-9a-f]{40}$/.test(manifest.sourceCommit || '') ||
  !/^[0-9a-f]{40}$/.test(manifest.runtimeCommit || '')
) {
  fail('Contract source or runtime provenance is missing or invalid.')
}
const packageManifest = JSON.parse(
  await readFile(path.join(root, 'sources', 'packages.json'), 'utf8'),
)
if (
  packageManifest.schemaVersion !== 1
  || packageManifest.sourceRepository !== 'TeamGrid/developer-platform'
  || !/^[0-9a-f]{40}$/.test(packageManifest.sourceCommit || '')
  || packageManifest.version !== '1.0.0-beta.2'
  || Object.values(packageManifest.packages || {}).some(
    (item) => item.version !== packageManifest.version || !/^[a-f0-9]{64}$/.test(item.sha256 || ''),
  )
) {
  fail('Package source provenance is missing or invalid.')
}
for (const relativePath of [
  'src/content/docs/sdk/index.md',
  'src/content/docs/sdk/quickstart.md',
  'src/content/docs/cli/index.md',
  'src/content/docs/cli/install-and-authenticate.md',
  'src/content/docs/mcp/index.md',
  'src/content/docs/mcp/configuration.md',
]) {
  const content = await readFile(path.join(root, relativePath), 'utf8')
  if (!content.includes(`@${packageManifest.version}`) || content.includes('@next')) {
    fail(`${relativePath} must name the exact verified package version.`)
  }
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
  'contracts/developer-action-policy-registry.json': 'developer-action-policy-registry.json',
  'contracts/developer-capabilities.json': 'developer-capabilities.json',
  'contracts/developer-operation-bindings.json': 'developer-operation-bindings.json',
  'contracts/developer-scopes.json': 'developer-scopes.json',
  'contracts/v0-routes.json': 'v0-routes.json',
  'contracts/v0-to-v1-migration.json': 'v0-to-v1-migration.json',
  'openapi/v0.json': 'v0.json',
  'openapi/v1.json': 'v1.json',
}

const actionPolicyContent = await readFile(path.join(
  root,
  'public',
  'openapi',
  'developer-action-policy-registry.json',
))
const actionPolicy = JSON.parse(actionPolicyContent.toString('utf8'))
const actionPolicySha256 = createHash('sha256').update(actionPolicyContent).digest('hex')
if (
  manifest.actionPolicyRegistry?.sha256 !== actionPolicySha256
  || manifest.actionPolicyRegistry?.registrySha256 !== actionPolicy.registrySha256
  || manifest.actionPolicyRegistry?.registryVersion !== actionPolicy.registryVersion
  || manifest.actionPolicyRegistry?.actionPolicies !== actionPolicy.actionPolicyCount
  || manifest.actionPolicyRegistry?.authenticatedActionPolicies
    !== actionPolicy.authenticatedActionPolicyCount
  || manifest.actionPolicyRegistry?.policyFamilies
    !== actionPolicy.principalPolicyFamilyIds?.length
) {
  fail('Developer action-policy registry does not match sources/contracts.json.')
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
if (
  v1.paths?.['/changes']
  || v1.components?.schemas?.ChangeEvent
  || manifest.changeFeed?.availability !== 'excluded'
) {
  fail('The beta 2 public contract must record the change feed as excluded.')
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

const expectedBeta2NonCasOperationIds = [
  'archiveProject',
  'archiveProjectTemplate',
  'archiveTask',
  'completeProject',
  'completeTask',
  'createProject',
  'createProjectTemplate',
  'createTask',
  'getProject',
  'getProjectLifecycleOperation',
  'getProjectTemplate',
  'getProjectTemplateInstantiation',
  'getTask',
  'instantiateProjectTemplate',
  'listProjects',
  'listProjectTemplates',
  'listTasks',
  'reopenProject',
  'reopenTask',
  'restoreProject',
  'restoreProjectTemplate',
  'restoreTask',
  'updateProject',
  'updateProjectTemplate',
  'updateTask',
]
const expectedIndependentIfMatchOperationIds = [
  'abortAutomationRun',
  'archiveAbsence',
  'archiveAppointment',
  'archiveAutomationDefinition',
  'archiveComment',
  'archiveDocument',
  'archiveFile',
  'cancelInvitation',
  'clearCustomFieldValue',
  'deleteGroup',
  'deleteRole',
  'removeMember',
  'renameFile',
  'replaceTaskPlannedWork',
  'resendInvitation',
  'restoreAbsence',
  'restoreAppointment',
  'restoreAutomationDefinition',
  'restoreComment',
  'restoreDocument',
  'restoreFile',
  'rotateWebhookSecret',
  'setCustomFieldValue',
  'updateAbsence',
  'updateAppointment',
  'updateAutomationDefinition',
  'updateDocument',
  'updateGroup',
  'updateMemberRole',
  'updateRole',
  'updateWorkspaceSettings',
]
const allV1Operations = Object.values(v1.paths || {})
  .flatMap((pathItem) => Object.values(pathItem))
  .filter((operation) => operation?.operationId)
const beta2NonCasOperations = allV1Operations
  .filter((operation) => expectedBeta2NonCasOperationIds.includes(operation.operationId))
  .sort((left, right) => left.operationId.localeCompare(right.operationId))
const independentIfMatchOperations = allV1Operations
  .filter((operation) =>
    (operation.parameters || []).some((parameter) =>
      /IfMatch/.test(parameter.$ref || parameter.name || ''),
    ),
  )
  .sort((left, right) => left.operationId.localeCompare(right.operationId))
const residualResourceCasOperations = allV1Operations.filter(
  (operation) => operation['x-teamgrid-resource-cas'] === 'resource-cas-v1',
)
const residualResourceCasReads = allV1Operations.filter(
  (operation) => operation['x-teamgrid-resource-cas-read'] === 'resource-cas-v1',
)
if (
  beta2NonCasOperations.length !== 25
  || JSON.stringify(beta2NonCasOperations.map((operation) => operation.operationId))
    !== JSON.stringify(expectedBeta2NonCasOperationIds)
  || canonicalManifest.summary?.beta2NonCasResourceOperations !== 25
  || canonicalManifest.summary?.resourceCasMutationOperations !== 0
  || canonicalManifest.summary?.resourceCasOperationReads !== 0
  || residualResourceCasOperations.length !== 0
  || residualResourceCasReads.length !== 0
) {
  fail('Beta 2 must expose exactly 25 static core operations and zero resource-CAS operations.')
}
if (
  JSON.stringify(independentIfMatchOperations.map((operation) => operation.operationId))
  !== JSON.stringify(expectedIndependentIfMatchOperationIds)
) {
  fail('Beta 2 must preserve exactly the 31 independent If-Match operations.')
}
for (const operation of independentIfMatchOperations) {
  const ifMatchParameters = (operation.parameters || []).filter((parameter) =>
    /IfMatch/.test(parameter.$ref || parameter.name || ''),
  )
  if (
    ifMatchParameters.length !== 1
    || ['400', '412', '428', '503'].some((status) => operation.responses?.[status] === undefined)
  ) {
    fail(`${operation.operationId} has an incomplete independent If-Match contract.`)
  }
}
for (const operation of beta2NonCasOperations) {
  const ifMatchParameters = (operation.parameters || []).filter((parameter) =>
    /IfMatch(?:Project|ProjectTemplate|Task)$/.test(parameter.$ref || parameter.name || ''),
  )
  if (
    ifMatchParameters.length !== 0
    || operation.responses?.['412'] !== undefined
    || operation.responses?.['428'] !== undefined
    || operation['x-teamgrid-resource-cas'] !== undefined
    || operation['x-teamgrid-resource-cas-read'] !== undefined
  ) {
    fail(`${operation.operationId} still exposes a retired core resource-CAS contract.`)
  }
}
for (const parameterName of ['IfMatchProject', 'IfMatchProjectTemplate', 'IfMatchTask']) {
  if (v1.components?.parameters?.[parameterName] !== undefined) {
    fail(`Retired core parameter ${parameterName} remains in OpenAPI.`)
  }
}
for (const [schemaName, retiredFields] of Object.entries({
  Project: ['developerRevision', 'developerUpdatedAt'],
  ProjectLifecycleOperation: ['resultRevision', 'sourceRevision'],
  ProjectTemplate: ['developerRevision', 'developerUpdatedAt'],
  ProjectTemplateInstantiation: ['resultRevision', 'sourceRevision'],
  Task: ['developerRevision', 'developerUpdatedAt'],
})) {
  const properties = v1.components?.schemas?.[schemaName]?.properties?.attributes?.properties
  if (!properties || retiredFields.some((field) => properties[field] !== undefined)) {
    fail(`${schemaName} still exposes retired core resource-CAS fields.`)
  }
}
const resourceConcurrencyDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'api', 'v1', 'resource-concurrency.md'),
  'utf8',
)
for (const marker of [
  '25 static core operations',
  '31 independent `If-Match` operations',
  'do not expose `developerRevision` or `developerUpdatedAt`',
  '`400 invalid_precondition`',
  '`412 precondition_failed`',
  '`428 precondition_required`',
  '`503 service_unavailable`',
]) {
  if (!resourceConcurrencyDocumentation.includes(marker)) {
    fail(`Resource concurrency documentation is missing required marker: ${marker}.`)
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
const changePolicy = capabilities.operationPolicy.find((item) => item.operationId === 'listChanges')
if (changePolicy) fail('The beta 2 capability contract must exclude listChanges.')
if (!mcpDocumentation.includes('The change feed is not part of the current public beta contract')) {
  fail('MCP documentation is missing the explicit beta change-feed boundary.')
}

const changeFeedDocumentation = await readFile(
  path.join(root, 'src', 'content', 'docs', 'api', 'v1', 'change-feed.md'),
  'utf8',
)
for (const marker of [
  'not part of the `1.0.0-beta.2` public contract',
  '`changes:read` cannot be issued',
  '`GET /v1/changes` is not a supported beta operation',
]) {
  if (!changeFeedDocumentation.includes(marker)) {
    fail(`Change-feed status documentation is missing: ${marker}.`)
  }
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
if (scopeContract.scopes?.some((scope) => scope.name === 'changes:read')) {
  fail('The beta 2 scope contract must not issue changes:read.')
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
  `${canonicalManifest.summary?.beta2NonCasResourceOperations} static non-CAS core operations`,
  '31 independent `If-Match` operations',
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
for (const legacyReferenceHome of ['/reference ', '/reference/team-grid-api-v1 ']) {
  if (!redirects.includes(legacyReferenceHome)) {
    fail(`Missing legacy redirect for ${legacyReferenceHome.trim()}.`)
  }
}
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
