import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const files = {
  bindings: path.join(root, 'public', 'openapi', 'developer-operation-bindings.json'),
  capabilities: path.join(root, 'public', 'openapi', 'developer-capabilities.json'),
  openApi: path.join(root, 'public', 'openapi', 'v1.json'),
  packages: path.join(root, 'sources', 'packages.json'),
  reference: path.join(root, 'sources', 'sdk-reference.json'),
}
const [bindingsSource, capabilitiesSource, openApiSource, packagesSource, referenceSource] =
  await Promise.all(Object.values(files).map((file) => readFile(file, 'utf8')))
const bindings = JSON.parse(bindingsSource)
const capabilities = JSON.parse(capabilitiesSource)
const openApi = JSON.parse(openApiSource)
const packages = JSON.parse(packagesSource)
const reference = JSON.parse(referenceSource)
const failures = []
const sha256 = (value) => createHash('sha256').update(value).digest('hex')

function operationMap() {
  const map = new Map()
  const methods = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'])
  for (const [apiPath, pathItem] of Object.entries(openApi.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (methods.has(method) && operation?.operationId) {
        map.set(operation.operationId, {
          conditionalScopes: operation['x-teamgrid-conditional-scopes'] || [],
          method: method.toUpperCase(),
          path: apiPath,
          requiredScopes: operation['x-teamgrid-required-scopes'] || [],
        })
      }
    }
  }
  return map
}

if (reference.schemaVersion !== 1) failures.push('SDK reference schemaVersion must be 1.')
if (reference.package?.name !== '@teamgrid/api-client') failures.push('SDK package name is invalid.')
if (reference.package?.version !== packages.packages?.apiClient?.version) {
  failures.push('SDK reference version does not match sources/packages.json.')
}
if (reference.package?.sourceCommit !== packages.sourceCommit) {
  failures.push('SDK reference commit does not match sources/packages.json.')
}
for (const [field, source] of [
  ['capabilityPolicySha256', capabilitiesSource],
  ['operationBindingsSha256', bindingsSource],
  ['openApiSha256', openApiSource],
]) {
  if (reference.sources?.[field] !== sha256(source)) failures.push(`${field} is stale.`)
}

const clients = reference.clients || []
const operations = clients.flatMap((client) =>
  (client.operations || []).map((operation) => ({ client, operation })),
)
const helpers = clients.flatMap((client) => client.helpers || [])
if (clients.length !== reference.summary?.clientCount) failures.push('SDK client summary is stale.')
if (operations.length !== reference.summary?.operationCount) failures.push('SDK operation summary is stale.')
if (helpers.length !== reference.summary?.helperCount) failures.push('SDK helper summary is stale.')
if (clients.length !== 54) failures.push(`Expected 54 SDK clients, found ${clients.length}.`)
if (operations.length !== 235) failures.push(`Expected 235 SDK operations, found ${operations.length}.`)

const policies = capabilities.operationPolicy.filter((operation) => operation.sdk)
const policiesByOperation = new Map(policies.map((operation) => [operation.operationId, operation]))
const bindingsByOperation = new Map(bindings.operations.map((operation) => [operation.operationId, operation]))
const apiOperations = operationMap()
const seenOperations = new Set()
const seenSdkPaths = new Set()
const seenSlugs = new Set()

for (const client of clients) {
  if (!client.name || !client.slug) failures.push('Every SDK client needs a name and slug.')
  if (seenSlugs.has(client.slug)) failures.push(`Duplicate SDK client slug ${client.slug}.`)
  seenSlugs.add(client.slug)
  if (client.operationCount !== client.operations?.length) {
    failures.push(`${client.name} operationCount is stale.`)
  }
}

for (const { client, operation } of operations) {
  const sdkPath = `${client.name}.${operation.name}`
  const policy = policiesByOperation.get(operation.operationId)
  const binding = bindingsByOperation.get(operation.operationId)
  const apiOperation = apiOperations.get(operation.operationId)
  if (seenOperations.has(operation.operationId)) failures.push(`Duplicate ${operation.operationId}.`)
  if (seenSdkPaths.has(sdkPath)) failures.push(`Duplicate ${sdkPath}.`)
  seenOperations.add(operation.operationId)
  seenSdkPaths.add(sdkPath)
  if (policy?.sdk !== sdkPath) failures.push(`${operation.operationId} has stale SDK path ${sdkPath}.`)
  if (!binding) failures.push(`${operation.operationId} has no operation binding.`)
  if (!apiOperation) failures.push(`${operation.operationId} is absent from OpenAPI v1.`)
  if (apiOperation && (operation.httpMethod !== apiOperation.method || operation.path !== apiOperation.path)) {
    failures.push(`${operation.operationId} has a stale HTTP method or path.`)
  }
  if (binding && JSON.stringify(operation.requiredScopes) !== JSON.stringify(binding.requiredScopes || [])) {
    failures.push(`${operation.operationId} has stale required scopes.`)
  }
  if (binding && JSON.stringify(operation.conditionalScopes) !== JSON.stringify(binding.conditionalScopes || [])) {
    failures.push(`${operation.operationId} has stale conditional scopes.`)
  }
  if (apiOperation && JSON.stringify(operation.requiredScopes) !== JSON.stringify(apiOperation.requiredScopes)) {
    failures.push(`${operation.operationId} scopes disagree with OpenAPI v1.`)
  }
  if (apiOperation && JSON.stringify(operation.conditionalScopes) !== JSON.stringify(apiOperation.conditionalScopes)) {
    failures.push(`${operation.operationId} conditional scopes disagree with OpenAPI v1.`)
  }
  if (!operation.signature?.startsWith(`${sdkPath}(`)) {
    failures.push(`${sdkPath} has an invalid visible signature.`)
  }
  const expectedHref = `/api/v1/reference/operations/${operation.operationId.toLowerCase()}/`
  if (operation.apiHref !== expectedHref) failures.push(`${sdkPath} has a stale API reference link.`)
}

for (const policy of policies) {
  if (!seenOperations.has(policy.operationId)) failures.push(`${policy.operationId} is missing from the SDK reference.`)
  if (!seenSdkPaths.has(policy.sdk)) failures.push(`${policy.sdk} is missing from the SDK reference.`)
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(
  `SDK reference contract passed without a sibling checkout: ${clients.length} clients, ${operations.length} operations, ${helpers.length} helpers.`,
)
