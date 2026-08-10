---
title: SDK client configuration
description: Configure regional routing, timeouts, retries, response limits, cancellation, and transport metadata for the TeamGrid TypeScript SDK.
owner: Developer Platform
reviewedAt: 2026-08-10
---

Create one `TeamGridClient` with an explicit credential. The client validates the credential's
location hint and selects the owning regional API endpoint before it sends a request.

```ts
import { TeamGridClient } from '@teamgrid/api-client'

const client = new TeamGridClient({
  token: process.env.TEAMGRID_API_TOKEN!,
  retries: 2,
  timeoutMs: 30_000,
})
```

The SDK does not open a browser, read TeamGrid CLI profiles, or discover a token from disk. Load a
personal credential from the environment for a developer-owned local script. Load a service
credential from a secret manager for a deployed, shared, or scheduled process.

## `TeamGridClientOptions`

The following constructor surface is taken from `@teamgrid/api-client@1.0.6`:

| Option | Type | Required | Default and behavior |
| --- | --- | --- | --- |
| `token` | `string` | Yes | No default. Parsed only for routing and credential identity; it is not exposed by the client. |
| `baseUrl` | `string` | No | Overrides regional endpoint construction. Intended for an explicit trusted endpoint such as a local test server. |
| `apiRootDomain` | `string` | No | Changes only the root domain used with the region parsed from the credential. Ignored when `baseUrl` is set. |
| `fetch` | `typeof globalThis.fetch` | No | Uses the runtime Fetch implementation. Injection is useful for controlled tests and transport instrumentation. |
| `timeoutMs` | `number` | No | `30_000`. Values are truncated to whole milliseconds and constrained to at least 1 ms. |
| `retries` | `number` | No | `2`. Values are constrained to 0–5 retries. Retry eligibility still depends on method and idempotency. |
| `maxResponseBytes` | `number` | No | 8 MiB. Values are constrained to 1 KiB–64 MiB. Export downloads use their separate caller-selected bound and never exceed 50 MiB. |
| `random` | `() => number` | No | Uses `Math.random`. Primarily an injection point for deterministic retry-jitter tests. |
| `sleep` | `(milliseconds, signal?) => Promise<void>` | No | Uses an abort-aware timer. Primarily an injection point for tests. |

Do not set `baseUrl` merely to choose Germany or the United States. A valid credential already
contains its region and cell hint. Region-specific routing prevents an integration from silently
reading a different cell.

## Request options

Read methods accept `RequestOptions` directly or through a more specific list options type:

```ts
type RequestOptions = {
  requestId?: string
  signal?: AbortSignal
}
```

Pass a stable request ID when you need to correlate application logs with TeamGrid support data.
Use an `AbortSignal` for caller-driven cancellation; the SDK combines it with its own timeout.

```ts
const controller = new AbortController()
const deadline = setTimeout(() => controller.abort(), 5_000)

try {
  const task = await client.tasks.get('task-id', {
    requestId: 'sync-task-42-attempt-1',
    signal: controller.signal,
  })
  console.log(task.data.attributes.name)
} finally {
  clearTimeout(deadline)
}
```

Creates and retry-safe asynchronous starts accept `MutationOptions`:

```ts
type MutationOptions = RequestOptions & {
  idempotencyKey?: string
}
```

Several update and lifecycle methods require a resource-specific options type containing
`ifMatch`. Obtain that revision or ETag from a fresh read; never invent it and never use a wildcard.

## Retry policy

The client considers only `429`, `502`, `503`, and `504` transient. Delays are bounded to 30
seconds and respect a valid `Retry-After` response header.

- GET requests can be retried.
- POST requests are retried only when they carry an idempotency key.
- Planned-work PUT requests are retried only with both their idempotency key and strong
  compare-and-set precondition.
- Other PUT, PATCH, and DELETE requests are not retried automatically.
- Redirects are never followed.

Retries do not resolve a `412 Precondition Failed`. Re-read the resource, reconcile the fields your
integration owns, then submit a new compare-and-set mutation.

## Response and transport metadata

Successful JSON envelopes have a non-enumerable `transport` property. This keeps normal JSON
serialization stable while making operational metadata available to application code.

```ts
const result = await client.tasks.get('task-id')

console.log(result.meta.requestId)
console.log(result.transport.status)
console.log(result.transport.attempts)
console.log(result.transport.headers.etag)
console.log(result.transport.rateLimit)
```

Transport metadata includes the HTTP status, response headers, number of attempts, rate-limit
information, retry timing, and idempotency replay state where the server provides them. Do not log
entire response objects when they may contain personal, financial, file-transfer, or reveal-once
credential data.

## Routing overrides for tests

An explicit local endpoint must still end in `/v1` and pass the client's URL safety validation:

```ts
const local = new TeamGridClient({
  token: testCredential,
  baseUrl: 'http://127.0.0.1:2201/v1',
})
```

Use `baseUrl` only with an endpoint you control. The SDK sends the bearer credential to that
endpoint. See [testing and mocking](/sdk/testing-and-mocking/) for transport injection without a
network listener.

## Related reference

- [All 50 resource clients and 210 operation methods](/sdk/reference/)
- [Pagination and error handling](/sdk/pagination-and-errors/)
- [Regional endpoint behavior](/api/v1/regions/)
- [Resource concurrency](/api/v1/resource-concurrency/)
- [Authentication by environment](/resources/authentication-by-environment/)
