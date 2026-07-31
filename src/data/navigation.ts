export type NavigationItem = {
  label: string
  href: string
  description?: string
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

export const navigation: NavigationGroup[] = [
  {
    label: 'Start here',
    items: [
      { label: 'Developer home', href: '/', description: 'Choose the right TeamGrid interface.' },
      { label: 'Start building', href: '/guides/get-started/' },
      { label: 'Choose an interface', href: '/guides/choose-an-interface/' },
      { label: 'Capability coverage', href: '/guides/capability-coverage/' },
    ],
  },
  {
    label: 'Integration guides',
    items: [
      { label: 'Synchronize tasks', href: '/guides/sync-tasks/' },
      { label: 'Export time entries', href: '/guides/export-time-entries/' },
      { label: 'Process webhooks reliably', href: '/guides/reliable-webhooks/' },
      { label: 'Automate project setup', href: '/guides/automate-project-setup/' },
      { label: 'Audit users and access', href: '/guides/audit-users-and-access/' },
      { label: 'Upload a file safely', href: '/guides/upload-a-file/' },
      { label: 'Roll out a service account', href: '/guides/service-account-rollout/' },
    ],
  },
  {
    label: 'API v1',
    items: [
      { label: 'Overview', href: '/api/v1/' },
      { label: 'Quickstart', href: '/api/v1/quickstart/' },
      { label: 'Credentials and scopes', href: '/api/v1/authentication/' },
      { label: 'API reference', href: '/api/v1/reference/' },
      { label: 'Platform discovery', href: '/api/v1/platform-control-plane/' },
      { label: 'Resources and semantics', href: '/api/v1/resources-and-semantics/' },
      { label: 'Concurrent writes', href: '/api/v1/resource-concurrency/' },
      { label: 'Regional endpoints', href: '/api/v1/regions/' },
      { label: 'Pagination and idempotency', href: '/api/v1/pagination/' },
      { label: 'Change feed', href: '/api/v1/change-feed/' },
      { label: 'Custom fields', href: '/api/v1/custom-fields/' },
      { label: 'Task workflows', href: '/api/v1/task-workflows/' },
      { label: 'Project templates', href: '/api/v1/project-templates/' },
      { label: 'Calendar and availability', href: '/api/v1/calendar-and-availability/' },
      { label: 'Planned work', href: '/api/v1/planned-work/' },
      { label: 'Collaboration and files', href: '/api/v1/collaboration-and-files/' },
      { label: 'Administration', href: '/api/v1/administration/' },
      { label: 'Search and exports', href: '/api/v1/search-and-exports/' },
      { label: 'Automations and integrations', href: '/api/v1/automations-and-integrations/' },
      { label: 'Errors and rate limits', href: '/api/v1/errors/' },
      { label: 'Signed webhooks', href: '/api/v1/webhooks/' },
    ],
  },
  {
    label: 'API v0 · Legacy',
    items: [
      { label: 'Overview', href: '/api/v0/' },
      { label: 'Getting started', href: '/api/v0/guides/getting-started/' },
      { label: 'Guide overview', href: '/api/v0/guides/overview/' },
      { label: 'Data model and IDs', href: '/api/v0/guides/data-model-and-ids/' },
      { label: 'Common workflows', href: '/api/v0/guides/common-workflows/' },
      { label: 'Recipes', href: '/api/v0/recipes/' },
      { label: 'API reference', href: '/api/v0/reference/' },
      { label: 'Migrate to v1', href: '/api/v0/migration/' },
    ],
  },
  {
    label: 'TypeScript SDK',
    items: [
      { label: 'Overview', href: '/sdk/' },
      { label: 'Quickstart', href: '/sdk/quickstart/' },
      { label: 'Pagination and errors', href: '/sdk/pagination-and-errors/' },
      { label: 'Webhook verification', href: '/sdk/webhook-verification/' },
    ],
  },
  {
    label: 'CLI',
    items: [
      { label: 'Overview', href: '/cli/' },
      { label: 'Install and authenticate', href: '/cli/install-and-authenticate/' },
      { label: 'Commands', href: '/cli/commands/' },
      { label: 'Automation', href: '/cli/automation/' },
    ],
  },
  {
    label: 'MCP server',
    items: [
      { label: 'Overview', href: '/mcp/' },
      { label: 'Configure a host', href: '/mcp/configuration/' },
      { label: 'Tools and security', href: '/mcp/tools-and-security/' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Developer tooling', href: '/resources/developer-tooling/' },
      { label: 'Authentication by environment', href: '/resources/authentication-by-environment/' },
      { label: 'Versions and compatibility', href: '/resources/compatibility/' },
      { label: 'Request troubleshooting', href: '/resources/troubleshooting/' },
      { label: 'Changelog', href: '/changelog/' },
      { label: 'OpenAPI files', href: '/openapi/' },
      { label: 'Security', href: '/security/' },
    ],
  },
]

export const primaryNavigation = [
  { label: 'Documentation', href: '/guides/choose-an-interface/' },
  { label: 'API reference', href: '/api/v1/reference/' },
  { label: 'SDK', href: '/sdk/' },
  { label: 'CLI', href: '/cli/' },
  { label: 'MCP', href: '/mcp/' },
]

export function normalizePath(pathname: string) {
  if (pathname === '/') return pathname
  return `${pathname.replace(/\/+$/, '')}/`
}

export function isCurrentPath(pathname: string, href: string) {
  return normalizePath(pathname) === normalizePath(href)
}
