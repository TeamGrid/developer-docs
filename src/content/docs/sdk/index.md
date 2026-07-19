---
title: TypeScript SDK
description: Use the official typed and region-aware Node.js client for TeamGrid API v1.
---

`@teamgrid/api-client` is the official TypeScript client for API v1. It parses credential location hints, derives the regional endpoint, enforces bounded response sizes and timeouts, applies safe retries, exposes cursor iterators, and returns stable error classes without retaining the bearer secret.

The current prerelease is distributed through the explicit npm `next` channel:

```bash
npm install @teamgrid/api-client@next
```

Pin the exact version in reproducible deployments. Node.js 22.13 through 24 is supported.

## Resource clients

The SDK exposes `workspace`, `projects`, `tasks`, `timeEntries`, `contacts`, `users`, `lists`, `services`, `tags`, `auditEvents`, and `webhooks` from one `TeamGridClient` instance.

## Runtime behavior

- GET requests can be retried after bounded transient failures.
- POST requests are retried only when they include an idempotency key.
- PATCH and DELETE requests are not retried automatically.
- Redirects are not followed.
- Responses larger than the configured safety limit are rejected.
- API and local client failures use separate error classes.

[Start with the SDK quickstart](/sdk/quickstart/).
