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

`GET /v1/changes` deliberately differs from ordinary lists: its next cursor is always present and
acts as a durable polling checkpoint, including when `data` is empty. It is also bound to the exact
credential, cell, and filters. Follow the [change-feed bootstrap and recovery
protocol](/api/v1/change-feed/) and continue catch-up until `meta.page.caughtUp` is true instead of
stopping on a `null` cursor or inferring completion from page length.

## Idempotent creates

Creates and asynchronous domain commands that can be safely replayed require an `Idempotency-Key`
header. This includes project templates, their instantiation, project lifecycle operations, and
planned-work replacement:

```http
Idempotency-Key: sync-job-2026-07-19-task-42
```

The key must contain 1–128 printable ASCII characters. Repeating the same operation with the same key and payload returns the original result. Reusing the key with a different payload returns a conflict.

Generate keys from a stable operation identity rather than a random value created on every retry. Keep keys free of credentials and personal data.

GET requests and idempotent POST requests can be retried after bounded transient failures. A
planned-work PUT is retryable only with both its idempotency key and strong compare-and-set
precondition. Other PUT, PATCH, and DELETE requests should not be retried automatically unless the
caller has separately established their outcome.
