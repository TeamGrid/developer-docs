import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

async function source(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8')
}

const environmentGuide = await source(
  'src/content/docs/resources/authentication-by-environment.md',
)
const cliGuide = await source('src/content/docs/cli/install-and-authenticate.md')
const ciGuide = await source('src/content/docs/cli/automation.md')
const apiGuide = await source('src/content/docs/api/v1/authentication.md')
const releaseGuide = await source('docs/production-release.md')
const packageManifest = JSON.parse(await source('sources/packages.json'))

for (const requiredEnvironment of [
  'Local desktop CLI',
  'Remote terminal',
  'Interactive development container',
  'Local SDK script',
  'Local MCP host',
  'CI, server, or scheduled job',
]) {
  assert.ok(
    environmentGuide.includes(requiredEnvironment),
    `Authentication guidance is missing ${requiredEnvironment}.`,
  )
}

for (const requiredLifecycleStatement of [
  'local profile and its operating-system credential-store',
  'does not revoke the server-side credential',
  'Settings → Team → Developer Center → Access',
  'macOS Keychain, Linux Secret Service, or Windows Credential Manager',
  'Device authorization is not part of this release',
]) {
  assert.ok(
    environmentGuide.includes(requiredLifecycleStatement)
      || cliGuide.includes(requiredLifecycleStatement),
    `Authentication guidance is missing lifecycle statement: ${requiredLifecycleStatement}`,
  )
}

assert.ok(
  ciGuide.includes('Create a dedicated service account'),
  'CI guidance must recommend a dedicated service account.',
)
assert.ok(
  ciGuide.includes('never use `teamgrid auth login` or a personal credential in CI'),
  'CI guidance must explicitly reject personal browser credentials.',
)
assert.ok(
  environmentGuide.includes('Create a dedicated service account in Developer Center')
    && environmentGuide.includes("CI platform's secret manager"),
  'Unattended authentication must use a service account from a secret manager.',
)
assert.ok(
  apiGuide.includes('API v0 workspace tokens are separate legacy credentials'),
  'API guidance must distinguish v0 legacy credentials.',
)
assert.ok(
  environmentGuide.includes('Never send the bearer credential'),
  'Support guidance must prohibit secret collection.',
)
assert.match(
  releaseGuide,
  /both active production\s+cells/,
  'Portal release sequencing must require both active production cells.',
)

for (const page of [environmentGuide, cliGuide]) {
  assert.ok(
    page.includes(`@teamgrid/cli@${packageManifest.version}`)
      || page.includes('teamgrid auth login'),
    'CLI authentication guidance must refer to the synchronized package contract.',
  )
}

console.log('Authentication guidance is complete and environment-specific.')
