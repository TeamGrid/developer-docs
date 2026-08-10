import sdkReferenceData from '../../sources/sdk-reference.json'

export type SdkReferenceParameter = {
  display: string
  name: string
  optional: boolean
  type: string
}

export type SdkReferenceResponse = {
  description: string | null
  mediaType?: string
  schema?: string | null
  status: string
}

export type SdkReferenceOperation = {
  apiHref: string
  conditionalScopes: string[]
  description: string | null
  errorResponses: SdkReferenceResponse[]
  httpMethod: string
  name: string
  operationId: string
  parameters: SdkReferenceParameter[]
  path: string
  request: {
    body: { mediaType: string; schema: string | null } | null
    parameters: Array<{
      description: string | null
      location: string
      name: string
      required: boolean
      type: string | null
    }>
  }
  requiredScopes: string[]
  returnForm: 'AsyncGenerator' | 'Promise' | 'value'
  signature: string
  successResponses: SdkReferenceResponse[]
  summary: string
  tag: string
}

export type SdkReferenceHelper = {
  description: string
  name: string
  parameters: SdkReferenceParameter[]
  returnForm: 'AsyncGenerator' | 'Promise' | 'value'
  signature: string
}

export type SdkReferenceClient = {
  conditionalScopes: string[]
  helpers: SdkReferenceHelper[]
  name: string
  operationCount: number
  operations: SdkReferenceOperation[]
  scopes: string[]
  slug: string
  tags: string[]
  title: string
}

export type SdkReference = {
  schemaVersion: number
  package: {
    name: string
    node: string
    sourceCommit: string
    version: string
  }
  sources: Record<string, string>
  summary: {
    clientCount: number
    helperCount: number
    operationCount: number
  }
  clientOptions: Array<{ name: string; optional: boolean; type: string }>
  clients: SdkReferenceClient[]
}

export const sdkReference = sdkReferenceData as unknown as SdkReference

export function sdkClientHref(client: Pick<SdkReferenceClient, 'slug'>) {
  return `/sdk/reference/${client.slug}/`
}

export function sdkMethodAnchor(operation: Pick<SdkReferenceOperation, 'name'>) {
  return `method-${operation.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`
}

export function sdkSearchEntries() {
  return sdkReference.clients.flatMap((client) => [
    {
      area: 'TypeScript SDK',
      category: 'TypeScript SDK',
      description: `${client.operationCount} mapped API operations${client.helpers.length ? ` and ${client.helpers.length} SDK helpers` : ''}.`,
      href: sdkClientHref(client),
      title: `${client.name} client`,
    },
    ...client.operations.map((operation) => ({
      area: 'TypeScript SDK',
      category: 'TypeScript SDK',
      description: `${operation.signature} · ${operation.httpMethod} ${operation.path}`,
      href: `${sdkClientHref(client)}#${sdkMethodAnchor(operation)}`,
      method: operation.httpMethod,
      title: `${client.name}.${operation.name}`,
    })),
    ...client.helpers.map((helper) => ({
      area: 'TypeScript SDK',
      category: 'TypeScript SDK',
      description: helper.signature,
      href: `${sdkClientHref(client)}#helper-${helper.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`,
      title: `${client.name}.${helper.name}`,
    })),
  ])
}
