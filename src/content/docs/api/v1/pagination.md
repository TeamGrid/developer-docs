---
title: Pagination and idempotency
description: Traverse stable cursor pages and make safe retriable creates with TeamGrid API v1.
---

## Cursor pagination

List operations accept a bounded `limit` and an optional opaque `cursor`.

```http
GET /v1/tasks?limit=50
GET /v1/tasks?limit=50&cursor=<nextCursor>
```

Read the next cursor from `meta.page.nextCursor`. A value of `null` means that the result is complete.

Do not decode, edit, sort, or persist assumptions about the cursor format. Restart a traversal without a cursor when the filter set changes.

## Idempotent creates

Creates and asynchronous domain commands that can be safely replayed require an `Idempotency-Key`
header. This includes project templates, their instantiation, project lifecycle operations, and
planned-work replacement:

```http
Idempotency-Key: sync-job-2026-07-19-task-42
```

The key must contain 1–128 printable ASCII characters. Repeating the same operation with the same key and payload returns the original result. Reusing the key with a different payload returns a conflict.

For project lifecycle actions and project-template instantiation, the idempotency fingerprint also
includes the resource revision supplied through `If-Match`. A retry must therefore use the same key,
action, payload, and source revision. If the resource changed, reconcile first and start the newly
decided action under a new operation key.

Generate keys from a stable operation identity rather than a random value created on every retry. Keep keys free of credentials and personal data.

GET requests and idempotent POST requests can be retried after bounded transient failures. A
planned-work PUT is retryable only with both its idempotency key and strong compare-and-set
precondition. Other PUT, PATCH, and DELETE requests should not be retried automatically unless the
caller has separately established their outcome.

See [resource revisions and concurrent writes](/api/v1/resource-concurrency/) for the separate
read–mutate–reconcile contract used by projects, tasks, and project templates.
