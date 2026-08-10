import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(
  await readFile(path.join(root, 'sources', 'cli-reference.json'), 'utf8'),
)
const packages = JSON.parse(await readFile(path.join(root, 'sources', 'packages.json'), 'utf8'))
const capabilities = JSON.parse(
  await readFile(path.join(root, 'public', 'openapi', 'developer-capabilities.json'), 'utf8'),
)
const openapi = JSON.parse(
  await readFile(path.join(root, 'public', 'openapi', 'v1.json'), 'utf8'),
)
const failures = []

if (manifest.schemaVersion !== 1) failures.push('sources/cli-reference.json has an unsupported schema.')
if (manifest.package !== '@teamgrid/cli') failures.push('CLI reference package name is not @teamgrid/cli.')
if (
  manifest.version !== packages.version
  || manifest.sourceCommit !== packages.sourceCommit
  || manifest.version !== packages.packages?.cli?.version
) {
  failures.push('CLI reference package version or source commit differs from sources/packages.json.')
}
if (manifest.commanderVersion !== '15.0.0') {
  failures.push(`Unexpected pinned Commander version: ${manifest.commanderVersion}`)
}

const commands = manifest.groups.flatMap((group) => group.commands)
const commandPaths = new Set(commands.map((command) => command.path))
if (manifest.groupCount !== manifest.groups.length) {
  failures.push('CLI group count does not match the checked-in groups.')
}
if (
  manifest.executableCommandCount !== commands.length
  || commandPaths.size !== commands.length
) {
  failures.push('CLI executable command count is inconsistent or contains duplicate paths.')
}
if (
  manifest.apiBackedExecutableCommandCount
  !== commands.filter((command) => command.apiOperations.length > 0).length
) {
  failures.push('API-backed executable command count is inconsistent.')
}
if (
  manifest.argumentDefinitionCount
    !== commands.reduce((total, command) => total + command.arguments.length, 0)
  || manifest.commandOptionDefinitionCount
    !== commands.reduce((total, command) => total + command.options.length, 0)
  || manifest.confirmationCommandCount
    !== commands.filter((command) => command.requiresConfirmation).length
) {
  failures.push('CLI argument, option, or confirmation counts are inconsistent.')
}
if (
  JSON.stringify(manifest.localCommands)
  !== JSON.stringify(commands.filter((command) => !command.apiOperations.length).map((command) => command.path))
) {
  failures.push('Local CLI command inventory is inconsistent.')
}

const openapiOperations = new Map()
for (const [apiPath, methods] of Object.entries(openapi.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (!operation?.operationId) continue
    openapiOperations.set(operation.operationId, {
      method: method.toUpperCase(),
      path: apiPath,
      summary: operation.summary,
    })
  }
}

const documentedOperations = new Map()
for (const command of commands) {
  if (!command.fullPath.startsWith('teamgrid ') || !command.syntax.startsWith(command.fullPath)) {
    failures.push(`Invalid command syntax metadata: ${command.path}`)
  }
  if (!Array.isArray(command.options) || !Array.isArray(command.arguments)) {
    failures.push(`Missing argument or option inventory: ${command.path}`)
  }
  for (const operation of command.apiOperations) {
    const current = openapiOperations.get(operation.operationId)
    if (
      !current
      || current.method !== operation.method
      || current.path !== operation.path
      || current.summary !== operation.summary
    ) {
      failures.push(`Stale OpenAPI mapping for ${command.path}: ${operation.operationId}`)
    }
    const entries = documentedOperations.get(operation.operationId) || []
    entries.push({ command, operation })
    documentedOperations.set(operation.operationId, entries)
  }
}

for (const policy of capabilities.operationPolicy) {
  const entries = documentedOperations.get(policy.operationId) || []
  const canonical = entries.find(({ command }) => command.path === policy.cli)
  if (!canonical) {
    failures.push(`Missing canonical CLI documentation for ${policy.operationId}: ${policy.cli}`)
    continue
  }
  if (canonical.operation.scope !== policy.scope) {
    failures.push(`Stale scope for ${policy.cli}: ${policy.operationId}`)
  }
}
if (
  manifest.apiOperationCount !== capabilities.operationPolicy.length
  || documentedOperations.size !== capabilities.operationPolicy.length
) {
  failures.push('CLI API-operation coverage count is inconsistent.')
}

const generatedPagePaths = Object.keys(manifest.generatedPages || {})
if (generatedPagePaths.length !== manifest.groups.length + 1) {
  failures.push('Generated CLI page inventory must contain one index and one page per group.')
}
for (const [relativePath, expectedHash] of Object.entries(manifest.generatedPages || {})) {
  try {
    const content = await readFile(path.join(root, relativePath), 'utf8')
    const actualHash = createHash('sha256').update(content).digest('hex')
    if (actualHash !== expectedHash) failures.push(`Generated CLI page drift: ${relativePath}`)
  } catch {
    failures.push(`Missing generated CLI page: ${relativePath}`)
  }
}

const referenceRoot = path.join(root, 'src', 'content', 'docs', 'cli', 'reference')
const expectedPageNames = new Set(generatedPagePaths.map((file) => path.basename(file)))
for (const page of (await readdir(referenceRoot)).filter((name) => name.endsWith('.md'))) {
  if (!expectedPageNames.has(page)) failures.push(`Stale generated CLI page: ${page}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(
  `CLI reference integrity passed: ${manifest.executableCommandCount} commands, `
    + `${manifest.apiOperationCount} API operations, ${generatedPagePaths.length} generated pages.`,
)
