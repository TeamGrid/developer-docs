import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const spec = JSON.parse(await readFile(path.join(root, 'public', 'openapi', 'v1.json'), 'utf8'))
const destination = path.join(root, 'public', 'collections')
const methods = ['get', 'post', 'put', 'patch', 'delete']

function resolve(value) {
  if (!value?.$ref) return value
  return value.$ref.replace(/^#\//, '').split('/').reduce((current, segment) => current?.[segment], spec)
}

function example(schema, depth = 0, refs = new Set()) {
  if (!schema || depth > 4) return null
  if (schema.$ref) {
    if (refs.has(schema.$ref)) return schema.$ref.split('/').pop()
    refs = new Set(refs).add(schema.$ref)
    schema = resolve(schema)
  }
  if (schema.example !== undefined) return schema.example
  if (schema.default !== undefined) return schema.default
  if (schema.enum?.[0] !== undefined) return schema.enum[0]
  if (schema.type === 'array') return [example(schema.items, depth + 1, refs)]
  if (schema.properties) {
    return Object.fromEntries(
      Object.entries(schema.properties).slice(0, 12).map(([name, value]) => [name, example(value, depth + 1, refs)]),
    )
  }
  if (schema.type === 'boolean') return false
  if (schema.type === 'integer' || schema.type === 'number') return schema.minimum ?? 0
  if (schema.format === 'date-time') return '2026-07-29T09:00:00.000Z'
  if (schema.format === 'date') return '2026-07-29'
  return schema.type === 'string' ? 'string' : null
}

const folders = new Map()
const httpRequests = [
  '# TeamGrid API v1',
  '# Generated from the published OpenAPI contract. Keep tokens in environment variables.',
  '@baseUrl = https://api.de.teamgrid.app/v1',
  '@token = replace-with-a-reveal-once-credential',
  '',
]

for (const [route, pathItem] of Object.entries(spec.paths || {})) {
  for (const method of methods) {
    const operation = pathItem?.[method]
    if (!operation) continue
    const tag = operation.tags?.[0] || 'General'
    const parameters = [...(pathItem.parameters || []), ...(operation.parameters || [])].map(resolve)
    const query = parameters.filter((parameter) => parameter.in === 'query')
    const queryString = query.length
      ? `?${query.map((parameter) => `${parameter.name}={{${parameter.name}}}`).join('&')}`
      : ''
    const requestBody = operation.requestBody?.content?.['application/json']?.schema
    const body = requestBody ? JSON.stringify(example(requestBody), null, 2) : undefined
    const headers = [
      { key: 'Accept', value: 'application/json' },
      ...(body ? [{ key: 'Content-Type', value: 'application/json' }] : []),
    ]
    const item = {
      name: operation.summary || operation.operationId,
      request: {
        auth: { type: 'bearer', bearer: [{ key: 'token', type: 'string', value: '{{token}}' }] },
        description: operation.description || '',
        header: headers,
        method: method.toUpperCase(),
        url: {
          host: ['{{baseUrl}}'],
          path: route.split('/').filter(Boolean),
          query: query.map((parameter) => ({
            disabled: !parameter.required,
            key: parameter.name,
            value: `{{${parameter.name}}}`,
          })),
          raw: `{{baseUrl}}${route}${queryString}`,
        },
        ...(body ? { body: { mode: 'raw', options: { raw: { language: 'json' } }, raw: body } } : {}),
      },
      response: [],
    }
    folders.set(tag, [...(folders.get(tag) || []), item])

    httpRequests.push(
      `### ${operation.summary || operation.operationId}`,
      `${method.toUpperCase()} {{baseUrl}}${route}${queryString}`,
      'Authorization: Bearer {{token}}',
      'Accept: application/json',
      ...(body ? ['Content-Type: application/json', '', body] : []),
      '',
    )
  }
}

const collection = {
  info: {
    _postman_id: '0e5a7ff4-c1b0-4a10-8c6b-teamgrid-api-v1',
    description: 'Generated from the stable TeamGrid API v1 OpenAPI contract.',
    name: 'TeamGrid API v1',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [...folders.entries()].map(([name, item]) => ({ item, name })),
  variable: [
    { key: 'baseUrl', value: 'https://api.de.teamgrid.app/v1' },
    { key: 'token', type: 'secret', value: '' },
  ],
}

await mkdir(destination, { recursive: true })
await Promise.all([
  writeFile(path.join(destination, 'teamgrid-api-v1.postman.json'), `${JSON.stringify(collection, null, 2)}\n`),
  writeFile(
    path.join(destination, 'teamgrid-api-v1.http'),
    `${httpRequests.join('\n').trimEnd()}\n`,
  ),
])

console.log(`Generated Postman and HTTP collections for ${[...folders.values()].flat().length} operations.`)
