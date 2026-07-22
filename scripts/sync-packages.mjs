import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')
const candidates = [
  process.argv[2],
  process.env.TEAMGRID_DEVELOPER_PLATFORM_REPOSITORY,
  path.resolve(root, '..', 'developer-platform'),
].filter(Boolean)

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

let sourceRoot = null
for (const candidate of candidates) {
  const normalized = path.resolve(candidate)
  if (await exists(path.join(normalized, '.git'))) {
    sourceRoot = normalized
    break
  }
}

if (!sourceRoot) throw new Error('Could not find the TeamGrid Developer Platform Git repository.')

const requestedRef = process.argv[3] || process.env.TEAMGRID_DEVELOPER_PLATFORM_REF || 'HEAD'
const { stdout: resolvedCommit } = await execFileAsync(
  'git',
  ['rev-parse', '--verify', `${requestedRef}^{commit}`],
  { cwd: sourceRoot, encoding: 'utf8' },
)
const sourceCommit = resolvedCommit.trim()
if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
  throw new Error(`Git resolved an invalid Developer Platform commit: ${sourceCommit}`)
}

async function readSourceJson(relativePath) {
  const { stdout } = await execFileAsync(
    'git',
    ['show', `${sourceCommit}:${relativePath}`],
    { cwd: sourceRoot, encoding: 'buffer', maxBuffer: 1024 * 1024 },
  )
  return {
    content: stdout,
    document: JSON.parse(stdout.toString('utf8')),
  }
}

const packagePaths = {
  apiClient: 'developer-platform/packages/api-client/package.json',
  cli: 'developer-platform/packages/cli/package.json',
  mcpServer: 'developer-platform/packages/mcp-server/package.json',
}
const packages = {}
for (const [name, packagePath] of Object.entries(packagePaths)) {
  const { content, document } = await readSourceJson(packagePath)
  packages[name] = {
    name: document.name,
    version: document.version,
    sha256: createHash('sha256').update(content).digest('hex'),
  }
}

const version = packages.apiClient.version
if (
  version !== '1.0.0-beta.2'
  || packages.cli.version !== version
  || packages.mcpServer.version !== version
) {
  throw new Error('All public Developer Platform packages must use 1.0.0-beta.2.')
}

const { document: cliPackage } = await readSourceJson(packagePaths.cli)
const { document: mcpPackage } = await readSourceJson(packagePaths.mcpServer)
if (cliPackage.dependencies?.['@teamgrid/api-client'] !== version) {
  throw new Error('The CLI must pin the exact API client version.')
}
if (
  mcpPackage.dependencies?.['@teamgrid/api-client'] !== version
  || mcpPackage.dependencies?.['@teamgrid/cli'] !== version
) {
  throw new Error('The MCP server must pin the exact API client and CLI versions.')
}

const manifest = {
  schemaVersion: 1,
  sourceRepository: 'TeamGrid/developer-platform',
  sourceCommit,
  version,
  packages,
}
await mkdir(path.join(root, 'sources'), { recursive: true })
await writeFile(
  path.join(root, 'sources', 'packages.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

console.log(`Pinned Developer Platform packages from ${manifest.sourceRepository}@${sourceCommit}.`)
