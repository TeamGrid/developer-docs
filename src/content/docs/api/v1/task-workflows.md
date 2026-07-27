---
title: Task workflows
description: Duplicate, place, reorder, and replace TeamGrid task checklists without lost updates.
---

Task workflow operations model TeamGrid behavior directly instead of exposing storage fields. Every
operation is workspace-bound, rejects internal task-like records, and uses the latest task
revision as a compare-and-set precondition.

## Read and filter tasks

Task reads expose the stable workflow fields needed by integrations without leaking TeamGrid's
storage document. In addition to identity, assignment, project and scheduling fields, responses
include lifecycle timestamps and actor IDs, contact and creator references, duplicate provenance,
comment/file/checklist counts, list order, embedded checklist items, and whether time tracking is
active. Custom-field values remain behind their dedicated scoped endpoint.

`GET /v1/tasks` supports exact filters for archive and completion state plus `assigneeId`,
`contactId`, `groupId`, `listId`, `personalListId`, `projectId`, `serviceId`, `subscriberId`, and
`tagId`. Filters are combined and always applied inside the credential's workspace and owning
region. A client cannot supply or override a workspace selector.

```bash
curl "$TEAMGRID_API_BASE_URL/v1/tasks?projectId=$PROJECT_ID&tagId=$TAG_ID&completed=false" \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN"
```

## Duplicate a task

`POST /v1/tasks/{id}/duplicate` creates one idempotent copy of exactly the selected source
revision. It requires `tasks:read`, `tasks:write`, `If-Match`, and `Idempotency-Key`.

```bash
curl --request POST "$TEAMGRID_API_BASE_URL/v1/tasks/$TASK_ID/duplicate" \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header "Content-Type: application/json" \
  --header "Idempotency-Key: onboarding-copy-42" \
  --header "If-Match: $TASK_ETAG" \
  --data '{"name":"Onboarding copy","copyChecklist":true,"copyCustomFieldValues":true}'
```

Checklist and custom-field values are copied by default and can be disabled independently. The new
task is incomplete, receives its own ID and revision, and is appended to the corresponding
assignment, project-list, and valid personal-list containers. The response is `201` for the first
creation or `200` for an exact replay.

## Move or reorder a task

`POST /v1/tasks/{id}/move` changes assignment and ordering atomically. Select one axis:

| Axis | Required target | Order field managed by TeamGrid |
| --- | --- | --- |
| `assignee` | Optional `assigneeId` or `groupId`; they are mutually exclusive | Assignee/group board order |
| `personalList` | `assigneeId` and a personal list owned by that user | Personal-list order |
| `projectList` | `projectId`; optional list must belong to that project | Project-list order |

Omit both neighbors to append. Supply `previousTaskId`, `nextTaskId`, or both for an exact
insertion point. Neighbor IDs must refer to active tasks in the same workspace, completion state,
axis, and target container. Stale or contradictory neighbors produce a conflict rather than a
best-effort move.

```json
{
  "axis": "projectList",
  "projectId": "project-id",
  "listId": "review-list-id",
  "previousTaskId": "task-before",
  "nextTaskId": "task-after"
}
```

Moving to another project validates the target project, list relationship, transition state, and
the credential principal's access to both source and target context.

## Replace a checklist

TeamGrid subtasks are ordered checklist items embedded in a task. They are not independent task
resources. `PUT /v1/tasks/{id}/subtasks` therefore replaces the complete checklist atomically:

```json
{
  "subtasks": [
    { "id": "existing-item-id", "title": "Review draft", "completed": true },
    { "title": "Obtain approval", "completed": false }
  ]
}
```

Keep an existing item ID to preserve its identity. Omit the ID for a new item. The request accepts
at most 500 unique items, preserves array order, trims titles, and rejects empty or oversized
content. An empty array clears the checklist.

## Concurrency sequence

1. Read the task and retain its strong `ETag`.
2. Send one workflow operation with that value as `If-Match`.
3. Retain the new ETag from the successful response.
4. Use the new value for the next operation.
5. On `412`, re-read and reconcile; never remove the precondition.

MCP intentionally does not expose these writes. Use the API, SDK, or CLI when a workflow changes
TeamGrid data.
