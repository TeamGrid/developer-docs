---
title: Errors and rate limits
description: Handle API v1 error envelopes, request identifiers, retryable failures, and rate-limit responses.
owner: Developer Platform
reviewedAt: 2026-07-29
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
| `400` | Invalid request, idempotency key, or malformed precondition | Correct the request; do not retry unchanged |
| `401` | Missing, invalid, expired, or revoked credential | Stop and rotate or replace the credential |
| `403` | Scope, workspace, or policy denial | Request the correct access; do not retry unchanged |
| `404` | Resource not visible in the credential workspace | Verify the identifier and tenant boundary |
| `409` | Resource-state or idempotency conflict | Inspect the error code; resolve the resource state or use the original idempotent payload |
| `410` | A private-file upload reservation expired | Create a new upload intent and restart the upload flow |
| `412` | A strong resource revision is stale | Re-read and make an explicit merge or overwrite decision |
| `428` | A required `If-Match` precondition is missing | Read the latest resource, then send its strong revision |
| `429` | Rate limit exceeded | Back off and honor `Retry-After` |
| `502–504` | Temporary dependency or availability failure | Retry only safe methods with bounded backoff; never remove a required precondition |

Rate-limit headers describe the current bucket. Limits can differ by endpoint and rollout policy, so integrations should react to the response rather than hard-code a request rate.

| Header | Meaning |
| --- | --- |
| `Retry-After` | Minimum number of seconds before retrying after a 429 |
| `X-RateLimit-Limit` | Maximum requests in the current window |
| `X-RateLimit-Remaining` | Requests still available in the window |
| `X-RateLimit-Reset` | Window reset as Unix time in milliseconds |
| `X-Request-Id` | Correlation ID shared with `meta.requestId` |

The 429 response uses the normal v1 error envelope with code `rate_limit_exceeded`. The official SDK
honors `Retry-After` for safe reads, idempotent POST operations, and fully guarded planned-work
replacements; it does not automatically retry other PUT, PATCH, or DELETE requests.

Project, task, and project-template mutations use these precondition errors for their 14 protected
operations. Another 31 compare-and-set operations retain domain-specific validators. Distinguish
`400 invalid_precondition`, `412 precondition_failed`, `428 precondition_required`, and
`503 service_unavailable`. The complete boundary is documented under
[resource concurrency](/api/v1/resource-concurrency/).

## Diagnose without exposing customer data

Use this order when a request fails:

1. Record the HTTP status, structured error code, request ID, time, and regional endpoint.
2. Re-run `GET /workspace` with the same credential to separate authentication from operation
   authorization.
3. Compare the credential with the operation's required and conditional scopes.
4. For guarded writes, read the latest resource and compare its revision with the attempted
   `If-Match` value.
5. Retry only when the method, idempotency key, and response status make that safe.

The compact [request troubleshooting matrix](/resources/troubleshooting/) maps common symptoms to
their likely causes. Never send bearer tokens, signing secrets, upload intents, or raw customer
payloads to support.
