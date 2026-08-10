import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { navigation } from '../data/navigation'
import { docPath } from '../lib/content'
import { apiOperations, operationHref } from '../lib/openapi'
import { sdkSearchEntries } from '../lib/sdk-reference'

function searchableBody(value: string) {
  return value
    .replace(/^---[\s\S]*?---/m, ' ')
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```\w*/g, ' '))
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\[\]_*#>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24_000)
}

function surfaceForHref(href: string) {
  if (href.startsWith('/api/v1/')) return 'API v1'
  if (href.startsWith('/api/v0/')) return 'API v0'
  if (href.startsWith('/sdk/')) return 'TypeScript SDK'
  if (href.startsWith('/cli/')) return 'CLI'
  if (href.startsWith('/mcp/')) return 'MCP server'
  return null
}

export const prerender = true

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs', ({ id, data }) =>
    !data.draft && id !== 'index' && id !== '404',
  )
  const docEntries = docs.map((entry) => {
    const href = docPath(entry)
    const group = navigation.find((candidate) => candidate.items.some((item) => item.href === href))
    const area = surfaceForHref(href) || group?.label || href.split('/').filter(Boolean)[0] || 'Documentation'
    return {
      area,
      category: area,
      description: entry.data.description,
      href,
      keywords: searchableBody(entry.body || ''),
      title: entry.data.title,
    }
  })
  const operationEntries = (['v1', 'v0'] as const).flatMap((version) =>
    apiOperations(version).map((operation) => ({
      area: `API ${version}`,
      category: `API ${version}`,
      description: `${operation.method.toUpperCase()} ${operation.path}`,
      href: operationHref(operation),
      method: operation.method.toUpperCase(),
      keywords: [
        operation.operationId,
        operation.tag,
        ...(operation.operation['x-teamgrid-required-scopes'] || []),
        ...(operation.operation['x-teamgrid-optional-scopes'] || []),
      ].join(' '),
      title: operation.summary,
    })),
  )
  const curatedEntries = [
    {
      area: 'API v0',
      category: 'API v0',
      description: 'Filter every frozen API v0 route and open its exact API v1 replacement.',
      href: '/api/v0/migration-matrix/',
      keywords: '87 routes equivalent adaptation-required retained-v0 route migration matrix',
      title: 'API v0 to v1 route matrix',
    },
  ]
  return new Response(JSON.stringify([
    ...docEntries,
    ...operationEntries,
    ...sdkSearchEntries(),
    ...curatedEntries,
  ]), {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
