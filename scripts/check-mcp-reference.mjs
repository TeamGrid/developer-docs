import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const [packages, capabilities, reference] = await Promise.all([
  readFile(path.join(root, 'sources', 'packages.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'public', 'openapi', 'developer-capabilities.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'sources', 'mcp-reference.json'), 'utf8').then(JSON.parse),
])
const failures = []

if (reference.schemaVersion !== 1) failures.push('MCP reference schemaVersion must be 1.')
if (reference.package?.name !== '@teamgrid/mcp-server') failures.push('MCP package name is invalid.')
if (reference.package?.version !== packages.packages?.mcpServer?.version) {
  failures.push('MCP reference version does not match sources/packages.json.')
}
if (reference.package?.sourceCommit !== packages.sourceCommit) {
  failures.push('MCP reference commit does not match sources/packages.json.')
}

const tools = reference.tools || []
const toolNames = tools.map((tool) => tool.name)
const uniqueToolNames = new Set(toolNames)
if (tools.length !== 208 || uniqueToolNames.size !== 208) {
  failures.push(`Expected 208 unique MCP tools, found ${tools.length}/${uniqueToolNames.size}.`)
}

for (const [profile, expected] of Object.entries({ core: 22, collaboration: 29, governance: 28, all: 36, full: 208 })) {
  const names = reference.profiles?.[profile] || []
  if (names.length !== expected || new Set(names).size !== expected) {
    failures.push(`MCP ${profile} profile must contain ${expected} unique tools.`)
  }
  for (const name of names) {
    if (!uniqueToolNames.has(name)) failures.push(`MCP ${profile} profile contains unknown tool ${name}.`)
  }
}
if (JSON.stringify([...reference.profiles.full].sort()) !== JSON.stringify([...toolNames].sort())) {
  failures.push('MCP full profile does not contain the exact tool registry.')
}

// Check the onboarding prose too: internally consistent generated references do not
// catch stale tool counts or claims about profiles that customers cannot enable.
const mcpGuide = async (name) => readFile(
  path.join(root, 'src', 'content', 'docs', 'mcp', `${name}.md`), 'utf8',
)
const [firstQuery, troubleshooting, configuration] = await Promise.all([
  mcpGuide('first-query'), mcpGuide('troubleshooting'), mcpGuide('configuration'),
])
if (!firstQuery.includes(`${reference.profiles.core.length} read-only tools`)) {
  failures.push('MCP first-query tool count differs from the registered core profile.')
}
for (const [profile, names] of Object.entries(reference.profiles).filter(([name]) => ['core', 'collaboration', 'governance', 'all'].includes(name))) {
  const marker = profile === 'core' ? `\`${profile}\` has ${names.length}` : `\`${profile}\` ${names.length}`
  if (!troubleshooting.includes(marker)) {
    failures.push(`MCP troubleshooting has a stale ${profile} tool count.`)
  }
}
if (!configuration.includes('unpublished candidate')) {
  failures.push('MCP configuration must identify the unpublished candidate.')
}

const policies = capabilities.operationPolicy.filter((operation) => ['read', 'gated-write'].includes(operation.mcp?.exposure))
if (policies.length !== 208) failures.push(`Expected 208 MCP-exposed policies, found ${policies.length}.`)
const toolsByName = new Map(tools.map((tool) => [tool.name, tool]))
for (const policy of policies) {
  const tool = toolsByName.get(policy.mcp.tool)
  if (!tool) {
    failures.push(`${policy.operationId} maps to missing MCP tool ${policy.mcp.tool}.`)
    continue
  }
  if (!tool.apiOperations?.some((operation) => operation.operationId === policy.operationId)) {
    failures.push(`${tool.name} is missing API operation ${policy.operationId}.`)
  }
  if (policy.scope && !tool.scopes?.required?.includes(policy.scope)) {
    failures.push(`${tool.name} is missing required scope ${policy.scope}.`)
  }
}

const referenceDirectory = path.join(root, 'src', 'content', 'docs', 'mcp', 'reference')
const pages = (await readdir(referenceDirectory)).filter((file) => file.endsWith('.md')).sort()
if (pages.length !== 209 || !pages.includes('index.md')) {
  failures.push(`Expected MCP index plus 208 tool pages, found ${pages.length} Markdown pages.`)
}
for (const tool of tools) {
  if (tool.inputSchema?.additionalProperties !== false) {
    failures.push(`${tool.name} does not preserve a strict input schema.`)
  }
  const readOnly = tool.exposure === 'read'
  if (tool.annotations?.readOnlyHint !== readOnly
    || typeof tool.annotations?.idempotentHint !== 'boolean'
    || typeof tool.annotations?.destructiveHint !== 'boolean'
    || typeof tool.annotations?.openWorldHint !== 'boolean') {
    failures.push(`${tool.name} has stale MCP safety annotations.`)
  }
  if (tool.output?.maxSerializedBytes !== reference.resultContract?.maxSerializedBytes) {
    failures.push(`${tool.name} has a stale result-size limit.`)
  }
  const file = path.join(referenceDirectory, `${tool.name}.md`)
  let content = ''
  try {
    content = await readFile(file, 'utf8')
  } catch {
    failures.push(`Missing generated MCP page for ${tool.name}.`)
    continue
  }
  for (const marker of [
    `title: ${tool.name}`,
    '## Input schema',
    '## Scope and API operation',
    '## Output and limits',
    '## Security classification',
    '## Example prompt',
    '## Common failures',
  ]) {
    if (!content.includes(marker)) failures.push(`${tool.name} page is missing marker: ${marker}`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('MCP reference integrity passed: 208 tools, strict schemas, exact profiles, API mappings, and 209 generated pages.')
