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
| `changes` | Create checkpoints, list metadata changes, and run snapshot-then-catch-up |
| `tasks` | List, get, create, update, archive, restore, complete, reopen, timer start and stop |
| `timeEntries` | List, get, create, update, archive, restore, and cursor page iteration |
| `contacts` | List, get, create, update |
| `callNotes` | List, get, create, archive, restore |
| `contactGroups` | List, get, create, update, archive, restore |
| `users` | List workspace users |
| `lists`, `services`, `tags` | List, get, create, update, archive, restore |
| `customFieldDefinitions` | List, get, create, update, archive, restore |
| `customFieldValues` | Get, compare-and-set, and compare-and-clear a resource value |
| `projectTemplates` | List, get, create, update, archive, restore, instantiate |
| `projectTemplateInstantiations` | Get and wait for credential-owned instantiation status |
| `plannedWork` | List a bounded window, get a task schedule, atomically replace a task schedule |
| `plannedWorkOperations` | Get and wait for credential-owned replacement status |
| `appointments`, `absences` | Bounded list, get, create, compare-and-set update, archive, restore |
| `availability` | Read derived user availability in an explicit time zone and bounded interval |
| `activity` | List activity for an authorized contact, project, or task |
| `comments` | List, get, create, archive, and restore plain-text target comments |
| `documents` | List, get, create, compare-and-set update, archive, and restore documents |
| `files` | List, get, rename, archive, restore, and create private download intents |
| `fileUploadIntents` | Create, finalize, and cancel private upload intents |
| `products` | List, get, create, update, archive |
| `productGroups` | List, get, create, update, archive |
| `projectStatements` | List, get, create, update, archive, restore |
| `auditEvents` | List credential and mutation audit events |
| `webhooks` | List, get, create, remove |
| `webhookDeliveries` | List and get credential-owned delivery metadata |
| `members` | List, get, change role, and remove workspace members |
| `invitations` | List, get, create, resend, and cancel invitations |
| `roles`, `groups` | List, get, create, compare-and-set update, and remove administration resources |
| `search` | Federated search across explicitly authorized resource types |
| `exports` | Create and inspect bounded jobs, create download intents, and download through the header-only capability |
| `automationActions` | Read the public automation action catalog |
| `automationDefinitions`, `automationDefinitionVersions` | Manage versioned automation definitions and inspect immutable versions |
| `automationRuns` | List and get runs, or abort one with a strong revision |
| `integrationInstallations` | Read redacted provider-installation status |

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
- Planned-work PUT requests are retried only with their idempotency key and strong compare-and-set
  precondition. Other PUT, PATCH, and DELETE requests are not retried automatically.
- Redirects are not followed.
- Responses larger than the configured safety limit are rejected.
- `exports.download(id, { intentToken, maxBytes })` carries the opaque intent only in
  `X-TeamGrid-Export-Download-Intent`, never in a URL, and returns bounded binary data without
  exposing a private-storage URL.
- API and local client failures use separate error classes.
- Every success envelope and error exposes immutable transport metadata for request IDs,
  attempts, status, response headers, rate limits, retry timing, and idempotency replays.
- Project lifecycle helpers poll the operation resource; they do not hide an unbounded background
  job behind a synchronous project response.
- Change-feed helpers do not download resource payloads. They establish a race-free checkpoint
  boundary, stop catch-up only on `meta.page.caughtUp`, and leave durable application and polling
  cadence to the caller.
- Custom-field-value and planned-work writes require the latest resource revision. The SDK accepts
  either that unquoted revision or the corresponding strong ETag and never sends wildcards.
- Template instantiation and planned-work replacement expose the accepted operation; bounded
  `wait()` helpers poll credential-owned status without changing operation semantics.

Transport metadata is non-enumerable on success envelopes. Existing JSON output and CLI
pipelines therefore stay stable while application code can inspect `response.transport`.

[Start with the SDK quickstart](/sdk/quickstart/).
