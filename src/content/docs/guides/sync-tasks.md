---
title: Synchronize tasks safely
description: Keep an external system aligned with TeamGrid tasks without overwriting concurrent changes.
owner: Developer Experience
reviewedAt: 2026-07-29
---

## Choose an ownership boundary

Write down which system owns each field. A reliable synchronization does not let both systems
freely overwrite the same property. For example, an external intake system may own the original
request text while TeamGrid owns planning, completion and assignment.

## Establish a snapshot

Read tasks with `GET /tasks` and follow cursor pagination until `nextCursor` is empty. Keep the
opaque task ID, the current revision or ETag, and only the fields relevant to the integration.

Use narrow filters such as `projectId`, `completed` and updated-time bounds where the contract
provides them. Never remove the workspace and permission boundary in an attempt to make a sync
“complete.”

## Apply changes

Create tasks with `POST /tasks` and a stable idempotency key derived from the source record. Update
an existing task with `PATCH /tasks/{id}` and the validator from the latest read.

Task moves, completion, reopening, timer control and checklist replacement are domain operations.
Use their dedicated endpoints instead of approximating them through a generic patch.

## Recover from conflicts

A `412 Precondition Failed` means the task changed after your read. Fetch it again, compare the
fields your integration owns, and decide whether to merge or leave the newer TeamGrid value.
Automatic blind retries defeat the purpose of optimistic concurrency.

For incremental processing, use the [change feed](/api/v1/change-feed/) after taking a checkpoint.
The feed is a signal to re-read the current resource, not a permanent copy of every historical
document.
