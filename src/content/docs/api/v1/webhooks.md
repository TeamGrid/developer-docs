---
title: Signed webhooks
description: Create TeamGrid webhook v2 registrations and verify every delivery over the exact raw request body.
---

Webhook registrations created through API v1 use signed delivery version 2. The create response returns a signing secret once; store it in the receiver's secret manager.

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
