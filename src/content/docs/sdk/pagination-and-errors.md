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

## Change-feed bootstrap and catch-up

The change feed has a distinct cursor contract: it always returns a checkpoint. Use the helper to
take that checkpoint before the full snapshot and receive a bounded catch-up iterator afterward:

```ts
const bootstrap = await client.changes.snapshotThenCatchUp(
  async () => {
    const projects = []
    for await (const page of client.projects.pages()) projects.push(...page.data)
    return projects
  },
  {
    operations: ['created', 'updated', 'deleted'],
    resourceTypes: ['project'],
  },
  { maxPages: 1_000 },
)

await replaceProjectSnapshot(bootstrap.snapshot)

for await (const page of bootstrap.pages) {
  await applyChangeMetadata(page.data)
  await saveCheckpoint(page.meta.page.nextCursor)
}
```

`changes.list()` performs one poll. `changes.checkpoint()` is the typed convenience for
`startAtLatest=true`; its checkpoint is `meta.page.nextCursor`. `changes.pages()` performs a
bounded catch-up traversal and stops only when `meta.page.caughtUp` is true, with repeated-cursor
and maximum-page guards. A full page can already be caught up, and an empty event set is not a
substitute for the flag. Keep the same resource and operation filters for the life of a checkpoint.

`410 change_feed_reset_required` and `503 change_feed_unavailable` remain ordinary
`TeamGridApiError` responses. For `410`, create a new checkpoint and repeat the full snapshot. For
`503`, retain the last durable cursor and retry later; safe GET retry policy still applies.

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

## Reconcile a concurrent change

`TeamGridApiError` with status `412` means the supplied revision is stale. Re-read and make the
merge decision in application code:

```ts
try {
  await client.projects.update(projectId, intendedPatch, {
    ifMatch: previouslyReadProject.attributes.developerRevision,
  })
} catch (error) {
  if (!(error instanceof TeamGridApiError) || error.status !== 412) throw error

  const current = await client.projects.get(projectId)
  const reconciledPatch = reconcileProjectChange(current.data, intendedPatch)
  await client.projects.update(projectId, reconciledPatch, {
    ifMatch: current.data.attributes.developerRevision,
  })
}
```

Only perform the second update when `reconcileProjectChange` can preserve both the server change
and the caller's intent. A `428` is a caller error: read first and supply `ifMatch`.
`400 invalid_precondition` indicates an invalid or wrong-type ETag. A `503` means the owning cell
cannot currently prove the revision contract; retain the precondition and retry later.
`410 resource_operation_revision_unavailable` applies to an old asynchronous operation and
requires a fresh resource read, not another status poll.

When an asynchronous mutation is accepted, bind subsequent polls to that response:

```ts
const accepted = await client.projects.complete(projectId, {
  idempotencyKey: 'complete-project-42',
  ifMatch: project.data.attributes.developerRevision,
})

const terminal = await client.projectLifecycleOperations.wait(accepted.data.id, {
  acceptedOperation: accepted.data,
  maxWaitMs: 120_000,
})
```

The SDK rejects a poll whose operation ID, action, project, or `sourceRevision` differs from the
accepted operation. Project-template instantiation similarly binds the operation ID, template,
generated project, and source revision. CLI `--wait` supplies the acceptance binding automatically.
