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
if (tools.length !== 29 || uniqueToolNames.size !== 29) {
  failures.push(`Expected 29 unique MCP tools, found ${tools.length}/${uniqueToolNames.size}.`)
}

for (const [profile, expected] of Object.entries({ core: 15, collaboration: 22, governance: 21, all: 29 })) {
  const names = reference.profiles?.[profile] || []
  if (names.length !== expected || new Set(names).size !== expected) {
    failures.push(`MCP ${profile} profile must contain ${expected} unique tools.`)
  }
  for (const name of names) {
    if (!uniqueToolNames.has(name)) failures.push(`MCP ${profile} profile contains unknown tool ${name}.`)
  }
}
if (JSON.stringify([...reference.profiles.all].sort()) !== JSON.stringify([...toolNames].sort())) {
  failures.push('MCP all profile does not contain the exact tool registry.')
}

const policies = capabilities.operationPolicy.filter((operation) => operation.mcp?.exposure === 'read')
if (policies.length !== 29) failures.push(`Expected 29 MCP-exposed policies, found ${policies.length}.`)
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
if (pages.length !== 30 || !pages.includes('index.md')) {
  failures.push(`Expected MCP index plus 29 tool pages, found ${pages.length} Markdown pages.`)
}
for (const tool of tools) {
  if (tool.inputSchema?.additionalProperties !== false) {
    failures.push(`${tool.name} does not preserve a strict input schema.`)
  }
  if (
    tool.annotations?.readOnlyHint !== true
    || tool.annotations?.idempotentHint !== true
    || tool.annotations?.destructiveHint !== false
    || tool.annotations?.openWorldHint !== false
  ) {
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

console.log('MCP reference integrity passed: 29 tools, strict schemas, exact profiles, API mappings, and 30 generated pages.')
