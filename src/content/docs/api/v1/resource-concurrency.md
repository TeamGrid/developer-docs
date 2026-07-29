---
title: Resource concurrency
description: Prevent lost updates with API v1 strong ETags and required If-Match preconditions.
owner: Developer Platform
reviewedAt: 2026-07-29
---

API v1 uses explicit optimistic concurrency for protected writes. Read the resource, retain the
strong `ETag` response header, and send that value unchanged as `If-Match` with the mutation.
Never derive an ETag from an ID, timestamp, or another resource.

## Projects, tasks, and project templates

The `1.0.0` contract exposes `developerRevision` and `developerUpdatedAt` on projects, tasks,
and project templates. Their item reads and synchronous mutation responses include a strong ETag
and `Cache-Control: private, no-store, no-transform`.

Exactly 18 core mutations require `If-Match`:

| Resource | Protected mutations |
| --- | --- |
| Projects | Update, replace sharing, complete, reopen, archive, and restore |
| Tasks | Update, duplicate, move, replace checklist, archive, restore, complete, and reopen |
| Project templates | Update, archive, restore, and instantiate |

Project lifecycle commands and template instantiation are asynchronous. Their accepted operation
contains the immutable `sourceRevision`; a successful terminal operation contains
`resultRevision`. Operation reads created before revision tracking return `410` rather than
silently weakening the concurrency guarantee.

```bash
project=$(teamgrid projects get "$PROJECT_ID" --output json)
revision=$(printf '%s' "$project" | jq -er '.attributes.developerRevision')

teamgrid projects update "$PROJECT_ID" \
  --data '{"name":"Reviewed project"}' \
  --if-match "prj1-$revision"
```

The SDK also accepts the strong ETag returned in transport metadata:

```ts
const task = await teamgrid.tasks.get('task-id')
await teamgrid.tasks.update(
  task.data.id,
  { name: 'Reviewed task' },
  { ifMatch: task.transport.headers.etag },
)
```

Duplication also requires an idempotency key because it creates a new resource. Its precondition is
the exact source revision, so retrying the same request cannot silently copy a newer task:

```ts
await teamgrid.tasks.duplicate(
  task.data.id,
  { copyChecklist: true, name: 'Reviewed task copy' },
  {
    idempotencyKey: 'review-copy-2026-07-27',
    ifMatch: task.transport.headers.etag,
  },
)
```

After a successful mutation, retain the newly returned ETag before making another change. Do not
reuse the pre-mutation validator.

## Other protected resources

Another 34 operations retain their domain-specific compare-and-set contracts:

| Resource family | Protected mutations |
| --- | ---: |
| Appointments and absences | 6 |
| Comments | 2 |
| Documents and files | 6 |
| Custom-field values | 2 |
| Planned work | 1 |
| Members, invitations, roles, and groups | 8 |
| Service-account resource grants | 1 |
| Time-entry billing | 1 |
| Automation definitions and runs | 4 |
| Workspace settings | 1 |
| Webhook configuration and secret rotation | 2 |

Revision formats are intentionally resource-specific. Always use the validator returned by the
corresponding read operation.

## Failure contract

| Status and code | Meaning | Action |
| --- | --- | --- |
| `400 invalid_precondition` | The validator is malformed, weak, duplicated, or belongs to another resource contract | Correct the request using the latest endpoint response |
| `412 precondition_failed` | The resource changed after it was read | Re-read, reconcile, and retry only after a new decision |
| `428 precondition_required` | A protected mutation omitted `If-Match` | Read the resource and send its latest strong validator |
| `503 service_unavailable` | The owning cell cannot currently prove the concurrency contract | Keep the precondition and retry later with bounded backoff |

Never respond to `412` or `503` by removing `If-Match`. This safety model is qualified per
production cell and the API readiness check remains closed when resource concurrency cannot be
proven.
