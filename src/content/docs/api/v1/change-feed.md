---
title: Change feed and synchronization
description: Build race-free, resumable TeamGrid synchronization with cell-local metadata changes and opaque checkpoints.
---

`GET /v1/changes` is the API v1 synchronization primitive. It reports ordered metadata about
public resource changes in the authenticated workspace's current cell. It is not a data export and
does not replace the normal resource endpoints.

The operation requires `changes:read`. A change event contains only:

- a stable event ID and cell-local sequence;
- `created`, `updated`, or `deleted`;
- the public resource type and resource ID;
- occurrence time, region, and a tombstone flag.

It never includes the changed document, field values, workspace ID, internal collection name,
credential ID, or change-stream resume token. Fetch the current resource through its API v1
endpoint after a create or update. Remove or reconcile local state for a tombstone.

The current feed covers call notes, contacts, contact groups, custom-field definitions, lists,
products, product groups, projects, project statements, services, tags, tasks, and time entries.

## Race-free initial synchronization

Do not take a full snapshot and only then create a checkpoint. A write between those two steps
would be missing from both views. Take the checkpoint first:

1. Choose the final `operations` and `resourceTypes` filters.
2. Request `GET /v1/changes?startAtLatest=true` with those filters. The response is empty; durably
   store `meta.page.nextCursor`.
3. Read the required resources through their normal cursor-paginated endpoints and commit the full
   snapshot.
4. Request `/v1/changes` with the stored cursor and exactly the same filters.
5. Apply each event idempotently. Persist the returned `nextCursor` only after the corresponding
   local changes are durable.
6. Continue catch-up until `meta.page.caughtUp` is `true`, then start the next poll on your own
   bounded schedule.

Changes committed while the snapshot is running are after the initial checkpoint and are therefore
observed during catch-up. The feed can contain multiple events for one resource. Build consumers
around current resource state and idempotent event IDs instead of assuming one delivery per business
action.

```bash
curl --get 'https://api.de.teamgrid.app/v1/changes' \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --data-urlencode 'startAtLatest=true' \
  --data-urlencode 'resourceTypes=project' \
  --data-urlencode 'resourceTypes=task'
```

After completing the project and task snapshots:

```bash
curl --get 'https://api.de.teamgrid.app/v1/changes' \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --data-urlencode "cursor=$CHECKPOINT" \
  --data-urlencode 'resourceTypes=project' \
  --data-urlencode 'resourceTypes=task'
```

## Cursor boundary

Treat `meta.page.nextCursor` as an opaque checkpoint. Unlike ordinary list cursors, the change-feed
cursor is always present, including on an empty page. `meta.page.caughtUp` is the authoritative
fixed-watermark completion signal. A page with `caughtUp: false` is always full and requires another
request with `nextCursor`; a `caughtUp: true` page may be full, partially full, or empty. Never infer
completion only from `data.length`, because writes may be filtered or a full page may exactly reach
the watermark. Keep the cursor from the final caught-up page for the next poll.

A cursor is bound to all of the following:

- the exact service credential and workspace;
- the TeamGrid cell and its current continuity epoch;
- the operation and resource-type filter set.

Do not decode, edit, share, or move a cursor between credentials or regional endpoints. Reordering
the same filter values is accepted, but changing the effective filter set requires a new checkpoint
and a corresponding full snapshot. Credential rotation likewise requires a new bootstrap because a
cursor signed for the old credential is intentionally unusable by the new one.

## Retention and recovery

Change history is retained for 90 days. Poll substantially more often than that and alert on a stale
checkpoint.

| Response | Meaning | Consumer action |
| --- | --- | --- |
| `400` | Cursor syntax, filter set, or parameter combination is invalid | Fix the request; do not retry it unchanged |
| `410` | History expired, the cell/epoch changed, or continuity cannot be proven | Discard the cursor, create a new latest checkpoint, run a full snapshot, then catch up |
| `503` | The cell-local capture worker or its compaction health is temporarily unavailable | Keep the cursor and retry later with bounded exponential backoff |

Never convert `410` into an empty successful page. It is an explicit full-resynchronization signal.
Do not discard a valid checkpoint for `503`; the service is failing closed so that consumers cannot
mistake an unproven gap for an empty result.

## Multi-region behavior

The feed is produced and read inside the same cell as the workspace data. There is no global merge,
cross-region cursor, or redirect. The credential's regional routing hint selects the ingress; the
cell still authenticates the complete credential and cursor. A cell or epoch continuity change can
invalidate the old boundary with `410`. If a workspace move also replaces the regional credential,
the old credential or its cursor can instead fail authentication or cursor validation. In every
case, bootstrap with the replacement credential against its derived regional endpoint; never try to
translate an old cursor.

The `region` attribute is diagnostic metadata. Do not use it to override credential routing or to
infer a globally sortable sequence: sequence numbers are meaningful only inside their cell epoch.
