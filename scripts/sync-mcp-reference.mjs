import { execFileSync, spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const platformArgument = process.argv.find((argument) => argument.startsWith('--platform-root='))
const platformRoot = resolve(
  platformArgument?.slice('--platform-root='.length) ||
    process.env.TEAMGRID_DEVELOPER_PLATFORM_DIR ||
    resolve(repositoryRoot, '../developer-platform'),
)
const platformRepositoryPath = 'developer-platform/packages/mcp-server'
const mcpPackageRoot = resolve(platformRoot, platformRepositoryPath)
const packagesPath = resolve(repositoryRoot, 'sources/packages.json')
const capabilitiesPath = resolve(repositoryRoot, 'public/openapi/developer-capabilities.json')
const openApiPath = resolve(repositoryRoot, 'public/openapi/v1.json')
const referencePath = resolve(repositoryRoot, 'sources/mcp-reference.json')
const outputDirectory = resolve(repositoryRoot, 'src/content/docs/mcp/reference')

function fail(message) {
  throw new Error(`MCP reference sync failed: ${message}`)
}

function git(...arguments_) {
  return execFileSync('git', ['-C', platformRoot, ...arguments_], { encoding: 'utf8' }).trim()
}

function asJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function escapeMarkdownCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function operationHref(operationId) {
  return `/api/v1/reference/operations/${operationId.toLowerCase()}/`
}

function findOpenApiOperation(openApi, operationId) {
  for (const [path, pathItem] of Object.entries(openApi.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (operation?.operationId === operationId) return { method, operation, path }
    }
  }
  fail(`OpenAPI operation '${operationId}' does not exist.`)
}

function baseProfile(name, profiles) {
  if (profiles.core.includes(name)) return 'core'
  if (profiles.collaboration.includes(name)) return 'collaboration'
  if (profiles.governance.includes(name)) return 'governance'
  if (profiles.all.includes(name)) return 'all'
  fail(`Tool '${name}' is not assigned to an MCP tool profile.`)
}

function securityClassification(name) {
  if (name === 'teamgrid_search') {
    return {
      classification: 'cross-domain-sensitive',
      summary:
        'A single query can cross contacts, projects, and tasks. Contact matches can contain personal data.',
    }
  }
  if (name.includes('call_note')) {
    return {
      classification: 'conversation-data',
      summary: 'The response can contain sensitive plain-text conversation data.',
    }
  }
  if (name.includes('contact') || name === 'teamgrid_users_list') {
    return {
      classification: 'personal-data',
      summary: 'The response can contain personal or relationship data.',
    }
  }
  if (name.includes('service')) {
    return {
      classification: 'commercial-data',
      summary: 'Service responses can contain commercially sensitive billing configuration.',
    }
  }
  if (name.includes('webhook')) {
    return {
      classification: 'security-configuration',
      summary:
        'Webhook configuration is security-sensitive. Read responses do not expose the signing secret.',
    }
  }
  if (name.includes('custom_field_definition')) {
    return {
      classification: 'governance-metadata',
      summary:
        'Custom-field definitions describe workspace schema and compatibility, but not per-resource values.',
    }
  }
  if (name.includes('time_entr')) {
    return {
      classification: 'work-record-data',
      summary: 'Time-entry records can expose individual work activity and billing state.',
    }
  }
  if (name === 'teamgrid_workspace_get') {
    return {
      classification: 'tenant-metadata',
      summary: 'The response identifies the authenticated workspace, region, and cell.',
    }
  }
  return {
    classification: 'operational-data',
    summary: 'The response contains operational workspace data visible to the credential.',
  }
}

function resourceLabel(name) {
  return name
    .replace(/^teamgrid_/, '')
    .replace(/_(?:get|list)$/, '')
    .replaceAll('_', ' ')
}

function examplePrompt(tool) {
  if (tool.name === 'teamgrid_workspace_get') {
    return 'Use TeamGrid to show the authenticated workspace and its region. Do not call any write-capable tool.'
  }
  if (tool.name === 'teamgrid_search') {
    return 'Search TeamGrid contacts, projects, and tasks for “proposal”. Return at most 10 matches and identify each matching resource type.'
  }
  if (tool.inputSchema.required?.includes('id')) {
    return `Read the TeamGrid ${resourceLabel(tool.name)} with ID \`<id>\` and summarize only the fields returned by TeamGrid.`
  }
  return `List the first 20 TeamGrid ${resourceLabel(tool.name)}. Do not request another page; tell me whether another cursor is available.`
}

function typicalErrors(tool) {
  const errors = []
  const scopeRequirement = [
    ...tool.scopes.required.map((scope) => `\`${scope}\``),
    ...(tool.scopes.conditional.length
      ? [`an applicable conditional domain scope (${tool.scopes.conditional.map((scope) => `\`${scope}\``).join(', ')})`]
      : []),
  ].join(' or ')
  if (tool.baseProfile !== 'core') {
    errors.push({
      condition: `The host uses a tool profile that does not include \`${tool.baseProfile}\` access.`,
      result: 'The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host.',
    })
  }
  if (tool.name === 'teamgrid_search') {
    errors.push({
      condition:
        '`term` is shorter than 2 or longer than 160 characters, contains control characters, or `types` is empty, duplicated, unsupported, or longer than 3.',
      result: 'MCP input validation rejects the call before an API request is made.',
    })
  } else if (tool.inputSchema.required?.includes('id')) {
    errors.push({
      condition: '`id` is missing, empty, or longer than 128 characters.',
      result: 'MCP input validation rejects the call before an API request is made.',
    })
  } else {
    errors.push({
      condition: '`limit` is outside 1–100, `cursor` is longer than 512 characters, or a filter has an unsupported value.',
      result: 'MCP input validation rejects the call before an API request is made.',
    })
  }
  errors.push(
    {
      condition: `The credential lacks ${scopeRequirement} or cannot access the requested resource.`,
      result:
        'The tool returns `teamgrid_request_failed`; the redacted detail comes from the rejected TeamGrid request.',
    },
    {
      condition: 'The serialized result exceeds 256 KiB.',
      result: tool.output?.pagination
        ? 'The tool returns `result_too_large`. Request a smaller page or narrower filters.'
        : 'The tool returns `result_too_large`. Use a narrower supported read, or move the workflow to the API, SDK, or CLI.',
    },
    {
      condition: 'An unknown input property is supplied.',
      result: 'The strict input schema rejects the call before an API request is made.',
    },
  )
  return errors
}

function outputContract(tool, maxToolResultBytes) {
  const hasCursor = Boolean(tool.inputSchema.properties?.cursor)
  const isSearch = tool.name === 'teamgrid_search'
  const redactions = []
  if (tool.name === 'teamgrid_product_get' || tool.name === 'teamgrid_products_list') {
    redactions.push('`purchasePrice` is removed even when the credential has a finance overlay.')
  }
  if (tool.name === 'teamgrid_webhook_get' || tool.name === 'teamgrid_webhooks_list') {
    redactions.push('Webhook read responses do not contain the reveal-once signing secret.')
  }
  if (tool.name.includes('custom_field_definition')) {
    redactions.push('The tool exposes canonical definitions, not legacy defaults or per-resource values.')
  }
  return {
    format:
      'The API v1 response envelope is returned as MCP structured content and as the same serialized JSON in a text content block.',
    kind: isSearch ? 'bounded-search' : hasCursor ? 'cursor-page' : 'single-resource',
    maxSerializedBytes: maxToolResultBytes,
    pagination: hasCursor
      ? {
          input: 'Pass the opaque `meta.page.nextCursor` value as `cursor`.',
          maxPageSize: tool.inputSchema.properties.limit.maximum,
          nextCursor: 'meta.page.nextCursor',
        }
      : null,
    redactions,
    searchLimit: isSearch ? tool.inputSchema.properties.limit.maximum : null,
  }
}

function renderReferenceIndex(reference) {
  const sections = ['core', 'collaboration', 'governance', 'all']
    .map((profile) => {
      const rows = reference.tools
        .filter((tool) => tool.baseProfile === profile)
        .map(
          (tool) =>
            `| [\`${tool.name}\`](/mcp/reference/${tool.name}/) | ${escapeMarkdownCell(tool.description)} | ${tool.scopes.required.map((scope) => `\`${scope}\``).join(', ')} | ${tool.security.classification} |`,
        )
        .join('\n')
      const label = profile === 'all' ? 'All-only curated tool' : `${profile[0].toUpperCase()}${profile.slice(1)} profile`
      return `## ${label}\n\n| Tool | Purpose | Required scope | Data classification |\n| --- | --- | --- | --- |\n${rows}`
    })
    .join('\n\n')
  return `---
title: MCP tool reference
description: Browse the exact input contract, API mapping, scopes, output behavior, safety classification, and failure modes for all 29 TeamGrid MCP tools.
owner: Developer Platform
reviewedAt: 2026-08-10
---

This reference is generated from the tool registry shipped in
\`@teamgrid/mcp-server@${reference.package.version}\` and joined with the pinned API v1 capability
contract. It contains ${reference.tools.length} read-only tools. Unknown input properties are
rejected by every tool schema.

## Profiles at a glance

| Selected profile | Advertised tools | Adds beyond \`core\` |
| --- | ---: | --- |
| \`core\` | ${reference.profiles.core.length} | Operational workspace, project, task, time-entry, list, tag, product, and product-group reads |
| \`collaboration\` | ${reference.profiles.collaboration.length} | Contacts, contact groups, call notes, and users |
| \`governance\` | ${reference.profiles.governance.length} | Custom-field definitions, services, and webhook configuration |
| \`all\` | ${reference.profiles.all.length} | Union of both broader profiles plus curated federated search |

Select the narrowest profile your workflow needs. A profile controls which tools are advertised;
the API credential scopes and resource grants still control which data each advertised tool can
read.

${sections}

## Shared result contract

Every successful value is returned twice: as MCP structured content and as the same serialized JSON
in a text content block. Results are capped at ${Math.round(reference.resultContract.maxSerializedBytes / 1024)} KiB. A larger result becomes
\`result_too_large\`; reduce a list page or narrow the filters. Upstream failures become
\`teamgrid_request_failed\` with developer secrets redacted.

List tools use opaque cursor pagination. Pass \`meta.page.nextCursor\` back as \`cursor\`; never
construct or decode a cursor. The federated search tool is bounded to 50 results and is not
cursor-paginated.

Continue with the [first MCP query](/mcp/first-query/), [configuration](/mcp/configuration/), or
[MCP troubleshooting](/mcp/troubleshooting/).
`
}

function renderToolPage(tool, reference) {
  const inputSchema = JSON.stringify(tool.inputSchema, null, 2)
  const availableProfiles = tool.availableIn.map((profile) => `\`${profile}\``).join(', ')
  const requiredScopes = tool.scopes.required.map((scope) => `\`${scope}\``).join(', ')
  const conditionalScopes = tool.scopes.conditional.length
    ? ` Conditional domain scopes: ${tool.scopes.conditional.map((scope) => `\`${scope}\``).join(', ')}; only the scopes for requested search types are applicable.`
    : ''
  const operations = tool.apiOperations
    .map(
      (operation) =>
        `- [\`${operation.operationId}\`](${operation.href}) — \`${operation.method} ${operation.path}\``,
    )
    .join('\n')
  const pagination = tool.output.pagination
    ? `This is a cursor-paginated tool. \`limit\` accepts 1–${tool.output.pagination.maxPageSize}. When \`meta.page.nextCursor\` is not null, pass that opaque value as \`cursor\` to request the next page. Do not construct, edit, or decode cursors.`
    : tool.output.searchLimit
      ? `This tool returns at most ${tool.output.searchLimit} matches and has no cursor. Narrow \`term\` or \`types\` instead of attempting to paginate.`
      : 'This tool returns a single API response envelope and is not paginated.'
  const redactions = tool.output.redactions.length
    ? `\n\nAdditional output boundary:\n\n${tool.output.redactions.map((item) => `- ${item}`).join('\n')}`
    : ''
  const errors = tool.typicalErrors
    .map((error) => `| ${escapeMarkdownCell(error.condition)} | ${escapeMarkdownCell(error.result)} |`)
    .join('\n')
  return `---
title: ${tool.name}
description: ${JSON.stringify(tool.description)}
owner: Developer Platform
reviewedAt: 2026-08-10
---

\`${tool.name}\` is a read-only, idempotent TeamGrid MCP tool. It is introduced by the
\`${tool.baseProfile}\` profile and is advertised in: ${availableProfiles}.

## Input schema

This is the exact JSON Schema advertised by \`@teamgrid/mcp-server@${reference.package.version}\`:

\`\`\`json
${inputSchema}
\`\`\`

The schema is strict: properties not shown above are rejected before TeamGrid receives a request.

## Scope and API operation

Required scope: ${requiredScopes}.${conditionalScopes}

${operations}

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Output and limits

${tool.output.format} ${pagination} The serialized result may not exceed
${Math.round(tool.output.maxSerializedBytes / 1024)} KiB.${redactions}

The linked API operation is the canonical reference for the response envelope and resource schema.
MCP does not add write fields, an ETag input, or a hidden authorization path.

## Security classification

**${tool.security.classification}:** ${tool.security.summary}

The server advertises MCP annotations \`readOnlyHint: true\`, \`idempotentHint: true\`,
\`destructiveHint: false\`, and \`openWorldHint: false\`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> ${tool.examplePrompt}

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
${errors}

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
`
}

async function writeOrCompare(path, content) {
  if (!checkOnly) {
    await writeFile(path, content)
    return
  }
  const existing = await readFile(path, 'utf8').catch(() => '')
  if (existing !== content) fail(`${path.replace(`${repositoryRoot}/`, '')} is stale; run node scripts/sync-mcp-reference.mjs.`)
}

const packages = JSON.parse(await readFile(packagesPath, 'utf8'))
const expectedCommit = packages.sourceCommit
const expectedVersion = packages.packages.mcpServer.version
git('cat-file', '-e', `${expectedCommit}^{commit}`)
const pinnedTree = git('rev-parse', `${expectedCommit}:${platformRepositoryPath}`)
const checkoutTree = git('rev-parse', `HEAD:${platformRepositoryPath}`)
if (pinnedTree !== checkoutTree) {
  fail(
    `the sibling MCP package tree does not match pinned developer-platform commit ${expectedCommit}. ` +
      'Check out that package revision before syncing.',
  )
}

const manifest = JSON.parse(await readFile(resolve(mcpPackageRoot, 'package.json'), 'utf8'))
if (manifest.version !== expectedVersion) {
  fail(`sibling package version ${manifest.version} does not match pinned version ${expectedVersion}.`)
}

const sourceText = git('show', `${expectedCommit}:${platformRepositoryPath}/src/server.ts`)
const maxResultMatch = sourceText.match(/const maxToolResultBytes = (\d+) \* (\d+)/)
if (!maxResultMatch) fail('could not derive maxToolResultBytes from the pinned MCP source.')
const maxToolResultBytes = Number(maxResultMatch[1]) * Number(maxResultMatch[2])

const extractor = `
import { createTeamGridMcpServer } from './dist/server.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
const fakeClient = new Proxy({}, { get: () => new Proxy({}, { get: () => async () => ({ data: [], meta: {} }) }) })
const result = {}
for (const profile of ['core', 'collaboration', 'governance', 'all']) {
  const server = createTeamGridMcpServer(fakeClient, { toolProfile: profile })
  const client = new Client({ name: 'teamgrid-docs-extractor', version: '1.0.0' })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  result[profile] = (await client.listTools()).tools
  await client.close()
  await server.close()
}
process.stdout.write(JSON.stringify(result))
`
const extracted = spawnSync(process.execPath, ['--input-type=module'], {
  cwd: mcpPackageRoot,
  encoding: 'utf8',
  input: extractor,
  maxBuffer: 10 * 1024 * 1024,
})
if (extracted.status !== 0) {
  fail(
    'could not load the built sibling MCP server. Build developer-platform first.\n' +
      String(extracted.stderr || extracted.stdout).trim(),
  )
}
const extractedProfiles = JSON.parse(extracted.stdout)
const profiles = Object.fromEntries(
  Object.entries(extractedProfiles).map(([profile, tools]) => [
    profile,
    tools.map((tool) => tool.name).sort(),
  ]),
)
if (profiles.all.length !== 29) fail(`expected 29 tools in 'all', found ${profiles.all.length}.`)

const capabilities = JSON.parse(await readFile(capabilitiesPath, 'utf8'))
const openApi = JSON.parse(await readFile(openApiPath, 'utf8'))
const mappings = new Map()
for (const policy of capabilities.operationPolicy || []) {
  if (!policy.mcp?.tool) continue
  if (mappings.has(policy.mcp.tool)) fail(`duplicate API mapping for '${policy.mcp.tool}'.`)
  mappings.set(policy.mcp.tool, policy)
}

const allToolsByName = new Map(extractedProfiles.all.map((tool) => [tool.name, tool]))
const tools = [...profiles.all].map((name) => {
  const advertised = allToolsByName.get(name)
  const mapping = mappings.get(name)
  if (!advertised) fail(`tool '${name}' is missing from the extracted all-profile registry.`)
  if (!mapping) fail(`tool '${name}' is missing from developer-capabilities.json.`)
  const openApiMatch = findOpenApiOperation(openApi, mapping.operationId)
  const requiredScopes = [
    ...(openApiMatch.operation['x-teamgrid-required-scopes'] || []),
    ...(mapping.additionalScopes || []),
  ]
  const conditionalScopes = openApiMatch.operation['x-teamgrid-conditional-scopes'] || []
  const tool = {
    annotations: advertised.annotations,
    apiOperations: [
      {
        href: operationHref(mapping.operationId),
        method: mapping.method,
        operationId: mapping.operationId,
        path: mapping.path,
      },
    ],
    availableIn: Object.keys(profiles).filter((profile) => profiles[profile].includes(name)),
    baseProfile: baseProfile(name, profiles),
    description: advertised.description,
    inputSchema: advertised.inputSchema,
    name,
    scopes: { conditional: conditionalScopes, required: [...new Set(requiredScopes)] },
    security: securityClassification(name),
  }
  tool.output = outputContract(tool, maxToolResultBytes)
  tool.examplePrompt = examplePrompt(tool)
  tool.typicalErrors = typicalErrors(tool)
  return tool
})

if (mappings.size !== tools.length) {
  const missing = [...mappings.keys()].filter((name) => !allToolsByName.has(name))
  fail(`capability mapping and runtime registry differ${missing.length ? `: ${missing.join(', ')}` : ''}.`)
}

const reference = {
  schemaVersion: 1,
  package: {
    name: manifest.name,
    sourceCommit: expectedCommit,
    sourceRepository: packages.sourceRepository,
    version: expectedVersion,
  },
  profiles,
  resultContract: {
    errorCodes: ['result_too_large', 'teamgrid_request_failed'],
    maxSerializedBytes: maxToolResultBytes,
    transport: 'MCP structuredContent plus equivalent serialized JSON text content',
  },
  tools,
}

if (!checkOnly) await mkdir(outputDirectory, { recursive: true })
await writeOrCompare(referencePath, asJson(reference))
await writeOrCompare(resolve(outputDirectory, 'index.md'), renderReferenceIndex(reference))
for (const tool of reference.tools) {
  await writeOrCompare(resolve(outputDirectory, `${tool.name}.md`), renderToolPage(tool, reference))
}

console.log(
  `${checkOnly ? 'Verified' : 'Synchronized'} ${reference.tools.length} MCP tool pages from ${manifest.name}@${expectedVersion}.`,
)
