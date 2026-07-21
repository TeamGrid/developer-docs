---
title: SDK pagination and errors
description: Traverse TeamGrid cursor pages and handle typed API and client failures.
---

## Async page iteration

```ts
for await (const page of client.tasks.pages({ projectId: 'project-id' })) {
  for (const task of page.data) {
    console.log(task.id)
  }
}
```

The iterator stops when `nextCursor` is `null` and detects a repeated cursor instead of looping forever.

## Error classes

```ts
import { TeamGridApiError, TeamGridClientError } from '@teamgrid/api-client'

try {
  await client.workspace.get()
} catch (error) {
  if (error instanceof TeamGridApiError) {
    console.error(error.status, error.requestId, error.errors)
  } else if (error instanceof TeamGridClientError) {
    console.error(error.code, error.message)
  } else {
    throw error
  }
}
```

`TeamGridApiError` represents an HTTP response from API v1. `TeamGridClientError` represents local validation, routing, timeout, response-size, malformed-response, or network failures.

## Transport metadata

```ts
const response = await client.tasks.list({ limit: 25 })

console.log(response.transport.requestId)
console.log(response.transport.status)
console.log(response.transport.attempts)
console.log(response.transport.rateLimit.remaining)
```

The same immutable `transport` object is available on `TeamGridApiError` and
`TeamGridClientError` whenever an HTTP response was received. It includes normalized response
headers, `retryAfterMs`, and `idempotencyReplayed` when the server supplied those values. The
object never contains the bearer credential or request body.

Neither error class stores the bearer credential. Application logs should still avoid serializing request headers, input payloads, or environment variables.

## Reconcile an independently protected change

For an endpoint with an explicit `ifMatch` option, `TeamGridApiError` with status `412` means the
supplied revision is stale. Re-read and make the merge decision in application code. For example,
custom-field values retain an independent compare-and-set contract:

```ts
try {
  await client.customFieldValues.set(
    'project',
    projectId,
    fieldId,
    { value: intendedValue },
    { ifMatch: previouslyReadValue.attributes.revision },
  )
} catch (error) {
  if (!(error instanceof TeamGridApiError) || error.status !== 412) throw error

  const current = await client.customFieldValues.get('project', projectId, fieldId)
  const reconciledValue = reconcileValue(current.data, intendedValue)
  await client.customFieldValues.set(
    'project',
    projectId,
    fieldId,
    { value: reconciledValue },
    { ifMatch: current.data.attributes.revision },
  )
}
```

Only perform the second update when `reconcileValue` can preserve both the server change
and the caller's intent. A `428` is a caller error: read first and supply `ifMatch`.
`400 invalid_precondition` indicates an invalid or wrong-type ETag. A `503` means the owning cell
cannot currently prove the revision contract; retain the precondition and retry later.

Projects, tasks, and project templates do not return these core concurrency errors in Beta 2 and
their SDK mutation methods do not accept `ifMatch`.

When an asynchronous mutation is accepted, bind subsequent polls to that response:

```ts
const accepted = await client.projects.complete(projectId, {
  idempotencyKey: 'complete-project-42',
})

const terminal = await client.projectLifecycleOperations.wait(accepted.data.id, {
  acceptedOperation: accepted.data,
  maxWaitMs: 120_000,
})
```

The SDK rejects a poll whose operation ID, action, or project differs from the accepted operation.
Project-template instantiation similarly binds the operation ID, template, and generated project.
CLI `--wait` supplies the acceptance binding automatically.
