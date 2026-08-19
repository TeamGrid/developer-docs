---
title: Change feed
description: Build durable cell-local mirrors with opaque checkpoints and bounded catch-up reads.
owner: Developer Platform
reviewedAt: 2026-08-19
---

`GET /v1/changes` is the durable metadata-only synchronization feed for API v1. It requires
`changes:read` plus the read scopes and resource grants for every requested domain. The contract
covers 24 resource types and reports created, updated, archived, restored, or deleted identities
without embedding a private resource snapshot.

Each page returns an opaque `nextCursor` and a `caughtUp` flag. Persist the cursor only after the
corresponding page has been applied durably. A cursor is bound to the credential principal,
workspace, cell, epoch, and exact filter set. Do not decode it, move it between regions, or reuse it
with different resource or operation filters.

```bash
checkpoint=$(teamgrid changes checkpoint --resource-type task --output json \
  | jq -er '.meta.page.nextCursor')

teamgrid changes list \
  --cursor "$checkpoint" \
  --resource-type task \
  --all \
  --output jsonl
```

## Snapshot-then-catch-up

A new mirror must avoid the gap between its initial traversal and its first incremental read:

1. Request a latest checkpoint with the exact intended filters.
2. Traverse the normal resource endpoints and persist the authoritative current state.
3. Read changes from the saved checkpoint until `caughtUp` is true.
4. Continue polling from the last durably applied `nextCursor`.

The SDK implements this order through `changes.snapshotThenCatchUp()`. It takes the checkpoint
before invoking the caller's snapshot function and includes the terminal empty page so the newest
cursor is never lost.

```ts
const bootstrap = await teamgrid.changes.snapshotThenCatchUp(
  async () => loadInitialTasks(),
  { resourceTypes: ['task'] },
)

await saveSnapshot(bootstrap.snapshot)
for await (const page of bootstrap.pages) {
  await applyChangesAndCursor(page.data, page.meta.page.nextCursor)
}
```

Change events are invalidation metadata. After an update, read the resource through its normal
endpoint when the mirror needs the latest authorized fields. A tombstone signals that the
credential can no longer retrieve the previous state; consumers must remove or re-evaluate their
local copy.

## Recurring-task reconciliation

Request `resourceTypes=taskRecurrence` with `changes:read`, `task-recurrences:read`, and
`tasks:read` to reconcile recurrence series. Definition changes, lifecycle transitions, ownership
changes, rechecks that change series state, and removal from tasks appear as updates to the series
identity. Follow the event with `GET /v1/task-recurrences/{id}` to obtain the authorized current
definition and lifecycle state.

Generated tasks remain ordinary `task` resources and must be included separately when the mirror
needs them. Occurrence-ledger rows, preview results and asynchronous operation resources are not
change-feed resource types; inspect them through their bounded recurrence endpoints. In
particular, a remove-from-tasks update tells a consumer to re-read the ended series. Its historical
occurrences then expose `cardId: null` plus `detachedCardId`, `detachedAt`, and `detachedBy`.

## Recovery and boundaries

Expired, compacted, wrong-cell, wrong-filter, or otherwise invalid checkpoints fail explicitly.
Start a new snapshot-then-catch-up cycle instead of guessing a position. The owning cell also
closes readiness when capture, preimage, epoch, or recovery guarantees cannot be proven.

Signed webhooks remain useful for low-latency notifications, while the change feed provides ordered
catch-up and reconciliation. Audit events, webhook delivery history, search results, and aggressive
polling are not substitutes for this contract.

The change feed remains forbidden through MCP because it is a high-volume synchronization
transport rather than a bounded interactive model tool. Use the API, SDK, or CLI.
