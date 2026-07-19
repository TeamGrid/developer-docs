---
title: TypeScript SDK
description: Use the official typed and region-aware Node.js client for TeamGrid API v1.
---

`@teamgrid/api-client` is the official TypeScript client for API v1. It parses credential location hints, derives the regional endpoint, enforces bounded response sizes and timeouts, applies safe retries, exposes cursor iterators, and returns stable error classes without retaining the bearer secret.

The current prerelease is distributed through the explicit npm `next` channel:

```bash
npm install @teamgrid/api-client@next
```

Pin the exact version in reproducible deployments. Node.js 22.14 through 24 is supported.

## Resource clients

One `TeamGridClient` exposes the complete current API v1 surface:

| Client | Operations |
| --- | --- |
| `system`, `workspace` | API discovery and authenticated workspace metadata |
| `projects` | List, get, create, update, complete, reopen, archive, restore |
| `projectLifecycleOperations` | Get and wait for asynchronous project lifecycle operations |
| `tasks` | List, get, create, update, archive, restore, complete, reopen, timer start and stop |
| `timeEntries` | List, get, create, update, archive, restore, and cursor page iteration |
| `contacts` | List, get, create, update |
| `callNotes` | List, get, create, archive, restore |
| `contactGroups` | List, get, create, update, archive, restore |
| `users` | List workspace users |
| `lists`, `services`, `tags` | List, get, create, update, archive, restore |
| `customFieldDefinitions` | List, get, create, update, archive, restore |
| `products` | List, get, create, update, archive |
| `productGroups` | List, get, create, update, archive |
| `projectStatements` | List, get, create, update, archive, restore |
| `auditEvents` | List credential and mutation audit events |
| `webhooks` | List, get, create, remove |
| `webhookDeliveries` | List and get credential-owned delivery metadata |

Paginated clients also expose `pages()` async iterators. Creates and asynchronous lifecycle starts
accept an idempotency key through mutation options. Every method uses the scopes documented in the
API reference; the SDK never adds authority beyond the supplied credential.

Types model finance-gated fields as optional. Product `purchasePrice` is present only with
`products:finance:read`; project-statement budget entries and `purchasePrice` require
`project-statements:finance:read`. Supplying acquisition cost on writes requires the corresponding
finance write overlay. Webhook delivery objects deliberately omit URLs, request and response data,
headers, secrets, and tenant-routing internals.

## Runtime behavior

- GET requests can be retried after bounded transient failures.
- POST requests are retried only when they include an idempotency key.
- PATCH and DELETE requests are not retried automatically.
- Redirects are not followed.
- Responses larger than the configured safety limit are rejected.
- API and local client failures use separate error classes.
- Every success envelope and error exposes immutable transport metadata for request IDs,
  attempts, status, response headers, rate limits, retry timing, and idempotency replays.
- Project lifecycle helpers poll the operation resource; they do not hide an unbounded background
  job behind a synchronous project response.

Transport metadata is non-enumerable on success envelopes. Existing JSON output and CLI
pipelines therefore stay stable while application code can inspect `response.transport`.

[Start with the SDK quickstart](/sdk/quickstart/).
