import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')
const checkOnly = process.argv.includes('--check')

function argumentValue(flag) {
  const match = flag.match(/[<[ ]([^>\]]+)[>\]]/)
  if (!match) return null
  const placeholder = match[1]
  if (placeholder.includes('json|@file|-')) return '@request.json'
  if (placeholder.includes('revision')) return 'REVISION'
  if (placeholder === 'etag') return 'ETAG'
  if (placeholder.includes('ids')) return 'ID'
  return placeholder
    .replace(/\.\.\.$/, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
}

function shellArgument(argument) {
  if (argument.choices?.length) return String(argument.choices[0])
  return argument.name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
}

function markdownCell(value) {
  return String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function code(value) {
  return `\`${String(value).replaceAll('`', '\\`')}\``
}

function renderDefault(value) {
  if (value === undefined) return '—'
  if (typeof value === 'string') return value || 'empty string'
  return JSON.stringify(value)
}

function commandAnchor(commandPath) {
  return `teamgrid-${commandPath.replaceAll(' ', '-')}`
}

function outputDescription(command) {
  const optionNames = new Set(command.options.map((option) => option.long))
  if (optionNames.has('--secret-file') && optionNames.has('--secret-stdout')) {
    return 'Choose exactly one reveal-once destination. `--secret-file` creates a new protected file without overwriting it; `--secret-stdout` writes only the raw secret. When a file is used, the non-secret receipt follows the selected global output mode.'
  }
  if (command.path === 'exports download') {
    return 'Choose exactly one destination. `--file` creates a new file without overwriting it; `--stdout` writes raw export bytes and must not be combined with table or JSON processing. File-mode completion metadata follows the selected global output mode.'
  }
  if (command.path === 'changes list') {
    return 'JSON preserves the complete change page. JSONL emits change records followed by a checkpoint record; table mode renders changes and then the current checkpoint.'
  }
  if (command.options.some((option) => option.long === '--all')) {
    return 'Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.'
  }
  return 'The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.'
}

function exampleFor(command) {
  const parts = [command.fullPath]
  for (const argument of command.arguments) parts.push(shellArgument(argument))
  for (const option of command.options.filter((item) => item.mandatory)) {
    parts.push(option.long || option.short)
    const value = argumentValue(option.flags)
    if (value) parts.push(value)
  }
  const optionNames = new Set(command.options.map((option) => option.long))
  if (optionNames.has('--secret-file') && optionNames.has('--secret-stdout')) {
    parts.push('--secret-file', './teamgrid-secret.txt')
  }
  if (command.path === 'exports download') parts.push('--file', './teamgrid-export.bin')
  return parts.join(' ')
}

function renderOptionTable(options) {
  if (!options.length) return 'This command defines no additional options.'
  const rows = [
    '| Option | Description | Required | Choices | Default |',
    '| --- | --- | --- | --- | --- |',
  ]
  for (const option of options) {
    rows.push(
      `| ${markdownCell(code(option.flags))} | ${markdownCell(option.description)} | ${option.mandatory ? 'Yes' : 'No'} | ${markdownCell(option.choices?.map(code).join(', ') || '—')} | ${markdownCell(option.defaultValue === undefined ? '—' : code(renderDefault(option.defaultValue)))} |`,
    )
  }
  return rows.join('\n')
}

function renderArguments(command) {
  if (!command.arguments.length) return ''
  const rows = [
    '### Arguments',
    '',
    '| Argument | Required | Variadic | Choices | Default | Description |',
    '| --- | --- | --- | --- | --- | --- |',
  ]
  for (const argument of command.arguments) {
    rows.push(
      `| ${markdownCell(code(argument.name))} | ${argument.required ? 'Yes' : 'No'} | ${argument.variadic ? 'Yes' : 'No'} | ${markdownCell(argument.choices?.map(code).join(', ') || '—')} | ${markdownCell(argument.defaultValue === undefined ? '—' : code(renderDefault(argument.defaultValue)))} | ${markdownCell(argument.description || 'Identifier or value named by the command syntax.')} |`,
    )
  }
  return `${rows.join('\n')}\n`
}

function renderApiMapping(command) {
  if (!command.apiOperations.length) {
    return 'The public capability manifest does not assign a dedicated API operation to this local CLI command.\n'
  }
  const rows = [
    '| Operation | HTTP | Scope | API reference |',
    '| --- | --- | --- | --- |',
  ]
  for (const operation of command.apiOperations) {
    rows.push(
      `| ${markdownCell(code(operation.operationId))} | ${markdownCell(code(`${operation.method} ${operation.path}`))} | ${markdownCell(operation.scope ? code(operation.scope) : 'Anonymous protocol')} | [${markdownCell(operation.summary)}](/api/v1/reference/operations/${operation.operationId.toLowerCase()}/) |`,
    )
  }
  const aliasNote = command.canonicalCliPath && command.canonicalCliPath !== command.path
    ? `This is an alternative CLI form of ${code(`teamgrid ${command.canonicalCliPath}`)} and calls the same API operation.\n\n`
    : ''
  return `${aliasNote}${rows.join('\n')}\n`
}

function renderCommand(command) {
  const aliasText = command.aliases.length
    ? `\nAliases: ${command.aliases.map((alias) => code(`${command.parentPath} ${alias}`.trim())).join(', ')}.\n`
    : ''
  const safety = command.requiresConfirmation
    ? '\n### Confirmation and automation\n\nThis command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.\n'
    : ''
  const exitCodes = [0, 1, 2, 3, 4, 5, 6, 7, 130].map(code).join(', ')
  return `## ${command.fullPath}\n\n${command.description}\n${aliasText}\n### Syntax\n\n\`\`\`bash\n${command.syntax}\n\`\`\`\n\n### API operation and scope\n\n${renderApiMapping(command)}\n${renderArguments(command)}\n### Command options\n\n${renderOptionTable(command.options)}\n\nThe [global options](#global-options) and implicit ${code('-h, --help')} option also apply.\n\n### Output\n\n${outputDescription(command)}\n${safety}\n### Example\n\n\`\`\`bash\n${exampleFor(command)}\n\`\`\`\n\n### Exit codes\n\nThe command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (${exitCodes}). See the linked table for the meaning and automation behavior of each code.\n`
}

function renderGroupPage(group, manifest) {
  const aliases = group.aliases.length
    ? `\nCommand aliases: ${group.aliases.map((alias) => code(`teamgrid ${alias}`)).join(', ')}.\n`
    : ''
  const commandLinks = group.commands
    .map((command) => `- [${code(command.fullPath)}](#${commandAnchor(command.path)}) — ${command.description}`)
    .join('\n')
  return `---\ntitle: ${JSON.stringify(`teamgrid ${group.name}`)}\ndescription: ${JSON.stringify(`${group.commands.length} executable @teamgrid/cli commands in the ${group.name} group, generated from CLI ${manifest.version}.`)}\nowner: Developer Experience\nreviewedAt: ${manifest.reviewedAt}\n---\n\n> Generated from ${code(`@teamgrid/cli@${manifest.version}`)} at Developer Platform commit ${code(manifest.sourceCommit.slice(0, 12))}. Run ${code('node scripts/sync-cli-reference.mjs --check')} to detect drift; do not edit this page manually.\n\n${group.description}${aliases}\n\n## Global options\n\nGlobal options can be placed before the command group.\n\n${renderOptionTable(manifest.globalOptions)}\n\n## Commands\n\n${commandLinks}\n\n${group.commands.map(renderCommand).join('\n')}\n`
}

function renderIndex(manifest) {
  const rows = [
    '| Command group | Executable commands | Description |',
    '| --- | ---: | --- |',
    ...manifest.groups.map(
      (group) => `| [${markdownCell(code(`teamgrid ${group.name}`))}](/cli/reference/${group.slug}/) | ${group.commands.length} | ${markdownCell(group.description)} |`,
    ),
  ]
  return `---\ntitle: CLI command reference\ndescription: Exact syntax, arguments, options, API operations, scopes, output behavior, safety notes, examples, and exit codes for every TeamGrid CLI command.\nowner: Developer Experience\nreviewedAt: ${manifest.reviewedAt}\n---\n\nThis reference is generated from the real ${code(`@teamgrid/cli@${manifest.version}`)} Commander tree and the public API capability manifest. It covers all ${manifest.executableCommandCount} executable commands in ${manifest.groupCount} top-level groups, including ${manifest.argumentDefinitionCount} argument and ${manifest.commandOptionDefinitionCount} command-option definitions plus ${manifest.globalOptions.length} global options. Its ${manifest.mappedCliPathCount} canonical CLI paths map to all ${manifest.apiOperationCount} API v1 operations.\n\nUse [CLI commands](/cli/commands/) for workflow-oriented guidance and this reference when you need exact terminal syntax. Run ${code('teamgrid --version')} before comparing an installed CLI with this release.\n\n## Global options\n\n${renderOptionTable(manifest.globalOptions)}\n\nEvery command also accepts the implicit ${code('-h, --help')} option. Global options are inherited by subcommands and can be placed before the top-level command group.\n\n## Input, output, and safety conventions\n\n- ${code('--data <json|@file|->')} accepts inline JSON, a file prefixed with ${code('@')}, or standard input with ${code('-')}.
- ${code('--output table')} is intended for people. Use ${code('json')} or ${code('jsonl')} for automation.
- Commands carrying ${code('--all')} traverse opaque cursor pages, bounded by ${code('--max-pages')}.
- ${code('--if-match')} always requires the latest server-issued revision or strong ETag; never synthesize it.
- Commands carrying ${code('--yes')} ask before destructive or complete-replacement behavior. Non-interactive sessions must opt in explicitly.
- Reveal-once credentials, webhook secrets, and raw export downloads use dedicated file/stdout options so structured output cannot accidentally mix with secret or binary bytes.

See [CLI automation](/cli/automation/) for pagination and exit-code handling and [CLI maintenance and troubleshooting](/cli/maintenance-and-troubleshooting/) for upgrades, shell behavior, private CAs, debugging, and common failures.\n\n## Command groups\n\n${rows.join('\n')}\n\n## Synchronization contract\n\nThe checked-in source is [${code('sources/cli-reference.json')}](https://github.com/TeamGrid/developer-docs/blob/main/sources/cli-reference.json). The synchronization script verifies the pinned Developer Platform commit from ${code('sources/packages.json')}, rebuilds the API client and CLI locally, extracts the Commander tree, joins it to ${code('developer-capabilities.json')}, and rewrites this index plus one page per top-level group. Check mode performs the same derivation without changing files and fails on any source or generated-page drift.\n`
}

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

function optionRecord(option) {
  return {
    flags: option.flags,
    short: option.short || null,
    long: option.long || null,
    description: option.description,
    mandatory: Boolean(option.mandatory),
    variadic: Boolean(option.variadic),
    choices: option.argChoices || null,
    defaultValue: option.defaultValue,
  }
}

function argumentRecord(argument) {
  return {
    name: argument.name(),
    description: argument.description || '',
    required: Boolean(argument.required),
    variadic: Boolean(argument.variadic),
    choices: argument.argChoices || null,
    defaultValue: argument.defaultValue,
  }
}

function commandPath(command) {
  const names = []
  let current = command
  while (current?.parent) {
    names.unshift(current.name())
    current = current.parent
  }
  return names.join(' ')
}

function commandDescription(command, operations) {
  const sentence = (value) => value.endsWith('.') ? value : `${value}.`
  const declared = command.description()?.trim()
  if (declared) return sentence(declared)
  if (operations.length === 1) return sentence(operations[0].summary)
  if (operations.length > 1) return `Implements ${operations.length} API v1 protocol operations.`
  return 'Performs a local TeamGrid CLI operation.'
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

async function main() {
  const packagesManifest = await readJson(path.join(root, 'sources', 'packages.json'))
  const contractsManifest = await readJson(path.join(root, 'sources', 'contracts.json'))
  const capabilities = await readJson(
    path.join(root, 'public', 'openapi', 'developer-capabilities.json'),
  )
  const openapi = await readJson(path.join(root, 'public', 'openapi', 'v1.json'))
  const sourceRootArgument = process.argv.indexOf('--source-root')
  const sourceRoot = path.resolve(
    sourceRootArgument >= 0
      ? process.argv[sourceRootArgument + 1]
      : process.env.TEAMGRID_DEVELOPER_PLATFORM_REPOSITORY
        || path.join(root, '..', 'developer-platform'),
  )
  if (!(await exists(path.join(sourceRoot, '.git')))) {
    throw new Error(`Developer Platform Git repository not found: ${sourceRoot}`)
  }

  const sourceCommit = packagesManifest.sourceCommit
  const platformDirectory = path.join(sourceRoot, 'developer-platform')
  const relevantPaths = [
    'developer-platform/package.json',
    'developer-platform/package-lock.json',
    'developer-platform/tsconfig.json',
    'developer-platform/packages/api-client',
    'developer-platform/packages/cli',
  ]
  try {
    await execFileAsync('git', ['diff', '--quiet', sourceCommit, '--', ...relevantPaths], {
      cwd: sourceRoot,
    })
  } catch {
    throw new Error(
      `The sibling Developer Platform CLI/API-client sources do not match pinned commit ${sourceCommit}. Check out that commit in a separate worktree or point --source-root to it.`,
    )
  }

  await execFileAsync('npm', ['run', 'build', '-w', '@teamgrid/api-client'], {
    cwd: platformDirectory,
    maxBuffer: 10 * 1024 * 1024,
  })
  await execFileAsync('npm', ['run', 'build', '-w', '@teamgrid/cli'], {
    cwd: platformDirectory,
    maxBuffer: 10 * 1024 * 1024,
  })

  const cliPackage = await readJson(path.join(platformDirectory, 'packages', 'cli', 'package.json'))
  if (cliPackage.version !== packagesManifest.version) {
    throw new Error(
      `Built CLI version ${cliPackage.version} does not match pinned package version ${packagesManifest.version}.`,
    )
  }
  const { stdout: reviewedAtOutput } = await execFileAsync(
    'git',
    ['show', '-s', '--format=%cs', sourceCommit],
    { cwd: sourceRoot, encoding: 'utf8' },
  )
  const { stdout: sourceProgram } = await execFileAsync(
    'git',
    ['show', `${sourceCommit}:developer-platform/packages/cli/src/program.ts`],
    { cwd: sourceRoot, encoding: 'buffer', maxBuffer: 5 * 1024 * 1024 },
  )
  const moduleUrl = pathToFileURL(
    path.join(platformDirectory, 'packages', 'cli', 'dist', 'program.js'),
  )
  moduleUrl.searchParams.set('source', sourceCommit)
  const { createProgram } = await import(moduleUrl.href)
  const program = createProgram()

  const openapiOperations = new Map()
  for (const [apiPath, methods] of Object.entries(openapi.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!operation?.operationId) continue
      openapiOperations.set(operation.operationId, {
        method: method.toUpperCase(),
        path: apiPath,
        operationId: operation.operationId,
        summary: operation.summary,
      })
    }
  }
  const operationsByCliPath = new Map()
  for (const policy of capabilities.operationPolicy) {
    const operation = openapiOperations.get(policy.operationId)
    if (!operation) throw new Error(`Missing OpenAPI operation: ${policy.operationId}`)
    const mapped = {
      ...operation,
      scope: policy.scope,
    }
    const entries = operationsByCliPath.get(policy.cli) || []
    entries.push(mapped)
    operationsByCliPath.set(policy.cli, entries)
  }

  const executableCommands = []
  const allPaths = new Map()
  function visit(command) {
    if (command !== program) {
      const relativePath = commandPath(command)
      if (allPaths.has(relativePath)) throw new Error(`Duplicate CLI command path: ${relativePath}`)
      allPaths.set(relativePath, command)
      if (typeof command._actionHandler === 'function') executableCommands.push(command)
    }
    for (const child of command.commands) visit(child)
  }
  visit(program)

  for (const cliPath of operationsByCliPath.keys()) {
    const command = allPaths.get(cliPath)
    if (!command || typeof command._actionHandler !== 'function') {
      throw new Error(`Capability manifest CLI path is not executable: ${cliPath}`)
    }
  }

  // The capability manifest names one canonical CLI spelling per API operation.
  // Commander also exposes three intentional aliases backed by the identical
  // action handler, plus a checkpoint form of GET /changes. Preserve those
  // real API relationships without claiming additional contract operations.
  const mappedPathByActionHandler = new Map()
  for (const [cliPath] of operationsByCliPath) {
    const command = allPaths.get(cliPath)
    if (command?._actionHandler) mappedPathByActionHandler.set(command._actionHandler, cliPath)
  }
  const behaviorAliases = new Map([
    ['changes checkpoint', 'changes list'],
    ['lists', 'lists list'],
    ['services', 'services list'],
    ['tags', 'tags list'],
  ])

  const groups = program.commands.map((topLevel) => {
    const commands = executableCommands
      .filter((command) => {
        let current = command
        while (current.parent && current.parent !== program) current = current.parent
        return current === topLevel
      })
      .map((command) => {
        const relativePath = commandPath(command)
        const canonicalCliPath = operationsByCliPath.has(relativePath)
          ? relativePath
          : mappedPathByActionHandler.get(command._actionHandler)
            || behaviorAliases.get(relativePath)
            || null
        const apiOperations = canonicalCliPath
          ? operationsByCliPath.get(canonicalCliPath) || []
          : []
        const argumentsList = command.registeredArguments.map(argumentRecord)
        const options = command.options.map(optionRecord)
        return {
          path: relativePath,
          fullPath: `teamgrid ${relativePath}`,
          parentPath: relativePath.split(' ').slice(0, -1).join(' '),
          syntax: `teamgrid ${relativePath} ${command.usage()}`,
          description: commandDescription(command, apiOperations),
          aliases: command.aliases(),
          arguments: argumentsList,
          options,
          requiresConfirmation: options.some((option) => option.long === '--yes'),
          canonicalCliPath,
          apiOperations,
        }
      })
    return {
      name: topLevel.name(),
      slug: topLevel.name(),
      description: commandDescription(
        topLevel,
        operationsByCliPath.get(topLevel.name()) || [],
      ),
      aliases: topLevel.aliases(),
      commands,
    }
  })

  const mappedExecutablePaths = new Set(
    executableCommands.map(commandPath).filter((item) => operationsByCliPath.has(item)),
  )
  const localCommands = executableCommands
    .map(commandPath)
    .filter((item) => {
      if (operationsByCliPath.has(item) || behaviorAliases.has(item)) return false
      const command = allPaths.get(item)
      return !mappedPathByActionHandler.has(command?._actionHandler)
    })
  const manifest = {
    schemaVersion: 1,
    package: '@teamgrid/cli',
    version: cliPackage.version,
    sourceRepository: packagesManifest.sourceRepository,
    sourceCommit,
    sourceProgramSha256: createHash('sha256').update(sourceProgram).digest('hex'),
    apiContractSourceCommit: contractsManifest.sourceCommit,
    reviewedAt: reviewedAtOutput.trim(),
    commanderVersion: cliPackage.dependencies.commander,
    groupCount: groups.length,
    commandNodeCount: allPaths.size,
    executableCommandCount: executableCommands.length,
    mappedCliPathCount: mappedExecutablePaths.size,
    apiBackedExecutableCommandCount: executableCommands.length - localCommands.length,
    apiOperationCount: capabilities.operationPolicy.length,
    argumentDefinitionCount: groups.reduce(
      (total, group) => total + group.commands.reduce(
        (groupTotal, command) => groupTotal + command.arguments.length,
        0,
      ),
      0,
    ),
    commandOptionDefinitionCount: groups.reduce(
      (total, group) => total + group.commands.reduce(
        (groupTotal, command) => groupTotal + command.options.length,
        0,
      ),
      0,
    ),
    confirmationCommandCount: groups.reduce(
      (total, group) => total + group.commands.filter(
        (command) => command.requiresConfirmation,
      ).length,
      0,
    ),
    localCommands,
    globalOptions: program.options.map(optionRecord),
    groups,
  }

  const expected = new Map()
  const referenceRoot = path.join(root, 'src', 'content', 'docs', 'cli', 'reference')
  const generatedPages = new Map()
  const normalizedPage = (content) => `${content.trimEnd()}\n`
  generatedPages.set(path.join(referenceRoot, 'index.md'), normalizedPage(renderIndex(manifest)))
  for (const group of groups) {
    generatedPages.set(
      path.join(referenceRoot, `${group.slug}.md`),
      normalizedPage(renderGroupPage(group, manifest)),
    )
  }
  manifest.generatedPages = Object.fromEntries(
    Array.from(generatedPages, ([file, content]) => [
      path.relative(root, file),
      createHash('sha256').update(content).digest('hex'),
    ]),
  )
  expected.set(
    path.join(root, 'sources', 'cli-reference.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )
  for (const entry of generatedPages) expected.set(...entry)

  if (checkOnly) {
    const failures = []
    for (const [file, content] of expected) {
      if (!(await exists(file)) || (await readFile(file, 'utf8')) !== content) {
        failures.push(path.relative(root, file))
      }
    }
    const existingPages = await readdir(referenceRoot).catch(() => [])
    for (const name of existingPages.filter((name) => name.endsWith('.md'))) {
      if (!expected.has(path.join(referenceRoot, name))) failures.push(`stale:${path.join('src/content/docs/cli/reference', name)}`)
    }
    if (failures.length) {
      throw new Error(`CLI reference drift detected:\n${failures.join('\n')}`)
    }
    console.log(
      `CLI reference matches @teamgrid/cli@${manifest.version}: ${manifest.executableCommandCount} commands, ${manifest.apiOperationCount} API operations.`,
    )
    return
  }

  await mkdir(referenceRoot, { recursive: true })
  const existingPages = await readdir(referenceRoot).catch(() => [])
  for (const name of existingPages.filter((name) => name.endsWith('.md'))) {
    const file = path.join(referenceRoot, name)
    if (!expected.has(file)) await unlink(file)
  }
  for (const [file, content] of expected) {
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, content)
  }
  console.log(
    `Generated CLI reference for @teamgrid/cli@${manifest.version}: ${manifest.executableCommandCount} commands in ${manifest.groupCount} groups, ${manifest.apiOperationCount} API operations.`,
  )
}

await main()
