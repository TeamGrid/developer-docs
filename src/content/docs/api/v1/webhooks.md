---
title: Signed webhooks
description: Create TeamGrid webhook v2 registrations and verify every delivery over the exact raw request body.
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
