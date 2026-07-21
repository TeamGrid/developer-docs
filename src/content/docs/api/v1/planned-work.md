---
title: Planned work
description: Read bounded workload windows and atomically replace one task schedule with strong revisions.
---

Planned work exposes the per-day workload assigned to a task and user. Treat it as sensitive
personnel and scheduling data. Listing requires `planned-work:read`, an inclusive `start` and `end`,
and a window no larger than 366 days. Optional `taskId`, `projectId`, and `userId` filters narrow the
result.

```bash
teamgrid planned-work list \
  --start 2026-07-20T00:00:00Z \
  --end 2026-07-27T23:59:59Z \
  --user-id USER_ID --all --output json
```

## Atomic full replacement

`GET /v1/tasks/{id}/planned-work` returns the task's complete current schedule, a strong ETag, and
the same unquoted revision in `data.attributes.revision`. Replacement is a full schedule
replacement, not a patch. It requires `planned-work:write`, exactly one strong `If-Match`, and an
`Idempotency-Key`.

```ts
const current = await client.plannedWork.getForTask(taskId)
const accepted = await client.plannedWork.replaceForTask(
  taskId,
  {
    dayLoads: [480, 240],
    plannedStart: '2026-07-20T00:00:00.000Z',
    plannedEnd: '2026-07-21T23:59:59.999Z',
  },
  {
    idempotencyKey: `schedule-${taskId}-v2`,
    ifMatch: current.data.attributes.revision,
  },
)
const completed = await client.plannedWorkOperations.wait(accepted.data.id)
```

The PUT returns `202 Accepted` and a credential-owned operation. Do not assume the schedule changed
until the operation reaches `succeeded`. TeamGrid rejects an outdated source revision with `412`,
an overlapping replacement with `409`, and a missing precondition with `428`. Re-read after a
conflict and make an explicit merge decision. A failed operation exposes a bounded public error,
not worker checkpoints or tenant-routing internals.

```bash
teamgrid planned-work get TASK_ID --output json
teamgrid planned-work replace TASK_ID --data @schedule.json \
  --if-match "$REVISION" --idempotency-key "schedule-$TASK_ID-v2" \
  --yes --wait --output json
```

The CLI requires `--yes` for the full replacement in non-interactive automation. Planned-work
lists, task schedules, writes, and operation polling are forbidden in every MCP profile.
