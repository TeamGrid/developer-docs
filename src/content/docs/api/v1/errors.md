---
title: Errors and rate limits
description: Handle API v1 error envelopes, request identifiers, retryable failures, and rate-limit responses.
---

API v1 returns a consistent error document and a request identifier:

```json
{
  "errors": [
    {
      "code": "insufficient_scope",
      "detail": "The credential does not grant the required scope.",
      "status": "403",
      "title": "Forbidden"
    }
  ],
  "meta": {
    "requestId": "request-id"
  }
}
```

Include `meta.requestId` when contacting TeamGrid support. Never attach the bearer credential or an unredacted request payload.

| Status | Meaning | Recommended action |
| --- | --- | --- |
| `400` | Invalid request or idempotency key | Correct the request; do not retry unchanged |
| `401` | Missing, invalid, expired, or revoked credential | Stop and rotate or replace the credential |
| `403` | Scope, workspace, or policy denial | Request the correct access; do not retry unchanged |
| `404` | Resource not visible in the credential workspace | Verify the identifier and tenant boundary |
| `409` | Idempotency conflict | Use the original payload or a new operation key |
| `429` | Rate limit exceeded | Back off and honor `Retry-After` when present |
| `502–504` | Temporary dependency or availability failure | Retry only safe methods with bounded backoff |

Rate-limit headers describe the current bucket. Limits can differ by endpoint and rollout policy, so integrations should react to the response rather than hard-code a request rate.
