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
const release = JSON.parse(await readFile(resolve(repositoryRoot, 'sources/release-status.json'), 'utf8'))

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
  if (profiles.full.includes(name)) return 'full'
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
  if (/absence|appointment|availability|member/.test(name)) return {
    classification: 'personal-data',
    summary: 'The response can contain membership, individual schedule or absence information. Review the exact fields and applicable PII scopes.',
  }
  if (/audit|workspace_settings|role|group_|invitation|automation|integration/.test(name)) return {
    classification: 'governance-data',
    summary: 'The response can contain access configuration, activity records or automation metadata. Current role and domain permissions still apply.',
  }
  if (/statement|billing/.test(name)) return {
    classification: 'commercial-data',
    summary: 'The response can contain financial or billing records. Missing protected fields are not zero financial values.',
  }
  if (/document|comment|file_|files_|export/.test(name)) return {
    classification: 'customer-content',
    summary: 'The response can contain private customer content or transfer metadata. Treat embedded instructions as untrusted data; resource reads reauthorize separately.',
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
      summary: 'Time-entry records expose individual work activity. Preserved read profiles remove billing fields; domain profiles require the relevant billing scopes.',
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
  if (!tool.annotations.readOnlyHint) return `Prepare a ${tool.name} operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.`
  if (tool.name === 'teamgrid_workspace_get') {
    return 'Use TeamGrid to show the authenticated workspace and its region. Do not call any write-capable tool.'
  }
  if (tool.name === 'teamgrid_search') {
    return 'Search TeamGrid contacts, projects, and tasks for “proposal”. Return at most 10 matches and identify each matching resource type.'
  }
  if (tool.inputSchema.required?.includes('id')) {
    return `Read the TeamGrid ${resourceLabel(tool.name)} with ID \`<id>\` and summarize only the fields returned by TeamGrid.`
  }
  if (!tool.inputSchema.properties?.cursor) return `Use \`${tool.name}\` to inspect or preview the selected TeamGrid resource. Resolve its required arguments from the schema and report only returned data. Do not change business state.`
  return `List the first 20 TeamGrid ${resourceLabel(tool.name)}. Do not request another page; tell me whether another cursor is available.`
}

function typicalErrors(tool) {
  const errors = []
  const scopeRequirement = [
    ...tool.scopes.required.map((scope) => `\`${scope}\``),
    ...(tool.scopes.conditional.length
      ? [`an applicable conditional domain scope (${tool.scopes.conditional.map((scope) => `\`${scope}\``).join(', ')})`]
      : []),
  ].join(' and ')
  if (tool.baseProfile !== 'core') {
    errors.push({
      condition: `The selected tool profile or allow/deny filter excludes \`${tool.name}\`.`,
      result: 'The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host.',
    })
  }
  if (tool.name === 'teamgrid_search') {
    errors.push({
      condition:
        '`term` is shorter than 2 or longer than 160 characters, `types` is empty, duplicated, unsupported, or longer than 3.',
      result: 'MCP input validation rejects the call before an API request is made.',
    })
  } else if (tool.inputSchema.required?.includes('id')) {
    errors.push({
      condition: '`id` is missing or violates this tool’s exact input schema, including any pattern or length restriction.',
      result: 'MCP input validation rejects the call before an API request is made.',
    })
  } else {
    errors.push({
      condition: 'An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range.',
      result: 'MCP input validation rejects the call before an API request is made.',
    })
  }
  errors.push(
    {
      condition: `The credential lacks ${scopeRequirement} or cannot access the requested resource.`,
      result:
        'The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata.',
    },
    {
      condition: tool.annotations.readOnlyHint ? 'A read exceeds the 256 KiB tool result limit.' : 'The connection ends while awaiting the write result.',
      result: tool.annotations.readOnlyHint && tool.output?.pagination
        ? 'The tool returns `result_too_large`. Request a smaller page or narrower filters.'
        : !tool.annotations.readOnlyHint ? 'Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write.' : 'Use a bounded section, smaller supported read, private resource or authorized App/CLI transfer.',
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
    redactions.push('`purchasePrice` is removed in the preserved read profiles; domain profiles use current finance permissions.')
  }
  if (tool.name === 'teamgrid_webhook_get' || tool.name === 'teamgrid_webhooks_list') {
    redactions.push('Webhook read responses do not contain the reveal-once signing secret.')
  }
  if (tool.annotations.readOnlyHint && tool.name.includes('custom_field_definition')) {
    redactions.push('The tool exposes canonical definitions, not legacy defaults or per-resource values.')
  }
  return {
    format: tool.annotations.readOnlyHint
      ? 'The bounded API result is returned as MCP structured content and equivalent JSON text.'
      : 'A compact mutation receipt includes target and revision when available; outcome metadata distinguishes accepted, complete, partial and uncertain results.',
    kind: !tool.annotations.readOnlyHint ? 'mutation-receipt' : isSearch ? 'bounded-search' : hasCursor ? 'cursor-page' : 'single-resource',
    maxSerializedBytes: maxToolResultBytes,
    pagination: hasCursor
      ? {
          input: 'Pass the opaque `meta.page.nextCursor` value as `cursor`.',
          maxPageSize: tool.inputSchema.properties.limit?.maximum || 100,
          nextCursor: 'meta.page.nextCursor',
        }
      : null,
    redactions,
    searchLimit: isSearch ? (tool.inputSchema.properties.limit?.maximum || 50) : null,
  }
}

function renderReferenceIndex(reference) {
  const sections = [...new Set(reference.tools.map(tool => tool.contract.domain))]
    .map((profile) => {
      const rows = reference.tools
        .filter((tool) => tool.contract.domain === profile)
        .map(
          (tool) =>
            `| [\`${tool.name}\`](/mcp/reference/${tool.name}/) | ${tool.annotations.readOnlyHint ? 'Read' : 'Write'} | ${escapeMarkdownCell(tool.description)} | ${tool.scopes.required.map((scope) => `\`${scope}\``).join(', ')} | ${tool.security.classification} |`,
        )
        .join('\n')
      const domain = profile.replace('-write', '').replaceAll('-', ' ')
      const label = profile === 'context' ? 'Workspace context' : `${domain[0].toUpperCase()}${domain.slice(1)} tools`
      return `## ${label}\n\n| Tool | Access | Purpose | Required scopes (all) | Data classification |\n| --- | --- | --- | --- | --- |\n${rows}`
    })
    .join('\n\n')
  return `---
title: MCP tool reference
description: Browse the exact input contract, API mapping, scopes, output behavior, safety classification, and failure modes for the 208 TeamGrid MCP tools.
owner: Developer Platform
reviewedAt: 2026-10-02
---

${release.status === 'published' ? `**Stable release ${release.version}.**` : `**Unpublished candidate ${release.version}.** Public packages remain ${release.publishedVersion}.`}
This reference is generated from the exact tool registry in
\`@teamgrid/mcp-server@${reference.package.version}\` and joined with the pinned API v1 capability
contract. It contains ${reference.tools.length} business tools with explicit safety annotations. Unknown input properties are
rejected by every tool schema.

Use [ChatGPT setup](/mcp/chatgpt/), [safe writes](/mcp/write-workflow/) and
[resources and protocol support](/mcp/resources-and-protocol/) for complete workflows.
The catalog contains ${reference.tools.filter(tool => tool.annotations.readOnlyHint).length} reads
and ${reference.tools.filter(tool => !tool.annotations.readOnlyHint).length} writes. Browse tools by business domain below; a domain heading is a catalog grouping, while \`Available in\` on each tool page is its exact profile membership.

## Profiles at a glance

| Selected profile | Advertised tools | Adds beyond \`core\` |
| --- | ---: | --- |
| \`core\` | ${reference.profiles.core.length} | Operational workspace, project, task, time-entry, list, tag, product, and product-group reads |
| \`collaboration\` | ${reference.profiles.collaboration.length} | Contacts, contact groups, call notes, and users |
| \`governance\` | ${reference.profiles.governance.length} | Custom-field definitions, services, and webhook configuration |
| \`all\` | ${reference.profiles.all.length} | Preserved read-only union |
| \`full\` | ${reference.profiles.full.length} | Complete inventory; explicit write opt-in |

| Workflow/domain profile | Total | Reads | Writes |
| --- | ---: | ---: | ---: |
${Object.entries(reference.profiles).filter(([name]) => !['core', 'collaboration', 'governance', 'all', 'full'].includes(name)).map(([name, tools]) => `| \`${name}\` | ${tools.length} | ${tools.filter(tool => reference.tools.find(entry => entry.name === tool).annotations.readOnlyHint).length} | ${tools.filter(tool => !reference.tools.find(entry => entry.name === tool).annotations.readOnlyHint).length} |`).join('\n')}

Select the narrowest profile your workflow needs. A profile controls which tools are advertised;
the API credential scopes and resource grants still control which data each advertised tool can
read or change. Hosted Production advertises \`full\`; these selectors configure local stdio.

${sections}

## Shared result contract

Every successful value is returned twice: as MCP structured content and as the same serialized JSON
in a text content block. Results are capped at ${Math.round(reference.resultContract.maxSerializedBytes / 1024)} KiB. Large reads use bounded pages or document sections. Mutations use small receipts;
accepted, partial and uncertain outcomes must not be mistaken for completed writes. API and SDK failures preserve safe machine-readable codes and available status, request ID, and
retry metadata, with developer secrets redacted. Unknown failures use \`teamgrid_request_failed\`.

List tools use opaque cursor pagination. Pass \`meta.page.nextCursor\` back as \`cursor\`; never
construct or decode a cursor. The federated search tool is bounded to 50 results and is not
cursor-paginated.

Continue with the [first MCP query](/mcp/first-query/), [configuration](/mcp/configuration/), or
[MCP troubleshooting](/mcp/troubleshooting/).
`
}

function renderToolPage(tool, reference) {
  const inputSchema = JSON.stringify(tool.inputSchema, null, 2)
  const argumentRows = Object.entries(tool.inputSchema.properties || {}).map(([name, schema]) =>
    `| \`${name}\` | ${tool.inputSchema.required?.includes(name) ? 'Required' : 'Optional'} | ${escapeMarkdownCell(schema.type || (schema.anyOf ? 'See schema' : 'See schema'))} | ${escapeMarkdownCell(schema.description || 'See the exact schema below for values and constraints.')} |`,
  ).join('\n')
  const preconditions = tool.annotations.readOnlyHint ? 'This tool does not change business state.' :
    `Concurrency: **${tool.contract.concurrency}**. ${tool.contract.coreCas ? 'The core CAS protocol must be enforced by the server. ' : ''}${tool.inputSchema.properties?.expectedRevision ? 'Pass the exact quoted \`meta.etag\` from a fresh read as \`expectedRevision\`.' : tool.contract.concurrency === 'per-item revision' ? 'Supply each item’s reviewed revision; inspect every item result.' : 'No top-level revision precondition is declared; do not assume conflict protection.'} ${tool.inputSchema.properties?.idempotencyKey ? 'Reuse \`idempotencyKey\` only for the same creation intent and exact payload.' : 'No top-level idempotency key is declared; a lost response must be inspected before replay.'}`
  const variants = Object.entries(tool.profileInputSchemas).map(([profile, schema]) => `### Input in ${profile}\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``).join('\n\n')
  const availableProfiles = tool.availableIn.map((profile) => `\`${profile}\``).join(', ')
  const requiredScopes = tool.scopes.required.map((scope) => `\`${scope}\``).join(', ')
  const conditionalScopes = tool.scopes.conditional.length
    ? ` Conditional domain scopes: ${tool.scopes.conditional.map((scope) => `\`${scope}\``).join(', ')}; the applicable scopes depend on the request and the stored target. See the linked API operation and [scope rules](/mcp/tools-and-security/#field-level-and-scope-boundaries).`
    : ''
  const optionalScopes = tool.scopes.optional.length ? ` Optional field scopes: ${tool.scopes.optional.map((scope) => `\`${scope}\``).join(', ')}; required when requesting the corresponding protected fields.` : ''
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
description: ${JSON.stringify(`Input schema, permissions, API mapping and ${tool.annotations.readOnlyHint ? 'read' : 'write'} behavior for ${tool.name}.`)}
owner: Developer Platform
reviewedAt: 2026-10-02
---

\`${tool.name}\` is a ${tool.annotations.readOnlyHint ? 'read-only' : 'write-capable'} TeamGrid MCP tool. It is advertised in: ${availableProfiles}.

${tool.description}

## Arguments at a glance

The table describes \`full\`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
${argumentRows || '| — | — | — | Use an empty object: `{}`. |'}

## Input schema

${release.status === 'published' ? '**Stable release:**' : '**Unpublished candidate:**'} this is the exact JSON Schema advertised by \`@teamgrid/mcp-server@${reference.package.version}\`:

\`\`\`json
${inputSchema}
\`\`\`

The schema above is for \`full\`. Properties not in the selected profile schema are rejected.

${variants}

## Scope and API operation

Required scopes (all): ${requiredScopes}.${conditionalScopes}${optionalScopes}

${operations}

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## ${tool.annotations.readOnlyHint ? 'Read behavior' : 'Write preconditions'}

${preconditions}

## Output and limits

${tool.output.format} ${pagination} The serialized result may not exceed
${Math.round(tool.output.maxSerializedBytes / 1024)} KiB.${redactions}

Download the [exact MCP input and output contract](/mcp/contracts/${tool.name}.json), including profile variants, scopes and safety annotations. Its \`outputSchema\` describes the advertised MCP envelope and local \`$defs\`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**${tool.security.classification}:** ${tool.security.summary}

The exact safety annotations are \`${JSON.stringify(tool.annotations)}\`. The host and model can still retain tool
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
import { Client, InMemoryTransport } from '@modelcontextprotocol/client'
import { toolsByProfile } from './dist/toolProfiles.js'
import { domainCatalog } from './dist/domainTools.js'
import { requiredToolScopes, toolScopeChallenge } from './dist/scopeRequirements.js'
const fakeClient = new Proxy({}, { get: () => new Proxy({}, { get: () => async () => ({ data: [], meta: {} }) }) })
const result = {}
for (const profile of Object.keys(toolsByProfile)) {
  const server = createTeamGridMcpServer(fakeClient, { toolProfile: profile })
  const client = new Client({ name: 'teamgrid-docs-extractor', version: '1.0.0' })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  result[profile] = []
  let cursor
  do {
    const page = await client.listTools(cursor ? { cursor } : undefined)
    result[profile].push(...page.tools)
    cursor = page.nextCursor
  } while (cursor)
  await client.close()
  await server.close()
}
const scopes = {}
const conditional = {}
const scopeExamples = [
  { data: { purchasePrice: 0 } }, { type: 'budget' }, { includePii: true },
  ...['task', 'project', 'contact'].flatMap(type => [{ targetType: type }, { data: { target: { type } } }]),
  { data: { types: ['tasks', 'projects', 'contacts'] } },
  ...['auditEvents', 'contacts', 'projects', 'tasks', 'taskRecurrences', 'timeEntries'].map(resourceType => ({ data: { resourceType } })),
]
for (const tool of result.full) {
  const challenge = await toolScopeChallenge(tool.name)({ request: { params: { arguments: {} } }, authInfo: { scopes: [] } })
  scopes[tool.name] = challenge?.scopes || []
  conditional[tool.name] = [...new Set(scopeExamples.flatMap(input => requiredToolScopes(tool.name, input)).filter(scope => !scopes[tool.name].includes(scope)))].sort()
}
const contracts = Object.fromEntries(Object.entries(domainCatalog).map(([name, tool]) => [name, { domain: tool.domain, concurrency: tool.concurrency, idempotency: tool.idempotency, coreCas: tool.coreCas }]))
process.stdout.write(JSON.stringify({ profiles: result, scopes, conditional, contracts }))
`
const extracted = spawnSync(process.execPath, ['--input-type=module'], {
  cwd: mcpPackageRoot,
  encoding: 'utf8',
  input: extractor,
  maxBuffer: 32 * 1024 * 1024,
})
if (extracted.status !== 0) {
  fail(
    'could not load the built sibling MCP server. Build developer-platform first.\n' +
      String(extracted.stderr || extracted.stdout).trim(),
  )
}
const runtime = JSON.parse(extracted.stdout)
const extractedProfiles = runtime.profiles
const profiles = Object.fromEntries(
  Object.entries(extractedProfiles).map(([profile, tools]) => [
    profile,
    tools.map((tool) => tool.name).sort(),
  ]),
)
if (profiles.all.length !== 36) fail(`expected 36 tools in 'all', found ${profiles.all.length}.`)

const capabilities = JSON.parse(await readFile(capabilitiesPath, 'utf8'))
const openApi = JSON.parse(await readFile(openApiPath, 'utf8'))
const mappings = new Map()
for (const policy of capabilities.operationPolicy || []) {
  if (!policy.mcp?.tool) continue
  if (mappings.has(policy.mcp.tool)) fail(`duplicate API mapping for '${policy.mcp.tool}'.`)
  mappings.set(policy.mcp.tool, policy)
}

const allToolsByName = new Map(extractedProfiles.full.map((tool) => [tool.name, tool]))
const tools = [...profiles.full].map((name) => {
  const advertised = allToolsByName.get(name)
  const mapping = mappings.get(name)
  if (!advertised) fail(`tool '${name}' is missing from the extracted full-profile registry.`)
  if (!mapping) fail(`tool '${name}' is missing from developer-capabilities.json.`)
  const openApiMatch = findOpenApiOperation(openApi, mapping.operationId)
  const requiredScopes = [
    ...(openApiMatch.operation['x-teamgrid-required-scopes'] || []),
    ...(mapping.additionalScopes || []),
    ...(runtime.scopes[name] || []),
  ]
  const optionalScopes = openApiMatch.operation['x-teamgrid-optional-scopes'] || []
  const conditionalScopes = [...new Set([...(openApiMatch.operation['x-teamgrid-conditional-scopes'] || []), ...(runtime.conditional[name] || []).filter(scope => !optionalScopes.includes(scope))])]
  const tool = {
    annotations: advertised.annotations,
    contract: runtime.contracts[name],
    outputSchema: advertised.outputSchema,
    profileOutputSchemas: Object.fromEntries(Object.entries(extractedProfiles).flatMap(([profile, tools]) => {
      const variant = tools.find(tool => tool.name === name)
      return variant && JSON.stringify(variant.outputSchema) !== JSON.stringify(advertised.outputSchema)
        ? [[profile, variant.outputSchema]] : []
    })),
    exposure: mapping.mcp.exposure,
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
    profileInputSchemas: Object.fromEntries(Object.entries(extractedProfiles).flatMap(([profile, tools]) => {
      const variant = tools.find(tool => tool.name === name)
      return variant && JSON.stringify(variant.inputSchema) !== JSON.stringify(advertised.inputSchema)
        ? [[profile, variant.inputSchema]] : []
    })),
    name,
    scopes: { optional: optionalScopes, conditional: conditionalScopes, required: [...new Set(requiredScopes)] },
    security: securityClassification(name),
  }
  if (!advertised.annotations.readOnlyHint) tool.security = { classification: 'workspace-mutation', summary: 'This changes workspace state and may trigger business or external effects. Use its exact scope, revision and idempotency contract; profile selection grants no authority.' }
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
    errorCodes: ['result_too_large', 'teamgrid_request_failed', 'teamgrid_api_error', 'teamgrid_client_error'],
    upstreamErrorCodes: 'Safe API and SDK machine-readable error codes are preserved; errorCodes lists local and fallback codes only.',
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
  const contractDirectory = resolve(repositoryRoot, 'public/mcp/contracts')
  if (!checkOnly) await mkdir(contractDirectory, { recursive: true })
  await writeOrCompare(resolve(contractDirectory, `${tool.name}.json`), asJson({ package: reference.package, ...tool }))
}

console.log(
  `${checkOnly ? 'Verified' : 'Synchronized'} ${reference.tools.length} MCP tool pages from ${manifest.name}@${expectedVersion}.`,
)
