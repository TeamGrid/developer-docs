import v0Document from '../../public/openapi/v0.json'
import v1Document from '../../public/openapi/v1.json'

export const httpMethods = ['get', 'post', 'put', 'patch', 'delete'] as const
export type HttpMethod = (typeof httpMethods)[number]
export type ApiVersion = 'v0' | 'v1'

export type ApiOperation = {
  description?: string
  method: HttpMethod
  operation: Record<string, any>
  operationId: string
  path: string
  pathParameters?: any[]
  summary: string
  tag: string
  version: ApiVersion
}

export type SchemaRow = {
  defaultValue?: unknown
  depth: number
  description?: string
  enumValues?: unknown[]
  format?: string
  hasChildren: boolean
  label: string
  name: string
  nullable: boolean
  parentPath: string
  path: string
  required: boolean
}

export function apiDocument(version: ApiVersion): Record<string, any> {
  return (version === 'v1' ? v1Document : v0Document) as Record<string, any>
}

export function apiOperations(version: ApiVersion): ApiOperation[] {
  const document = apiDocument(version)
  return Object.entries(document.paths || {}).flatMap(([path, pathItem]: [string, any]) =>
    httpMethods.flatMap((method) => {
      const operation = pathItem?.[method]
      if (!operation) return []
      const operationId = operation.operationId || `${method}-${path}`
      return [{
        description: operation.description,
        method,
        operation,
        operationId,
        path,
        pathParameters: pathItem?.parameters || [],
        summary: operation.summary || operationId,
        tag: operation.tags?.[0] || 'General',
        version,
      }]
    }),
  )
}

export function groupedOperations(version: ApiVersion) {
  const groups = new Map<string, ApiOperation[]>()
  for (const operation of apiOperations(version)) {
    const existing = groups.get(operation.tag) || []
    existing.push(operation)
    groups.set(operation.tag, existing)
  }
  return [...groups.entries()].map(([tag, operations]) => ({ tag, operations }))
}

export function operationHref(operation: Pick<ApiOperation, 'operationId' | 'version'>) {
  return `/api/${operation.version}/reference/operations/${operation.operationId.toLowerCase()}/`
}

export function resolveReference(document: Record<string, any>, value: any): any {
  if (!value?.$ref) return value
  const segments = value.$ref.replace(/^#\//, '').split('/')
  return segments.reduce((current: any, segment: string) => current?.[segment], document)
}

function normalizedSchema(document: Record<string, any>, schema: any): any {
  const resolved = resolveReference(document, schema) || schema || {}
  const branches = resolved.allOf || []
  if (branches.length === 0) return resolved
  const merged = branches.map((branch: any) => normalizedSchema(document, branch))
  return {
    ...resolved,
    properties: Object.assign({}, ...merged.map((branch: any) => branch.properties || {}), resolved.properties || {}),
    required: [...new Set([...merged.flatMap((branch: any) => branch.required || []), ...(resolved.required || [])])],
  }
}

function schemaObject(document: Record<string, any>, schema: any): any {
  const normalized = normalizedSchema(document, schema)
  if (normalized.type === 'array' && normalized.items) return normalizedSchema(document, normalized.items)
  return normalized
}

export function schemaRows(version: ApiVersion, schema: any, maxDepth = 4): SchemaRow[] {
  const document = apiDocument(version)
  const root = schemaObject(document, schema)
  const rows: SchemaRow[] = []

  function visit(current: any, parentPath: string, depth: number, ancestors: Set<string>) {
    const object = schemaObject(document, current)
    const properties = Object.entries(object.properties || {}) as [string, any][]
    const required = new Set<string>(object.required || [])

    for (const [name, rawProperty] of properties) {
      const path = parentPath ? `${parentPath}.${name}` : name
      const reference = rawProperty?.$ref || rawProperty?.items?.$ref
      const property = schemaObject(document, rawProperty)
      const children = Object.keys(property.properties || {})
      const cyclic = reference ? ancestors.has(reference) : false
      const hasChildren = children.length > 0 && !cyclic && depth < maxDepth
      rows.push({
        defaultValue: rawProperty?.default ?? property.default,
        depth,
        description: rawProperty?.description || property.description,
        enumValues: rawProperty?.enum || property.enum,
        format: rawProperty?.format || property.format,
        hasChildren,
        label: schemaLabel(rawProperty),
        name,
        nullable: rawProperty?.nullable === true
          || (Array.isArray(rawProperty?.type) && rawProperty.type.includes('null')),
        parentPath,
        path,
        required: required.has(name),
      })
      if (hasChildren) {
        const nextAncestors = new Set(ancestors)
        if (reference) nextAncestors.add(reference)
        visit(property, path, depth + 1, nextAncestors)
      }
    }
  }

  visit(root, '', 0, new Set())
  return rows
}

export function operationParameters(operation: ApiOperation) {
  const document = apiDocument(operation.version)
  return ([...(operation.pathParameters || []), ...(operation.operation.parameters || [])]).map((parameter: any) => ({
    ...resolveReference(document, parameter),
    _ref: parameter.$ref,
  }))
}

export function requestSchema(operation: ApiOperation) {
  const document = apiDocument(operation.version)
  const content = operation.operation.requestBody?.content || {}
  const mediaType = Object.keys(content)[0]
  if (!mediaType) return undefined
  return {
    mediaType,
    schema: resolveReference(document, content[mediaType]?.schema),
  }
}

export function schemaLabel(schema: any): string {
  if (!schema) return 'any'
  if (schema.$ref) return schema.$ref.split('/').pop()
  if (Array.isArray(schema.type)) return schema.type.filter((type: string) => type !== 'null').join(' | ') || 'null'
  if (schema.type === 'array') return `array<${schemaLabel(schema.items)}>`
  if (schema.oneOf) return schema.oneOf.map(schemaLabel).join(' | ')
  if (schema.anyOf) return schema.anyOf.map(schemaLabel).join(' | ')
  return schema.type || 'object'
}

export function exampleFromSchema(version: ApiVersion, schema: any, depth = 0, seen = new Set<string>()): any {
  if (!schema || depth > 5) return null
  const document = apiDocument(version)
  const reference = schema.$ref || schema.items?.$ref
  if (reference && seen.has(reference)) return schemaLabel(schema)
  const nextSeen = new Set(seen)
  if (reference) nextSeen.add(reference)
  const resolved = normalizedSchema(document, schema)
  if (resolved.example !== undefined) return resolved.example
  if (resolved.examples?.[0] !== undefined) return resolved.examples[0]
  if (resolved.default !== undefined) return resolved.default
  if (resolved.enum?.[0] !== undefined) return resolved.enum[0]
  if (resolved.type === 'array') return [exampleFromSchema(version, resolved.items, depth + 1, nextSeen)]
  if (resolved.properties) {
    return Object.fromEntries(
      Object.entries(resolved.properties)
        .slice(0, 12)
        .map(([name, property]) => [name, exampleFromSchema(version, property, depth + 1, nextSeen)]),
    )
  }
  if (resolved.type === 'boolean') return false
  if (resolved.type === 'integer' || resolved.type === 'number') return resolved.minimum ?? 0
  if (resolved.format === 'date-time') return '2026-07-29T09:00:00.000Z'
  if (resolved.format === 'date') return '2026-07-29'
  if (resolved.format === 'email') return 'developer@example.com'
  if (resolved.type === 'string') return resolved.pattern ? 'example' : 'string'
  return null
}

function pathValueName(value: string) {
  return value
    .replace(/[{}]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toUpperCase()
}

function cliSample(operation: ApiOperation, bodyExample: any) {
  if (operation.version !== 'v1') return undefined
  const segments = operation.path.split('/').filter(Boolean)
  const resource = segments[0]
  if (!resource) return undefined
  if (operation.path === '/workspace' && operation.method === 'get') return 'teamgrid workspace --output json'

  const idSegment = segments.find((segment) => segment.startsWith('{'))
  const id = idSegment ? pathValueName(idSegment) : undefined
  const action = segments.at(-1)?.startsWith('{') ? undefined : segments.at(-1)
  let command: string
  if (action && action !== resource && segments.length > 2) command = action
  else if (operation.method === 'get') command = id ? 'get' : 'list'
  else if (operation.method === 'post') command = id ? 'create' : 'create'
  else if (operation.method === 'patch' || operation.method === 'put') command = 'update'
  else if (operation.method === 'delete') command = 'archive'
  else return undefined

  const parts = [`teamgrid ${resource} ${command}`]
  if (id) parts.push(id)
  if (bodyExample && ['post', 'put', 'patch'].includes(operation.method)) parts.push("--data @payload.json")
  const parameters = operationParameters(operation)
  if (parameters.some((parameter: any) => parameter.name === 'Idempotency-Key')) {
    parts.push('--idempotency-key REQUEST_KEY')
  }
  if (parameters.some((parameter: any) => parameter.name === 'If-Match')) {
    parts.push('--if-match REVISION')
  }
  if (operation.method === 'get') parts.push('--output json')
  return parts.join(' \\\n  ')
}

export function codeSamples(operation: ApiOperation) {
  const document = apiDocument(operation.version)
  const base = document.servers?.[0]?.url || ''
  const queryParameters = operationParameters(operation).filter((parameter: any) => parameter.in === 'query')
  const query = queryParameters.length > 0
    ? `?${queryParameters.slice(0, 3).map((parameter: any) => {
        const value = parameter.example ?? parameter.schema?.default
          ?? (parameter.schema?.format === 'date-time' ? '2026-07-29T09:00:00Z' : parameter.name.toUpperCase())
        return `${parameter.name}=${encodeURIComponent(String(value))}`
      }).join('&')}`
    : ''
  const examplePath = operation.path.replace(/\{([^}]+)\}/g, (_match, name) => name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase())
  const url = `${base}${examplePath}${query}`
  const body = requestSchema(operation)
  const bodyExample = body ? exampleFromSchema(operation.version, body.schema) : undefined
  const hasBody = Boolean(body)
  const bodyJson = hasBody ? JSON.stringify(bodyExample, null, 2) : ''
  const curl = [
    `curl --request ${operation.method.toUpperCase()} \\`,
    `  --url '${url}' \\`,
    `  --header 'Authorization: Bearer $TEAMGRID_API_TOKEN'${hasBody ? ' \\' : ''}`,
    ...(hasBody ? [`  --header 'Content-Type: application/json' \\`, `  --data '${bodyJson.replace(/\n/g, '\n  ')}'`] : []),
  ].join('\n')
  const javascript = [
    `const response = await fetch('${url}', {`,
    `  method: '${operation.method.toUpperCase()}',`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.TEAMGRID_API_TOKEN}\`,`,
    ...(hasBody ? [`    'Content-Type': 'application/json',`] : []),
    `  },`,
    ...(hasBody ? [`  body: JSON.stringify(${bodyJson}),`] : []),
    `})`,
    ``,
    `const result = await response.json()`,
  ].join('\n')
  const typescript = [
    `type ApiResponse = unknown`,
    ``,
    `const response = await fetch('${url}', {`,
    `  method: '${operation.method.toUpperCase()}',`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.TEAMGRID_API_TOKEN}\`,`,
    ...(hasBody ? [`    'Content-Type': 'application/json',`] : []),
    `  },`,
    ...(hasBody ? [`  body: JSON.stringify(${bodyJson}),`] : []),
    `})`,
    ``,
    `const result: ApiResponse = await response.json()`,
  ].join('\n')
  const success = responseEntries(operation).find((response) => /^2/.test(response.status) && response.schema)
  const response = success?.schema
    ? JSON.stringify(exampleFromSchema(operation.version, success.schema), null, 2)
    : undefined
  return {
    cli: cliSample(operation, bodyExample),
    curl,
    javascript,
    response,
    typescript,
  }
}

export function responseEntries(operation: ApiOperation) {
  const document = apiDocument(operation.version)
  return Object.entries(operation.operation.responses || {}).map(([status, raw]: [string, any]) => {
    const response = resolveReference(document, raw) || {}
    const mediaType = Object.keys(response.content || {})[0]
    const schema = mediaType ? response.content[mediaType]?.schema : undefined
    return {
      description: response.description || '',
      mediaType,
      schema,
      status,
    }
  })
}
