import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightOpenAPI, { createOpenAPISidebarGroup } from 'starlight-openapi'

const v0Reference = createOpenAPISidebarGroup()
const v1Reference = createOpenAPISidebarGroup()

const organizationSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'TeamGrid',
      url: 'https://teamgrid.app',
    },
    {
      '@type': 'WebSite',
      name: 'TeamGrid Developer Documentation',
      publisher: { '@type': 'Organization', name: 'TeamGrid' },
      url: 'https://developer.teamgridapp.com',
    },
  ],
})

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      description:
        'Official documentation for the TeamGrid API, TypeScript SDK, CLI, and read-only MCP server.',
      editLink: {
        baseUrl: 'https://github.com/TeamGrid/developer-docs/edit/main/',
      },
      favicon: '/favicon.svg',
      head: [
        {
          attrs: { content: '#1558f0', name: 'theme-color' },
          tag: 'meta',
        },
        {
          attrs: { type: 'application/ld+json' },
          content: organizationSchema,
          tag: 'script',
        },
        {
          attrs: {
            content: 'https://developer.teamgridapp.com/social-card.png',
            property: 'og:image',
          },
          tag: 'meta',
        },
        {
          attrs: { content: '1200', property: 'og:image:width' },
          tag: 'meta',
        },
        {
          attrs: { content: '630', property: 'og:image:height' },
          tag: 'meta',
        },
        {
          attrs: {
            content: 'TeamGrid Developer documentation',
            property: 'og:image:alt',
          },
          tag: 'meta',
        },
        {
          attrs: {
            content: 'https://developer.teamgridapp.com/social-card.png',
            name: 'twitter:image',
          },
          tag: 'meta',
        },
      ],
      lastUpdated: true,
      plugins: [
        starlightOpenAPI([
          {
            base: 'api/v0/reference',
            schema: './public/openapi/v0.json',
            sidebar: {
              collapsed: true,
              group: v0Reference,
              label: 'v0 endpoint reference',
              operations: { badges: true, labels: 'summary' },
            },
            snippets: {
              operation: {
                clients: { javascript: ['fetch'], shell: ['curl'] },
                default: { client: 'curl', target: 'shell' },
              },
            },
          },
          {
            base: 'api/v1/reference',
            schema: './public/openapi/v1.json',
            sidebar: {
              collapsed: true,
              group: v1Reference,
              label: 'v1 endpoint reference',
              operations: { badges: true, labels: 'summary' },
            },
            snippets: {
              operation: {
                clients: { javascript: ['fetch'], shell: ['curl'] },
                default: { client: 'curl', target: 'shell' },
              },
            },
          },
        ]),
      ],
      sidebar: [
        {
          items: [
            { label: 'Developer Hub', link: '/' },
            { label: 'Choose an interface', link: '/guides/choose-an-interface/' },
          ],
          label: 'Start here',
        },
        {
          items: [
            { label: 'Overview', link: '/api/v1/' },
            { label: 'Quickstart', link: '/api/v1/quickstart/' },
            { label: 'Credentials and scopes', link: '/api/v1/authentication/' },
            { label: 'Regional endpoints', link: '/api/v1/regions/' },
            { label: 'Pagination and idempotency', link: '/api/v1/pagination/' },
            { label: 'Errors and rate limits', link: '/api/v1/errors/' },
            { label: 'Signed webhooks', link: '/api/v1/webhooks/' },
            v1Reference,
          ],
          label: 'API v1',
        },
        {
          collapsed: true,
          items: [
            { label: 'Legacy API overview', link: '/api/v0/' },
            { label: 'Guides', link: '/api/v0/guides/overview/' },
            { label: 'Recipes', link: '/api/v0/recipes/' },
            { label: 'Migrate to v1', link: '/api/v0/migration/' },
            v0Reference,
          ],
          label: 'API v0 · Legacy',
        },
        {
          items: [
            { label: 'SDK overview', link: '/sdk/' },
            { label: 'Quickstart', link: '/sdk/quickstart/' },
            { label: 'Pagination and errors', link: '/sdk/pagination-and-errors/' },
            { label: 'Webhook verification', link: '/sdk/webhook-verification/' },
          ],
          label: 'TypeScript SDK',
        },
        {
          items: [
            { label: 'CLI overview', link: '/cli/' },
            { label: 'Install and authenticate', link: '/cli/install-and-authenticate/' },
            { label: 'Commands', link: '/cli/commands/' },
            { label: 'Automation', link: '/cli/automation/' },
          ],
          label: 'CLI',
        },
        {
          items: [
            { label: 'MCP overview', link: '/mcp/' },
            { label: 'Configure a host', link: '/mcp/configuration/' },
            { label: 'Tools and security', link: '/mcp/tools-and-security/' },
          ],
          label: 'MCP server',
        },
        {
          items: [
            { label: 'Changelog', link: '/changelog/' },
            { label: 'OpenAPI files', link: '/openapi/' },
            { label: 'Security', link: '/security/' },
          ],
          label: 'Resources',
        },
      ],
      social: [
        {
          href: 'https://github.com/TeamGrid/developer-docs',
          icon: 'github',
          label: 'GitHub',
        },
      ],
      title: 'TeamGrid Developer',
    }),
    sitemap(),
  ],
  site: 'https://developer.teamgridapp.com',
})
