---
title: Request troubleshooting
description: Diagnose TeamGrid API failures from authentication and scopes through concurrency, routing, and rate limits.
owner: Developer Experience
reviewedAt: 2026-07-29
---

Start with the HTTP status, structured error code, and `meta.requestId`. Never include a bearer
credential, webhook secret, upload intent, or unredacted customer payload in a support request.

| Symptom | Likely cause | What to verify |
| --- | --- | --- |
| `401 invalid_token` | Missing, expired, revoked, or malformed credential | Secret source, rotation state, Authorization header |
| `403 insufficient_scope` | Credential lacks an operation scope | Required and conditional scopes in the operation reference |
| `403 forbidden` | Workspace, role, grant, plan, or sharing policy denied access | Principal ownership and resource grants |
| `404 not_found` | Wrong opaque ID or resource is intentionally invisible | Workspace boundary, resource lifecycle, exact ID |
| `409 idempotency_conflict` | One key was reused with different input | Original request fingerprint and retry code |
| `409 conflict` | Current resource state rejects the action | Lifecycle state and latest resource |
| `412 precondition_failed` | The supplied revision is stale | Re-read, merge deliberately, send the new ETag |
| `428 precondition_required` | A guarded write omitted `If-Match` | Read the resource before writing |
| `429 rate_limit_exceeded` | Current credential or source exceeded its bucket | `Retry-After` and rate-limit headers |
| `502–504` | A cell-local dependency is temporarily unavailable | Request ID, status page, bounded safe retry |

## Region and endpoint checks

Official clients derive the regional endpoint from the credential. For direct HTTP integrations,
send German credentials to `https://api.de.teamgrid.app/v1` and United States credentials to
`https://api.us.teamgrid.app/v1`. Do not follow a redirect with an Authorization header.

## Safe diagnostic sequence

1. Call `GET /workspace` with the same credential and endpoint.
2. Confirm the operation's required and conditional scopes.
3. Remove optional filters and retry one bounded read.
4. For a write, obtain the latest resource revision and keep the same idempotency key.
5. Record the response status, error code, request ID, time, and regional endpoint.

The [errors and rate limits guide](/api/v1/errors/) defines retry behavior. For platform-wide
availability, check [TeamGrid Status](https://status.teamgrid.app/).
