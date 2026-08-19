---
title: Signed webhooks
description: Create TeamGrid webhook v2 registrations and verify every delivery over the exact raw request body.
owner: Security
reviewedAt: 2026-08-19
---

Webhook registrations created through API v1 use signed delivery version 2. The create response
returns a signing secret once; store it in the receiver's secret manager. The CLI therefore requires
`--secret-file` or piped `--secret-stdout` for create as well as rotation and never sends the initial
secret through its normal table or JSON renderer.

List and get responses are credential-owned and secret-free. They carry a strong `whk1` ETag that
changes when configuration, ownership, signing generation, or enabled state changes; delivery
counters do not make the configuration ETag flap.

## Rotate a signing secret

Read the webhook first and pass its exact strong ETag to the rotation operation. Rotation requires
`webhooks:write`, an empty body, `If-Match`, and a stable `Idempotency-Key`:

```bash
curl --request POST \
  --url https://api.de.teamgrid.app/v1/webhooks/WEBHOOK_ID/secret-rotation \
  --header 'Authorization: Bearer <credential>' \
  --header 'If-Match: "whk1-<64 hex characters>"' \
  --header 'Idempotency-Key: rotate-webhook-2026-07'
```

The no-store response reveals the replacement `whsec_v2_...` secret exactly through this operation.
Persist it immediately and treat it as current. If the response is lost, retry the identical request
with the same idempotency key and precondition; the replay returns the same completed rotation rather
than incrementing the generation again. Reusing the key for another request conflicts. A stale ETag
returns `412`, and a missing precondition returns `428`.

Do not put the secret or idempotency key in a URL, shell history, log field, ticket, or MCP transcript.
Webhook secret rotation is deliberately unavailable through MCP.

The CLI requires an explicit safe destination:

```bash
teamgrid webhooks rotate-secret WEBHOOK_ID \
  --if-match 'whk1-<64 hex characters>' \
  --idempotency-key rotate-webhook-2026-07 \
  --secret-file ./webhook-secret.txt \
  --yes
```

The file path is created with mode `0600` and is never overwritten. Use `--secret-stdout` only for a
controlled pipe into a secret manager; it writes the raw secret and no other output, and refuses an
interactive terminal.

## Send a real-pipeline test delivery

Use `POST /v1/webhooks/{id}/test-delivery` with `webhooks:write` and a stable
`Idempotency-Key` to queue a synthetic `webhook.test` event. The operation uses the same
cell-local queue, worker, signing, HTTPS, retry, and delivery-history path as a real event. The
worker revalidates the exact current credential, principal, workspace, region, cell, and
credential-owned v2 webhook before sending.

```bash
teamgrid webhooks test WEBHOOK_ID \
  --idempotency-key webhook-smoke-2026-08-10 \
  --output json
```

The safe no-store receipt identifies the queued delivery and whether an identical request was
replayed. It never contains the destination URL, payload, signing secret, request headers, or
credential data. A test attempt is visible in delivery history but never changes the webhook's
production health state: `failCount`, `lastStatus`, and automatic disablement remain untouched.
Use a new logical idempotency key for a new test; reuse the original key only to recover the same
request. Test delivery is intentionally unavailable through MCP.

## Delivery headers

- `X-TeamGrid-Webhook-Id`: stable delivery identifier for deduplication;
- `X-TeamGrid-Webhook-Timestamp`: Unix timestamp in seconds;
- `X-TeamGrid-Webhook-Signature`: `v1=<hex HMAC-SHA256>`;
- `X-TeamGrid-Webhook-Version`: `2`.

## Verification sequence

1. Capture the exact raw request bytes before JSON parsing.
2. Reject timestamps outside your accepted replay window.
3. Compute HMAC-SHA256 over `<timestamp>.<exact raw body>`.
4. Compare signatures in constant time.
5. Deduplicate the delivery identifier.
6. Only then parse and process the payload.

Do not parse and re-serialize JSON before verification. Whitespace and byte encoding are part of the signed input.

Legacy UI-created webhook v1 registrations remain unsigned during migration. TeamGrid does not silently downgrade a v2 registration when signing is unavailable.

## Recurring-task events

Recurring tasks publish an explicit, finite event catalog:

| Event | Emitted when | Required subscription scopes |
| --- | --- | --- |
| `task_recurrence_created` | A series is created | `task-recurrences:read` |
| `task_recurrence_updated` | Its definition, owner or same-status metadata changes | `task-recurrences:read` |
| `task_recurrence_paused`, `task_recurrence_resumed` | The lifecycle enters paused or active | `task-recurrences:read` |
| `task_recurrence_ended`, `task_recurrence_archived` | The lifecycle enters its corresponding terminal/archive state | `task-recurrences:read` |
| `task_recurrence_suspended`, `task_recurrence_needs_attention` | Runtime validation blocks safe execution | `task-recurrences:read` |
| `task_recurrence_occurrence_materialized` | An occurrence creates its ordinary task | `task-recurrences:read`, `tasks:read` |
| `task_recurrence_occurrence_skipped` | An occurrence is deliberately skipped | `task-recurrences:read` |
| `task_recurrence_occurrence_failed` | An occurrence enters failed; blocked work uses the same failure notification family | `task-recurrences:read` |

Series payloads contain only the series ID, lifecycle/attention state, current definition version
ID, developer revision, name, owner, resource context, workspace ID and update time. They do not
embed the complete policy or task template. Occurrence payloads contain the occurrence and series
IDs, stable occurrence key, definition version, state, scheduled time, sanitized error code,
linked task identity when available, workspace ID and update time. After an explicit detachment,
the historical task identity may be carried with `detachedAt` and `detachedBy`; follow-up reads use
the public occurrence projection where `cardId` is null and `detachedCardId` is explicit.

`POST /task-recurrences/{id}/remove-from-tasks` emits the normal
`task_recurrence_ended` series event. It does not synthesize task-deletion events because the tasks
remain in TeamGrid. Use `resourceTypes=taskRecurrence` plus `resourceTypes=task` in the durable
change feed when a mirror must reconcile both series state and ordinary task projections.

## Delivery history

API v1 provides cursor-paginated, read-only delivery history through `/v1/webhook-deliveries`. A
credential can see only deliveries owned by that exact credential, even when another credential
belongs to the same workspace. The cell reapplies credential ownership and workspace isolation for
both list and get requests.

History includes the delivery and webhook IDs, event, resource ID, state, timestamps, attempt count,
HTTP status, and sanitized transport codes. It never includes the destination URL, payload, request
or response headers, request or response body, signing secret, tenant-routing metadata, or retention
internals. Delivery history is intentionally unavailable through MCP.

Use delivery history for bounded troubleshooting, not as a durable event store or replay API.
