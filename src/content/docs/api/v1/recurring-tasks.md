---
title: Recurring tasks
description: Create advanced task series, preview schedules, manage immutable versions, override occurrences, and recover asynchronous operations.
owner: Developer Experience
reviewedAt: 2026-08-18
---

Recurring tasks are task automation, not calendar appointments. A recurrence series owns an
immutable sequence of definition versions. Each definition contains a safe task template and a
deterministic policy. Evaluating that policy creates occurrence-ledger entries; materialization
creates ordinary TeamGrid tasks with read-only recurrence provenance.

## Choose scopes and ownership

Read operations require `task-recurrences:read` and `tasks:read`. Definition and lifecycle writes
require `task-recurrences:write` and `tasks:write`. External trigger submission and recheck use
`task-recurrences:run` plus `tasks:write`. Workspace entitlement, task permissions, sharing,
resource grants and series ownership are enforced in addition to OAuth or credential scopes.

Use a service account for a shared integration and a personal credential for user-owned
automation. A guessed series or occurrence from another workspace remains indistinguishable from
a missing resource.

## Preview before creating

`POST /task-recurrences/preview` validates the complete template, references, policy complexity,
time zone and daylight-saving behavior without creating a series. A small preview returns `200`
and a `taskRecurrencePreview`. A permitted high-cost policy returns `202`, a
`taskRecurrenceOperation`, and its exact polling URL in `Location`.

With the SDK, handle both results explicitly:

```ts
const draft = await client.taskRecurrences.preview({
  count: 20,
  policy,
  template: { name: 'Weekly account review', projectId: 'project-id' },
})

const preview = draft.data.type === 'taskRecurrenceOperation'
  ? await client.taskRecurrenceOperations.wait(draft.data.id)
  : draft
```

Async draft payloads are encrypted and removed after the operation succeeds, fails or is
cancelled. Operation status remains available for a bounded retention period. Poll through the
returned regional client; do not construct a different cell URL.

## Create a series from a task

The safest initial template is an existing task. Supply a stable idempotency key:

```ts
const created = await client.taskRecurrences.create({
  name: 'Weekly account review',
  sourceTaskId: 'task-id',
  policy: {
    candidates: {
      nodeId: 'weekly-review',
      op: 'calendarRule',
      rule: {
        byWeekDay: [1],
        frequency: 'weekly',
        interval: 1,
        startLocal: '2026-08-24T09:00:00',
      },
    },
    conditions: [],
    engineVersion: 'recurrence-v1',
    limits: { maxOccurrences: null, until: null },
    materialization: {
      catchUp: 'latest',
      lead: { unit: 'day', value: 0 },
      overlap: 'defer',
    },
    schemaVersion: 1,
    timeBasis: {
      disambiguation: 'compatible',
      mode: 'wall-clock',
      timeZone: 'Europe/Berlin',
    },
    transforms: [],
  },
}, { idempotencyKey: 'weekly-account-review-v1' })
```

Wall-clock rules preserve local time when UTC offset changes. Choose `earlier`, `later` or `reject`
instead of `compatible` when ambiguous daylight-saving times need an explicit business decision.
Elapsed-time rules preserve duration instead.

The policy AST also supports date and month sets, sequences, unions, intersections, differences,
deduplication, occurrence/project/external events, offsets, business calendars, local-time
mapping, exclusions, limits and conditions. Use the exact OpenAPI schema; unknown fields,
unbounded nesting, duplicate node IDs and unsupported values fail closed.

Calendar rules with impossible month dates default to `invalidDayHandling: "omit"`. Set
`previous-valid-day` or `next-valid-day` only when that movement is the intended business rule.
Duration and offset values are whole numbers. Business-day durations use the referenced working
calendar, holidays and configured absences rather than elapsed 24-hour blocks.

Materialization policy is explicit:

- `catchUp` can be `none`, `latest`, `all`, or `bounded`; `bounded` requires `catchUpLimit` from
  1 through 100.
- `overlap` can be `allow`, `defer`, `skip`, `latest-only`, or `pause-series`.
- `lead` controls how far before the scheduled occurrence the ordinary task is created.

Paused, suspended and attention-required series retain accepted trigger events but do not enter
the active materialization batch. Resume applies the selected catch-up rule; ended and archived
series reject new trigger events. Event ingress/evaluation is bounded to 90 days. The newest-first
search for `latest` and `bounded` catch-up expands through a five-year engine horizon so a stale
series cannot trigger an unbounded foreground scan.

For a completion-relative source, omitting `completionMode` is equivalent to
`first-completion-only`. Reopening and completing the same task does not create another successor.
Set `completionMode: "every-completion-transition"` only when each distinct reopen/complete cycle
must create one successor; transport retries of the same transition remain idempotent.

## Update without rewriting history

Read the series and use its strong ETag for every mutation:

```ts
const current = await client.taskRecurrences.get(created.data.id)
const updated = await client.taskRecurrences.update(
  current.data.id,
  { changeReason: 'Move future reviews to Tuesday', policy: nextPolicy },
  { ifMatch: current.transport.headers.etag! },
)
```

An update creates a new immutable definition. `effectiveFromOccurrenceKey` on version resources
records the first replaced non-materialized occurrence when one exists. Already generated tasks
stay unchanged. The runtime supersedes and deterministically replans only non-materialized
entries. A stale ETag returns `412`; re-read and decide whether to merge.

Use version list/get/restore for audited rollback. Restore creates another new version rather than
mutating the selected historical definition.

## Change only one occurrence

List or preview occurrences to obtain the stable `occurrenceKey`. The occurrence ETag is separate
from the series ETag:

```ts
const occurrence = await client.taskRecurrenceOccurrences.get(seriesId, occurrenceKey)
await client.taskRecurrenceOccurrences.override(
  seriesId,
  occurrenceKey,
  {
    action: 'materialize',
    scheduledForLocal: '2026-09-01T14:30:00',
    templatePatch: { name: 'Special quarterly review' },
  },
  { ifMatch: occurrence.transport.headers.etag! },
)
```

An override can move, skip or safely patch one not-yet-materialized occurrence. Clear the override
to return it to the series plan. Retry only blocked, failed or skipped work after correcting its
cause. A definition change invalidates a stale occurrence mutation rather than applying a new
patch to an old template.

For a future item that is visible in `previewStored` but has no ledger resource yet, use its opaque
`placeholderToken` and the exclusive create precondition. The token is short-lived and bound to
the workspace, series, occurrence key and active immutable definition:

```ts
const preview = await client.taskRecurrences.previewStored(seriesId, { count: 20 })
const future = preview.data.attributes.occurrences[0]
await client.taskRecurrenceOccurrences.override(
  seriesId,
  future.occurrenceKey,
  { action: 'skip', placeholderToken: future.placeholderToken! },
  { createIfMissing: true },
)
```

HTTP callers send `If-None-Match: *` for this create path. Existing occurrences still require
exactly one current `If-Match: "tro1-…"`; sending both headers fails before the internal mutation.

## Lifecycle and recovery

Pause prevents new materialization; resume explicitly revalidates current permissions,
entitlement, owner and references. Archive can be restored only as paused. End is terminal.
Unavailable users, projects, lists, groups, tags, services or custom fields place a series into
`suspended` or `needs_attention` instead of silently changing its task destination.

Recheck returns `202`. Poll or wait for its operation:

```ts
const accepted = await client.taskRecurrences.recheck(seriesId)
const terminal = await client.taskRecurrenceOperations.wait(accepted.data.id, {
  maxWaitMs: 300_000,
  pollIntervalMs: 1_000,
})
```

CLI automation can use the same boundary:

```bash
teamgrid task-recurrences recheck SERIES_ID --wait --output json
teamgrid task-recurrence-operations wait OPERATION_ID --output json
```

## Event-driven series

An `externalEvent` source subscribes a series to an exact `eventType` and optional `sourceId`.
Submit a bounded envelope to `POST /task-recurrences/{id}/events`. `eventId` is the idempotency
identity: replaying the same envelope is safe, while reusing it with different content returns a
conflict. Event timestamps are bounded by the documented retention and future-skew window.

Use signed webhooks for low-latency output notifications and the change feed with
`resourceTypes=taskRecurrence` for durable reconciliation. An event acceptance response means the
trigger is durably queued; it does not promise that its generated task already exists.

## MCP boundary

The MCP server exposes seven bounded read-only recurrence tools for saved series, versions,
stored previews and occurrences. It deliberately excludes unsaved drafts, lifecycle writes,
overrides, retries, event ingress and operation control. Use the API, SDK or CLI for those actions.
