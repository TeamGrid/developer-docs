---
title: SDK integration recipes
description: Build production-oriented TeamGrid SDK flows for service jobs, task synchronization, exports, and asynchronous lifecycle operations.
owner: Developer Experience
reviewedAt: 2026-08-16
---

These recipes show complete control flow around the SDK methods. Replace placeholder IDs and
application functions, and provision only the scopes linked from each method's
[reference entry](/sdk/reference/).

## Run a least-privilege service job

Use a service-account credential for shared, scheduled, or deployed code. The process should read
it from its secret manager, never from a CLI profile.

```ts
import { TeamGridClient } from '@teamgrid/api-client'

const client = new TeamGridClient({
  token: process.env.TEAMGRID_API_TOKEN!,
  timeoutMs: 20_000,
})

for await (const page of client.tasks.pages(
  { completed: false, projectId: process.env.TEAMGRID_PROJECT_ID!, limit: 200 },
  { maxPages: 25 },
)) {
  await persistTaskPage(page.data)
  console.log('TeamGrid request', page.meta.requestId)
}
```

This read-only job needs `tasks:read` plus access to the selected project. Set `maxPages` from a
documented workload bound; do not silently turn an unexpectedly broad query into an unbounded job.

## Create a Markdown task description safely

Task descriptions are dual-format. Existing and unmarked descriptions are literal `plain-text`;
Markdown is enabled only by sending `descriptionFormat: 'markdown-v1'` with the description. The
SDK transports the value without rewriting it:

```ts
const created = await client.tasks.create(
  {
    name: 'Prepare release',
    description: '# Acceptance criteria\n\n- Staging verified\n- Release notes ready',
    descriptionFormat: 'markdown-v1',
  },
  { idempotencyKey: 'prepare-release-2026-08-16' },
)

console.log(created.data.attributes.descriptionFormat) // markdown-v1
```

Omit `descriptionFormat` when sending literal text; TeamGrid stores it as `plain-text`. For an
update, read the task first and pass its strong ETag as `ifMatch`. Send `description` and
`descriptionFormat` together, and do not promote existing plain text to Markdown merely because it
contains Markdown-like punctuation.

## Verify or revoke the exact current credential

Credential context needs no additional scope, so even a narrowly scoped integration can verify its
own immutable routing and lifecycle metadata:

```ts
const context = await client.authorization.getContext()

console.log({
  credentialId: context.data.id,
  kind: context.data.attributes.kind,
  region: context.data.attributes.region,
  cellId: context.data.attributes.cellId,
  expiresAt: context.data.attributes.expiresAt,
})
```

At an explicit decommissioning boundary, permanently revoke exactly the bearer credential used by
the client:

```ts
await client.authorization.revokeCurrentCredential()
```

After the confirmed `204`, the same client credential is invalid and a retry is expected to receive
`401`. Do not delete the secret-manager record before TeamGrid confirms revocation; otherwise a
network failure can leave a valid credential whose identity is no longer recoverable locally.

## Bootstrap and catch up a task mirror

Take a change-feed checkpoint immediately before the snapshot. The returned catch-up iterator
then covers changes that happened while the snapshot was running.

```ts
const bootstrap = await client.changes.snapshotThenCatchUp(
  async () => {
    for await (const page of client.tasks.pages(
      { projectId: 'project-id', limit: 200 },
      { maxPages: 100 },
    )) {
      await upsertCurrentTasks(page.data)
    }
    return { completedAt: new Date().toISOString() }
  },
  { resourceTypes: ['task'], limit: 200 },
)

await saveCheckpoint(bootstrap.checkpoint)

for await (const page of bootstrap.pages) {
  for (const change of page.data) {
    await refreshOrRemoveCurrentTask(change)
  }
  await saveCheckpoint(page.meta.page.nextCursor)
}
```

Persist a page's next cursor only after its changes have been committed. The cursor is opaque and
bound to the credential, workspace, cell, epoch, and exact filters. A `410` means the checkpoint
can no longer be resumed: take a new checkpoint and rebuild the snapshot.

Change events are synchronization signals, not permanent copies of task content. Re-read current
resources and apply an explicit deletion/tombstone policy.

## Create and download a bounded time-entry export

Large reports use an asynchronous export job followed by a reveal-once download intent. The SDK
sends that intent in a header and returns bounded CSV bytes; it does not expose a storage URL.

```ts
import { createWriteStream } from 'node:fs'
import { Writable } from 'node:stream'

const created = await client.exports.create({
  resourceType: 'timeEntries',
  updatedFrom: '2026-07-01T00:00:00.000Z',
  updatedUntil: '2026-08-01T00:00:00.000Z',
  fields: ['id', 'userId', 'taskId', 'start', 'end', 'durationMinutes'],
  fileName: 'time-entries-2026-07.csv',
  maxRows: 100_000,
}, {
  idempotencyKey: 'time-entries-2026-07-v1',
})

let job = await client.exports.get(created.data.id)
while (['queued', 'retrying', 'running'].includes(job.data.attributes.state)) {
  await new Promise((resolve) => setTimeout(resolve, 2_000))
  job = await client.exports.get(created.data.id)
}

if (job.data.attributes.state !== 'succeeded') {
  throw new Error(`TeamGrid export failed: ${job.data.attributes.failure?.code ?? 'unknown'}`)
}

const intent = await client.exports.createDownloadIntent(job.data.id)
const csv = await client.exports.downloadStream(job.data.id, {
  intentToken: intent.data.attributes.token,
  maxBytes: 20 * 1024 * 1024,
})

await csv.data.pipeTo(Writable.toWeb(createWriteStream(
  'time-entries-2026-07.csv',
  { flags: 'wx', mode: 0o600 },
)))
```

Keep the download intent out of logs and queues. Check `job.data.attributes.truncated` before
publishing a report, and place exported personal or commercial data in access-controlled storage
with an explicit retention period. `downloadStream` verifies safe response headers, bounds both an
advertised `Content-Length` and bytes actually received, and cancels upstream work when the caller
cancels the one-shot stream. Always consume or cancel it. Use `exports.download` only when the
selected ceiling is small enough to buffer safely in memory.

## Complete a project and wait safely

Project completion is asynchronous. Read the latest project, start the lifecycle operation with
its ETag and a stable idempotency key, then bind polling to the accepted operation:

```ts
const project = await client.projects.get('project-id')
const accepted = await client.projects.complete(project.data.id, {
  ifMatch: project.transport.headers.etag,
  idempotencyKey: `complete-${project.data.id}-v1`,
})

const finished = await client.projectLifecycleOperations.wait(accepted.data.id, {
  acceptedOperation: accepted.data,
  maxWaitMs: 60_000,
  pollIntervalMs: 1_000,
})

if (finished.data.attributes.state !== 'succeeded') {
  throw new Error(`Project completion ended in ${finished.data.attributes.state}`)
}
```

Passing `acceptedOperation` makes the helper verify that every poll retains the accepted operation
identity, action, and target. A `412` from the start call means the project changed after the read;
re-read and reconcile it instead of retrying with a stale validator.

## Handle typed API and client errors

```ts
import { TeamGridApiError, TeamGridClientError } from '@teamgrid/api-client'

try {
  await runIntegration()
} catch (error) {
  if (error instanceof TeamGridApiError) {
    console.error({
      status: error.status,
      requestId: error.requestId,
      retryAfterMs: error.retryAfterMs,
      codes: error.errors.map(({ code }) => code),
    })
  } else if (error instanceof TeamGridClientError) {
    console.error({ code: error.code, message: error.message })
  } else {
    throw error
  }
}
```

Log identifiers and stable codes, not bearer credentials, webhook secrets, transfer capabilities,
or entire sensitive payloads. See [pagination and errors](/sdk/pagination-and-errors/) for recovery
rules.
