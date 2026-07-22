---
title: Resource concurrency in Beta 2
description: Understand which API v1 writes use If-Match and why projects, tasks, and project templates use a static non-CAS contract in Beta 2.
---

API v1 uses endpoint-specific concurrency rules. Do not assume that every mutable resource accepts
the same revision format or that every write supports `If-Match`.

The `1.0.0-beta.2` contract deliberately keeps the 25 static core operations for projects, tasks,
project templates, project lifecycle operations, and template instantiations outside the new
resource-CAS rollout. These resources do not expose `developerRevision` or `developerUpdatedAt`,
their operations do not carry `resource-cas-v1` extensions, and their mutations do not accept
project-, task-, or template-specific `If-Match` headers.

This is a release boundary, not a general promise that concurrent writes are merged. When two
clients update the same core resource, callers must not rely on a public optimistic-concurrency
precondition in Beta 2. Keep writes narrow, avoid parallel writers for the same object, and re-read
the resource after a mutation when subsequent work depends on its current state.

## Static core operations

The 25 static core operations comprise:

| Resource | Operations |
| --- | --- |
| Projects | List, get, create, update, complete, reopen, archive, and restore |
| Project lifecycle operations | Get operation status |
| Project templates | List, get, create, update, archive, restore, and instantiate |
| Template instantiations | Get instantiation status |
| Tasks | List, get, create, update, archive, restore, complete, and reopen |

Project lifecycle commands and template instantiation remain asynchronous. Their start requests
use a stable `Idempotency-Key` for safe replay, and clients poll the returned operation ID. The
operation representations no longer expose the retired core `sourceRevision` or `resultRevision`
fields. Task timer commands and planned-work endpoints are separate contracts and are not part of
this 25-operation set.

## Independent preconditions remain

Beta 2 retains exactly 31 independent `If-Match` operations. They protect their own resource
families and were not part of the retired core resource-CAS rollout:

| Resource family | Protected mutations |
| --- | ---: |
| Appointments and absences | 6 |
| Comments | 2 |
| Documents and files | 6 |
| Custom-field values | 2 |
| Planned work | 1 |
| Members, invitations, roles, and groups | 8 |
| Automation definitions and runs | 4 |
| Workspace settings | 1 |
| Webhook secret rotation | 1 |

For one of these operations, read the corresponding resource first and use exactly the revision or
strong ETag specified by that endpoint. Revision formats are resource-specific. Never turn a task,
project, or project-template ID or timestamp into an ETag, and never reuse a revision from another
resource family.

For example, planned-work replacement keeps its own compare-and-set contract:

```bash
current=$(teamgrid planned-work get "$TASK_ID" --output json)
revision=$(printf '%s' "$current" | jq -er '.attributes.revision')

teamgrid planned-work replace "$TASK_ID" \
  --data @schedule.json \
  --if-match "$revision" \
  --idempotency-key "schedule-${TASK_ID}-v1" \
  --yes
```

## Failure contract for protected operations

The independent `If-Match` operations use the following failure contract:

| Status and code | Meaning | Action |
| --- | --- | --- |
| `400 invalid_precondition` | The supplied validator is malformed, weak, duplicated, or belongs to the wrong resource contract | Correct the request using the latest endpoint response |
| `412 precondition_failed` | The protected resource no longer matches the supplied revision | Re-read, reconcile, and retry only after a new decision |
| `428 precondition_required` | A protected operation omitted `If-Match` | Read the resource and send its latest documented revision or strong ETag |
| `503 service_unavailable` | The owning cell cannot currently prove that endpoint's concurrency contract | Keep the precondition and retry later with bounded backoff |

Never respond to `412` or `503` by removing `If-Match`. Conversely, do not send `If-Match` to a
static project, task, or project-template mutation: it is not part of the Beta 2 contract and the
official SDK and CLI intentionally do not expose such an option for those operations.

## Future core concurrency releases

Core CAS can be introduced in a later contract checkpoint after its cell-local revision writes,
backfill, cutover, enforcement, rollback, and application compatibility have been qualified
separately. That release will update OpenAPI and the official packages together. Integrations
should follow the contract they have pinned instead of reserving or synthesizing core revision
headers in advance.
