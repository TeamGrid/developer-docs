import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const root = path.resolve(import.meta.dirname, '..')
const outputFile = path.join(root, 'sources', 'sdk-reference.json')
const developerPlatform = path.resolve(
  process.env.TEAMGRID_DEVELOPER_PLATFORM_DIR || path.join(root, '..', 'developer-platform'),
)

const [packagesSource, capabilitiesSource, bindingsSource, openApiSource] = await Promise.all([
  readFile(path.join(root, 'sources', 'packages.json'), 'utf8'),
  readFile(path.join(root, 'public', 'openapi', 'developer-capabilities.json'), 'utf8'),
  readFile(path.join(root, 'public', 'openapi', 'developer-operation-bindings.json'), 'utf8'),
  readFile(path.join(root, 'public', 'openapi', 'v1.json'), 'utf8'),
])

const packages = JSON.parse(packagesSource)
const capabilities = JSON.parse(capabilitiesSource)
const bindings = JSON.parse(bindingsSource)
const openApi = JSON.parse(openApiSource)
const sourceCommit = packages.sourceCommit
const packageVersion = packages.packages?.apiClient?.version

if (!/^[0-9a-f]{40}$/.test(sourceCommit || '')) {
  throw new Error('sources/packages.json must pin a full developer-platform source commit.')
}
if (!packageVersion) throw new Error('sources/packages.json does not pin @teamgrid/api-client.')

function gitShow(file) {
  try {
    return execFileSync('git', ['-C', developerPlatform, 'show', `${sourceCommit}:${file}`], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
  } catch (error) {
    throw new Error(
      `Could not read ${file} at ${sourceCommit} from ${developerPlatform}. ` +
        'Set TEAMGRID_DEVELOPER_PLATFORM_DIR to a developer-platform checkout containing the pinned commit.',
      { cause: error },
    )
  }
}

const declarationPath = 'developer-platform/packages/api-client/src/client.ts'
const packagePath = 'developer-platform/packages/api-client/package.json'
const declarationSource = gitShow(declarationPath)
const packageSource = gitShow(packagePath)
const sourcePackage = JSON.parse(packageSource)

if (sourcePackage.name !== '@teamgrid/api-client' || sourcePackage.version !== packageVersion) {
  throw new Error(
    `Pinned source publishes ${sourcePackage.name}@${sourcePackage.version}; expected @teamgrid/api-client@${packageVersion}.`,
  )
}

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const slugify = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
const titleCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (character) => character.toUpperCase())

function refName(reference) {
  return String(reference).split('/').at(-1)
}

function resolveRef(value) {
  if (!value?.$ref) return value
  if (!value.$ref.startsWith('#/')) return value
  return value.$ref
    .slice(2)
    .split('/')
    .reduce((current, segment) => current?.[segment.replaceAll('~1', '/').replaceAll('~0', '~')], openApi)
}

function schemaLabel(rawSchema) {
  if (!rawSchema) return null
  if (rawSchema.$ref) return refName(rawSchema.$ref)
  const schema = resolveRef(rawSchema)
  if (schema?.$ref) return refName(schema.$ref)
  if (schema?.type === 'array') return `Array<${schemaLabel(schema.items) || 'unknown'}>`
  if (Array.isArray(schema?.type)) return schema.type.join(' | ')
  if (schema?.oneOf) return schema.oneOf.map(schemaLabel).filter(Boolean).join(' | ')
  if (schema?.anyOf) return schema.anyOf.map(schemaLabel).filter(Boolean).join(' | ')
  if (schema?.type === 'object' && schema.properties?.data) {
    const data = schemaLabel(schema.properties.data)
    if (data) return `${data} envelope`
  }
  return schema?.type || null
}

function contentContract(rawContent) {
  const content = resolveRef(rawContent)
  if (!content || typeof content !== 'object') return null
  const [mediaType, media] = Object.entries(content)[0] || []
  if (!mediaType) return null
  return { mediaType, schema: schemaLabel(media?.schema) }
}

function openApiOperations() {
  const operations = new Map()
  const methods = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'])
  for (const [apiPath, pathItem] of Object.entries(openApi.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (!methods.has(method) || !operation?.operationId) continue
      const parameters = [...(pathItem.parameters || []), ...(operation.parameters || [])]
        .map(resolveRef)
        .map((parameter) => ({
          description: parameter.description || null,
          location: parameter.in,
          name: parameter.name,
          required: Boolean(parameter.required),
          type: schemaLabel(parameter.schema),
        }))
      const requestBody = resolveRef(operation.requestBody)
      const responses = Object.entries(operation.responses || {}).map(([status, rawResponse]) => {
        const response = resolveRef(rawResponse)
        return {
          description: response?.description || null,
          ...contentContract(response?.content),
          status,
        }
      })
      operations.set(operation.operationId, {
        conditionalScopes: operation['x-teamgrid-conditional-scopes'] || [],
        description: operation.description || null,
        method: method.toUpperCase(),
        operationId: operation.operationId,
        parameters,
        path: apiPath,
        requestBody: contentContract(requestBody?.content),
        requiredScopes: operation['x-teamgrid-required-scopes'] || [],
        responses,
        summary: operation.summary || operation.operationId,
        tag: operation.tags?.[0] || 'API v1',
      })
    }
  }
  return operations
}

function parseClientDeclaration() {
  const source = ts.createSourceFile(
    'client.ts',
    declarationSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const clientClass = source.statements.find(
    (node) => ts.isClassDeclaration(node) && node.name?.text === 'TeamGridClient',
  )
  if (!clientClass) throw new Error('TeamGridClient declaration was not found in client.d.ts.')

  const clients = new Map()
  let clientOptions = []
  for (const statement of source.statements) {
    if (!ts.isTypeAliasDeclaration(statement) || statement.name.text !== 'TeamGridClientOptions') continue
    if (!ts.isTypeLiteralNode(statement.type)) continue
    clientOptions = statement.type.members
      .filter((member) => ts.isPropertySignature(member) && member.type)
      .map((member) => ({
        name: member.name.getText(source),
        optional: Boolean(member.questionToken),
        type: member.type.getText(source),
      }))
  }

  const constructor = clientClass.members.find((member) => ts.isConstructorDeclaration(member))
  if (!constructor?.body) throw new Error('TeamGridClient constructor was not found in client.ts.')
  for (const statement of constructor.body.statements) {
    if (!ts.isExpressionStatement(statement)) continue
    const assignment = statement.expression
    if (
      !ts.isBinaryExpression(assignment) ||
      assignment.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
      !ts.isPropertyAccessExpression(assignment.left) ||
      assignment.left.expression.kind !== ts.SyntaxKind.ThisKeyword ||
      !ts.isObjectLiteralExpression(assignment.right)
    ) continue
    const clientName = assignment.left.name.text
    const methods = new Map()
    for (const methodMember of assignment.right.properties) {
      if (
        !ts.isPropertyAssignment(methodMember) ||
        !ts.isArrowFunction(methodMember.initializer)
      ) continue
      const methodName = methodMember.name.getText(source)
      const parameters = methodMember.initializer.parameters.map((parameter) => ({
        display: parameter.getText(source),
        name: parameter.name.getText(source),
        optional: Boolean(parameter.questionToken || parameter.initializer),
        type: parameter.type?.getText(source) || 'unknown',
      }))
      methods.set(methodName, {
        name: methodName,
        parameters,
        returnForm: methodName === 'pages' ? 'AsyncGenerator' : 'Promise',
        signature: `${clientName}.${methodName}(${parameters.map(({ display }) => display).join(', ')})`,
      })
    }
    clients.set(clientName, methods)
  }
  return { clientOptions, clients }
}

const apiOperations = openApiOperations()
const declaration = parseClientDeclaration()
const bindingsByOperation = new Map(bindings.operations.map((operation) => [operation.operationId, operation]))
const mappedPolicies = capabilities.operationPolicy.filter((operation) => operation.sdk)
const mappedSdkPaths = new Set(mappedPolicies.map((operation) => operation.sdk))
const seenSdkPaths = new Set()

const mappedByClient = new Map()
for (const policy of mappedPolicies) {
  const [clientName, methodName, ...unexpected] = policy.sdk.split('.')
  if (unexpected.length > 0 || !clientName || !methodName) {
    throw new Error(`Invalid SDK mapping ${policy.sdk} for ${policy.operationId}.`)
  }
  const declarationMethod = declaration.clients.get(clientName)?.get(methodName)
  if (!declarationMethod) {
    throw new Error(`${policy.sdk} is mapped but absent from the pinned TeamGridClient declaration.`)
  }
  const operation = apiOperations.get(policy.operationId)
  if (!operation) throw new Error(`${policy.operationId} is mapped to the SDK but absent from OpenAPI v1.`)
  const binding = bindingsByOperation.get(policy.operationId)
  if (!binding) throw new Error(`${policy.operationId} has no operation binding.`)
  if (policy.method !== operation.method || policy.path !== operation.path) {
    throw new Error(`${policy.operationId} disagrees between capability policy and OpenAPI v1.`)
  }
  if (binding.method !== operation.method || binding.path !== operation.path) {
    throw new Error(`${policy.operationId} disagrees between operation bindings and OpenAPI v1.`)
  }
  const requiredScopes = [...new Set(binding.requiredScopes || [])]
  const conditionalScopes = [...new Set(binding.conditionalScopes || [])]
  const openApiScopes = [...new Set(operation.requiredScopes || [])]
  const openApiConditionalScopes = [...new Set(operation.conditionalScopes || [])]
  if (requiredScopes.join('\0') !== openApiScopes.join('\0')) {
    throw new Error(`${policy.operationId} required scopes disagree between bindings and OpenAPI v1.`)
  }
  if (conditionalScopes.join('\0') !== openApiConditionalScopes.join('\0')) {
    throw new Error(`${policy.operationId} conditional scopes disagree between bindings and OpenAPI v1.`)
  }
  seenSdkPaths.add(policy.sdk)
  const methods = mappedByClient.get(clientName) || []
  methods.push({
    ...declarationMethod,
    apiHref: `/api/v1/reference/operations/${operation.operationId.toLowerCase()}/`,
    conditionalScopes,
    description: operation.description,
    errorResponses: operation.responses.filter(({ status }) => status === 'default' || /^[45]/.test(status)),
    httpMethod: operation.method,
    operationId: operation.operationId,
    path: operation.path,
    request: {
      body: operation.requestBody,
      parameters: operation.parameters,
    },
    requiredScopes,
    successResponses: operation.responses.filter(({ status }) => /^2/.test(status)),
    summary: operation.summary,
    tag: operation.tag,
  })
  mappedByClient.set(clientName, methods)
}

if (seenSdkPaths.size !== mappedSdkPaths.size) {
  throw new Error('The SDK mapping contains duplicate method paths.')
}

const helperDescriptions = {
  checkpoint: 'Capture an opaque, credential- and filter-bound change-feed checkpoint.',
  pages: 'Iterate cursor pages with a bounded PaginationOptions policy.',
  snapshotThenCatchUp: 'Take a checkpoint, run a caller-owned snapshot, and expose bounded catch-up pages.',
  wait: 'Poll a credential-owned asynchronous operation with bounded wait options.',
}

const clients = []
for (const [clientName, declaredMethods] of declaration.clients) {
  const operations = mappedByClient.get(clientName) || []
  if (operations.length === 0) continue
  const helpers = [...declaredMethods.values()]
    .filter((method) => !mappedSdkPaths.has(`${clientName}.${method.name}`))
    .map((method) => ({
      ...method,
      description:
        helperDescriptions[method.name] ||
        'SDK convenience helper without a one-to-one public API operation.',
    }))
  const scopes = [...new Set(operations.flatMap((operation) => operation.requiredScopes))].sort()
  const conditionalScopes = [
    ...new Set(operations.flatMap((operation) => operation.conditionalScopes)),
  ].sort()
  clients.push({
    conditionalScopes,
    helpers,
    name: clientName,
    operationCount: operations.length,
    operations,
    scopes,
    slug: slugify(clientName),
    tags: [...new Set(operations.map((operation) => operation.tag))],
    title: titleCase(clientName),
  })
}

const operationCount = clients.reduce((total, client) => total + client.operationCount, 0)
const helperCount = clients.reduce((total, client) => total + client.helpers.length, 0)
if (operationCount !== mappedPolicies.length) {
  throw new Error(`Generated ${operationCount} SDK operations; expected ${mappedPolicies.length}.`)
}
if (operationCount !== 235) {
  throw new Error(`Stable @teamgrid/api-client@${packageVersion} must expose 235 mapped operations, found ${operationCount}.`)
}

const reference = {
  schemaVersion: 1,
  package: {
    name: sourcePackage.name,
    node: sourcePackage.engines?.node,
    sourceCommit,
    version: packageVersion,
  },
  sources: {
    capabilityPolicySha256: sha256(capabilitiesSource),
    clientDeclaration: declarationPath,
    clientDeclarationSha256: sha256(declarationSource),
    operationBindingsSha256: sha256(bindingsSource),
    openApiSha256: sha256(openApiSource),
  },
  summary: {
    clientCount: clients.length,
    helperCount,
    operationCount,
  },
  clientOptions: declaration.clientOptions,
  clients,
}
const serialized = `${JSON.stringify(reference, null, 2)}\n`

if (process.argv.includes('--check')) {
  let current
  try {
    current = await readFile(outputFile, 'utf8')
  } catch {
    current = null
  }
  if (current !== serialized) {
    console.error('sources/sdk-reference.json is stale. Run node scripts/sync-sdk-reference.mjs.')
    process.exit(1)
  }
  console.log(
    `SDK reference is current: ${clients.length} clients, ${operationCount} mapped operations, ${helperCount} helpers.`,
  )
} else {
  await writeFile(outputFile, serialized)
  console.log(
    `Wrote sources/sdk-reference.json: ${clients.length} clients, ${operationCount} mapped operations, ${helperCount} helpers.`,
  )
}
