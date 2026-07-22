---
title: Resources and semantics
description: Understand TeamGrid API v1 lifecycle, finance, ownership, hierarchy, and privacy guarantees before building an integration.
---

API v1 exposes bounded resource DTOs and explicit domain commands. It does not mirror TeamGrid's
MongoDB documents or offer a generic DDP mutation interface. Fields absent from the OpenAPI schema
are private even if a similarly named value exists inside the TeamGrid application.

## Current resource surface

| Resource family | Public behavior | Important boundary |
| --- | --- | --- |
| Workspace and users | Read | Workspace, region, cell, and membership remain credential-scoped |
| Projects | List, get, create, update, complete, reopen, archive, restore | Lifecycle actions are asynchronous and require `projects:lifecycle` |
| Tasks | List, get, create, update, archive, restore, complete, reopen, timer start and stop | Timer commands require both `tasks:write` and `time-entries:write` |
| Time entries | List, get, create, update, archive, restore | Explicit lifecycle commands preserve TeamGrid time-tracking invariants |
| Contacts | List, get, create, update | No public archive operation in the current contract |
| Call notes | List, get, create, archive, restore | Public content is plain text; internal rich-text storage is never returned |
| Contact groups | List, get, create, update, archive, restore | Parent changes are validated against cycles and hierarchy limits |
| Lists, services, and tags | List, get, create, update, archive, restore | Service responses can include billing rates |
| Custom-field definitions | List, get, create, update, archive, restore | Only canonical public schema metadata is writable |
| Custom-field values | Get, compare-and-set, compare-and-clear | Requires a strong revision and the matching target-resource scope |
| Appointments and absences | Bounded list, get, create, compare-and-set update, archive, restore | Foreign-user access requires a delegated or administrative overlay plus product authorization |
| Availability | Bounded read | Requires an explicit IANA time zone; foreign users require delegated access |
| Comments and activity | Target-scoped collaboration | Also requires the matching contact, project, or task read scope |
| Documents and files | Document lifecycle, file metadata, private transfer intents | Signed transfer capabilities are short-lived and never exposed to MCP |
| Workspace administration | Members, invitations, roles, groups | PII is an additional overlay; mutations preserve workspace invariants and strong revisions |
| Search and exports | Bounded federated search and asynchronous CSV exports | Each requested domain is independently authorized; export download capabilities are header-only |
| Automations and integrations | Public action catalog, versioned definitions, runs, redacted installation status | Internal tasks and provider secrets remain private |
| Project templates | List, get, create, update, archive, restore, instantiate | Snapshot content stays private; instantiation is asynchronous and credential-owned |
| Planned work | List bounded windows, get task schedule, replace task schedule | Sensitive workload data; replacement is asynchronous, idempotent, and compare-and-set |
| Products | List, get, create, update, archive | `purchasePrice` requires finance scopes; no restore operation is currently public |
| Product groups | List, get, create, update, archive | Parent changes are hierarchy-validated; no restore operation is currently public |
| Project statements | List, get, create, update, archive, restore | Budget data and `purchasePrice` are finance-gated; internal order and rollup fields stay private |
| Audit events | List | Security-sensitive; intended for investigation and governance workflows |
| Webhooks | List, get, create, remove | Creation returns the signing secret once |
| Webhook deliveries | List and get | Read-only, credential-owned, privacy-reduced history |

The [capability coverage ledger](/guides/capability-coverage/) separately records what is implemented
in the controlled beta, partially covered, planned, or intentionally private.

Project, task, and project-template responses use the static Beta 2 shape and do not contain
developer revision fields. Their mutations do not accept a core `If-Match` precondition. This
boundary applies to 25 project, task, template, and associated operation endpoints; independent
resource families retain their own compare-and-set contracts. See
[resource concurrency in Beta 2](/api/v1/resource-concurrency/) for the exact boundary.

## Project lifecycle operations

Project completion, reopen, archive, and restore can cascade across related TeamGrid state. The API
therefore returns a project-lifecycle operation instead of pretending that the work completed during
the initiating request.

1. Send the lifecycle command with a stable idempotency key.
2. Persist the returned operation ID, action, and target project ID.
3. Treat the accepted operation as the authoritative handle for subsequent polling.
4. Poll `GET /v1/project-lifecycle-operations/{id}` until it reaches a terminal state, or use the SDK
   or CLI wait helper.
5. Treat a transport timeout as an unknown outcome and resume by operation ID; do not create an
   unrelated replacement operation.

On success, re-read the project if the next step depends on its resulting state. Beta 2 operation
resources do not expose the retired core `sourceRevision` or `resultRevision` fields.

The CLI project commands accept `--wait`, `--max-wait`, and `--poll-interval`. The SDK exposes the
operation through `projectLifecycleOperations.get()` and `projectLifecycleOperations.wait()`. Pass
the mutation result as `acceptedOperation` when waiting so every poll remains bound to the accepted
operation ID, action, and project. CLI `--wait` does this automatically.

## Finance overlays

Base and finance scopes are intentionally separate.

- `products:read` returns catalog data without `purchasePrice`.
- `products:finance:read` reveals `purchasePrice` only when `products:read` is also present.
- Supplying `purchasePrice` on a product create or update requires both `products:write` and
  `products:finance:write`.
- `project-statements:read` returns non-budget statements without `purchasePrice`.
- `project-statements:finance:read` additionally permits budget statements and reveals
  `purchasePrice` when the base read scope is present.
- Supplying `purchasePrice` on a statement create or update requires both
  `project-statements:write` and `project-statements:finance:write`.

The finance scopes do not reveal internal orders, carts, workflow bookkeeping, budget rollups, or
provider data. Those fields are not part of the public DTO.

## Credential-owned delivery history

`webhooks:read` permits a credential to list or get only webhook deliveries owned by that same
credential. Workspace membership alone is not enough, and deleting a webhook does not transfer its
history to another credential.

Delivery records expose bounded operational metadata: event, resource ID, state, timestamps, HTTP
status, sanitized transport code, and attempt count. They never expose destination URLs, request or
response bodies, payloads, headers, signing secrets, tenant routing fields, or retention internals.
History is operational and retained for a bounded period; consumers must not treat it as an event
archive or replay source.

## Custom-field compatibility

Definition responses identify canonical writable definitions separately from unsupported or
read-only legacy shapes. Unfiltered reads can surface legacy definitions for inventory purposes.
Create and update operations accept only the canonical field and target types described by OpenAPI,
and the configuration discriminator must match `fieldType`.

Value operations are separate from definition operations. They expose canonical values only for
contacts, projects, project journal entries, and tasks, and require strong compare-and-set revisions.
See [custom fields](/api/v1/custom-fields/) before writing values.
