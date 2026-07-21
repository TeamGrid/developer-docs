---
title: Resource revisions and concurrent writes
description: Use strong ETags and If-Match to update TeamGrid projects, tasks, and project templates without losing concurrent changes.
---

Projects, tasks, and project templates use optimistic concurrency control. Every public representation
of these resources contains two concurrency fields:

- `developerRevision` is an opaque, lowercase 64-character revision. Persist and return it unchanged.
- `developerUpdatedAt` is the canonical timestamp at which that developer revision was issued. It is
  not a replacement for the resource's business `updatedAt` field.

Single-resource reads and resource-returning writes also carry a quoted, strong `ETag` header. Its
value is derived from the body revision and is specific to the resource type:

| Resource | Strong ETag form |
| --- | --- |
| Project | `"prj1-<developerRevision>"` |
| Project template | `"tpl1-<developerRevision>"` |
| Task | `"tsk1-<developerRevision>"` |

Treat revisions and ETags as opaque. Do not generate them from `updatedAt`, remove the quotes, change
case, or reuse a tag for another resource type. A direct HTTP mutation accepts exactly one current,
quoted strong ETag in `If-Match`; weak tags, wildcards, unquoted revisions, and comma-separated tag
lists are invalid.

## Read, decide, mutate

Read the resource immediately before making a state-dependent change and retain its `ETag`:

```bash
curl --fail-with-body \
  --dump-header task-headers.txt \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header 'Accept: application/json' \
  https://api.de.teamgrid.app/v1/tasks/TASK_ID \
  --output task.json

TASK_ETAG=$(awk 'BEGIN { IGNORECASE=1 } /^etag:/ { sub(/^[^:]+:[[:space:]]*/, ""); sub(/\r$/, ""); print; exit }' task-headers.txt)

curl --fail-with-body \
  --request PATCH \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header 'Content-Type: application/json' \
  --header "If-Match: $TASK_ETAG" \
  --data '{"name":"Reviewed task name"}' \
  https://api.de.teamgrid.app/v1/tasks/TASK_ID
```

After a successful mutation, replace the stored revision with the new body `developerRevision` and,
when present, the new response `ETag`. Archive endpoints return `204 No Content` and therefore carry
the post-archive revision only in the response `ETag` header.

If the API returns `412 precondition_failed`, another writer changed the resource after your read.
Do not retry the same decision blindly:

1. Read the resource again from the same regional endpoint.
2. Reconcile your intended patch or action with the new representation.
3. If the action is still valid, send a new request with the newly issued ETag.
4. Otherwise, preserve the server state and surface the conflict to the caller.

The SDK and CLI perform format validation, but they do not turn a stale business decision into a safe
automatic retry.

## Mutations covered by resource CAS

The `resource-cas-v1` contract currently covers exactly these 14 mutations:

| Resource | Mutation requiring `If-Match` |
| --- | --- |
| Project | `PATCH /v1/projects/{id}` |
| Project | `POST /v1/projects/{id}/complete` |
| Project | `POST /v1/projects/{id}/reopen` |
| Project | `POST /v1/projects/{id}/archive` |
| Project | `POST /v1/projects/{id}/restore` |
| Project template | `PATCH /v1/project-templates/{id}` |
| Project template | `DELETE /v1/project-templates/{id}` |
| Project template | `POST /v1/project-templates/{id}/restore` |
| Project template | `POST /v1/project-templates/{id}/instantiate` |
| Task | `PATCH /v1/tasks/{id}` |
| Task | `DELETE /v1/tasks/{id}` |
| Task | `POST /v1/tasks/{id}/restore` |
| Task | `POST /v1/tasks/{id}/complete` |
| Task | `POST /v1/tasks/{id}/reopen` |

Other API v1 resources can have their own revision formats and compare-and-set rules. Use the ETag
and `If-Match` definitions on the relevant endpoint rather than substituting a `tsk1`, `prj1`, or
`tpl1` value.

## Asynchronous actions and idempotency

Project complete, reopen, archive, and restore operations and project-template instantiation require
both a current `If-Match` value and a stable `Idempotency-Key`. The accepted operation records the
exact input revision as `sourceRevision`. Replaying the same key is safe only for the same action,
payload, and source revision; changing any of them is an idempotency conflict.

A successful asynchronous operation publishes its resulting resource revision as `resultRevision`.
Pending, running, and failed operations have `resultRevision: null`. A `410
resource_operation_revision_unavailable` response means that the operation predates revision
tracking and can no longer provide a trustworthy status. Re-read the current project or template and
reconcile the intended outcome instead of creating an unguarded replacement operation.

## Failure contract

| Status and code | Meaning | Action |
| --- | --- | --- |
| `400 invalid_precondition` | `If-Match` is malformed, weak, unquoted, duplicated, or for the wrong resource type | Correct the request from the latest server response |
| `410 resource_operation_revision_unavailable` | A legacy asynchronous operation has no trustworthy revision record | Re-read the current resource and reconcile the outcome |
| `412 precondition_failed` | The resource no longer matches the supplied revision | Re-read, reconcile, and retry only with a new decision |
| `428 precondition_required` | A protected mutation omitted `If-Match` | Read the resource and send its latest strong ETag |
| `503 service_unavailable` | The cell cannot currently prove the resource concurrency contract or revision | Keep the precondition and retry later with bounded backoff |

Never handle `503` by dropping `If-Match` or falling back to an unguarded API surface.

## Controlled-beta migration

This behavior is part of the `1.0.0-beta.2` contract checkpoint. Before moving an existing
beta integration to this checkpoint, deploy support for the new response fields and ETags, then make
`If-Match` mandatory in all 14 callers. Do not mix older API v1 writers, which omit the negotiated
resource-CAS contract, with writers targeting this checkpoint during a rollout.

Revisions are issued and checked by the owning cell. Always send the credential and its ETag back to
the credential's regional endpoint; they are not portable between workspaces, cells, or regions.
