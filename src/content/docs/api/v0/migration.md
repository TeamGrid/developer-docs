---
title: Migrate from API v0 to v1
description: Map TeamGrid API v0 authentication, pagination, writes, errors, endpoints, and webhooks to API v1.
---

Migrate one bounded integration at a time. Keep its v0 token active until the equivalent v1 reads and writes have been verified, then revoke the old token.

| Concern | API v0 | API v1 |
| --- | --- | --- |
| Authentication | Broad team token | Reveal-once scoped service credential |
| Endpoint | Global v0 host | Credential-derived regional `/v1` host |
| Pagination | Page and limit | Opaque cursor and limit |
| Create retries | Generally unsafe | Required idempotency key |
| Errors | Historical response formats | Versioned error envelope with request id |
| Webhooks | Legacy unsigned delivery | HMAC-signed delivery v2 |
| Audit | General operational logging | Credential and mutation audit events |

## Suggested migration sequence

1. Inventory the v0 resources, filters, writes, and webhook events used by the integration.
2. Create a separate v1 credential with only the required read scopes.
3. Compare read results without changing production data.
4. Add write scopes and idempotency keys only when the read comparison passes.
5. Create a v2 webhook and verify its exact raw-body signature.
6. Switch the integration to the regional endpoint.
7. Observe errors, latency, and audit events.
8. Revoke the v0 token and remove it from every secret store.

## Resource availability

API v1 currently writes tasks, time entries, and signed webhooks. Some v0 write surfaces do not yet have a v1 equivalent. Keep those bounded parts on v0 until an explicit v1 operation exists rather than emulating them through unrelated resources.

## Legacy reference differences

The migration audit found eight historical ReadMe pages whose advertised method and path do not exist in the frozen v0 runtime route inventory: contact and project DELETE-by-id, plus service and tag create, update, and delete operations.

The new reference follows the runtime contract. Old links to those eight pages land here until the historical documentation and production behavior have been reconciled. Do not implement a new dependency on those advertised paths.
