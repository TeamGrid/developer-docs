---
title: Migrate from API v0 to v1
description: Map TeamGrid API v0 authentication, pagination, writes, errors, endpoints, and webhooks to API v1.
---

Migrate one bounded integration at a time. Keep its v0 token active until the equivalent v1 reads and writes have been verified, then revoke the old token.

The machine-readable [v0-to-v1 migration map](/openapi/v0-to-v1-migration.json) classifies every one
of the 87 frozen v0 runtime routes as equivalent, adaptation-required, or retained-v0 and records
request, response, and semantic changes. Use it as an inventory gate; the guidance below explains
the platform-wide changes.

| Concern | API v0 | API v1 |
| --- | --- | --- |
| Authentication | Broad team token | Reveal-once scoped service credential |
| Endpoint | Global v0 host | Credential-derived regional `/v1` host |
| Pagination | Page and limit | Opaque cursor and limit |
| Create retries | Generally unsafe | Required idempotency key |
| Concurrent project/task/template writes | No uniform public precondition | Static Beta 2 writes without a public core CAS precondition |
| Errors | Historical response formats | Versioned error envelope with request id |
| Webhooks | Legacy unsigned delivery | HMAC-signed delivery v2 |
| Audit | General operational logging | Credential and mutation audit events |

## Suggested migration sequence

1. Inventory the v0 resources, filters, writes, and webhook events used by the integration.
2. Create a separate v1 credential with only the required read scopes.
3. Compare read results without changing production data.
4. Add write scopes and idempotency keys only when the read comparison passes; add read-before-write ETag handling for endpoints whose v1 contract explicitly requires it.
5. Create a v2 webhook and verify its exact raw-body signature.
6. Switch the integration to the regional endpoint.
7. Observe errors, latency, and audit events.
8. Revoke the v0 token and remove it from every secret store.

## Resource availability

API v1 currently creates and updates projects, tasks, time entries, and contacts, and manages signed webhook registrations. Projects can be completed, reopened, archived, and restored through durable asynchronous lifecycle operations. Tasks use explicit complete, reopen, archive, restore, and timer commands; time entries can be archived and restored. Task timers require both `tasks:write` and `time-entries:write`.

Lists, services, and tags now have create, get, update, archive, and restore operations in addition to
cursor-paginated reads. Grant their dedicated `lists:read/write`, `services:read/write`, and
`tags:read/write` scopes only where needed. Public list creation supports project and task lists;
existing personal lists remain readable but cannot be created through API v1. Service responses can
contain billing rates and should be treated accordingly.

API v1 also covers call-note lifecycle, contact-group lifecycle, custom-field definitions and
values, project templates, planned work, product and product-group catalog management, project
statements, and credential-owned webhook delivery history. Product acquisition cost and
project-statement budget data require explicit finance scope overlays. Value writes and planned-work
replacement use strong compare-and-set revisions; do not translate v0 writes mechanically.

Project, task, and project-template writers use a static Beta 2 contract without developer revision
fields or a core `If-Match` requirement. Do not synthesize preconditions for those operations.
Project lifecycle and template instantiation remain asynchronous and should use stable idempotency
keys. Other domains, including custom-field values and planned work, retain their explicit
read-before-write preconditions. See [resource concurrency in Beta 2](/api/v1/resource-concurrency/).

The current v1 contract does not yet cover every legacy or TeamGrid product workflow. The canonical
capability ledger still classifies areas such as service accounts, delegated OAuth, project sharing,
task ordering, subtasks and bulk changes, time-entry billing, file sharing, commerce orders, report
jobs, imports, and audit export as planned. Several released domains also remain explicitly partial.
The first public API v1 beta does not include a durable change feed. Use bounded resource
pagination and signed webhooks where their delivery semantics fit the integration. Keep only those
bounded parts on v0 until an explicit v1 domain operation exists; do not emulate missing behavior
through audit data, unrelated resources, or generic database mutations.

## Legacy reference differences

The migration audit found eight historical ReadMe pages whose advertised method and path do not exist in the frozen v0 runtime route inventory: contact and project DELETE-by-id, plus service and tag create, update, and delete operations.

The new reference follows the runtime contract. Old links to those eight pages land here until the historical documentation and production behavior have been reconciled. Do not implement a new dependency on those advertised paths.
