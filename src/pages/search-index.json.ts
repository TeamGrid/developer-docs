import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { navigation } from '../data/navigation'
import { docPath } from '../lib/content'
import { apiOperations, operationHref } from '../lib/openapi'

export const prerender = true

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs', ({ id, data }) =>
    !data.draft && id !== 'index' && id !== '404',
  )
  const docEntries = docs.map((entry) => {
    const href = docPath(entry)
    const group = navigation.find((candidate) => candidate.items.some((item) => item.href === href))
    return {
      area: group?.label || href.split('/').filter(Boolean)[0] || 'Documentation',
      category: group?.label || 'Documentation',
      description: entry.data.description,
      href,
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
      title: operation.summary,
    })),
  )
  return new Response(JSON.stringify([...docEntries, ...operationEntries]), {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
