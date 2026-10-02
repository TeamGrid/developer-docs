---
title: Capability coverage
description: Understand how API v1 operations map to the TeamGrid SDK, CLI, and curated MCP server.
owner: Developer Experience
reviewedAt: 2026-10-02
---

TeamGrid maintains one versioned capability contract alongside OpenAPI. It requires an SDK method, CLI command, and explicit MCP decision for every public API operation. CI fails when any surface drifts.

The synchronized `1.2.0` API v1 contract contains 154 paths and 238 operations. The CLI maps all 238
operations. The TypeScript SDK maps the 237 programmatic operations; the one-time anonymous CLI
code exchange is deliberately CLI-only. The stable [MCP release](/mcp/candidate/)
exposes 208 business tools (84 reads, 124 writes); the other 30 operations have
explicit exclusions for transport, credentials, secrets or controlled transfers.
The local `core` default preserves 22 reads and `all` preserves 36 reads.
Hosted Production advertises `full`; local work and domain profiles explicitly
select additional business tools.
API discovery and reveal-once secrets remain outside the business tool surface.

The cross-interface contract currently governs workspace, projects and asynchronous project
lifecycle operations, tasks, recurring tasks and timers, time entries, calendar appointments, absences, availability,
contacts, comments, activity, documents, files, workspace administration, search, bounded exports,
automation definitions and runs, integration-installation status, call notes, contact groups, users,
metadata, custom fields, commerce resources, audit events, webhooks, delivery history, templates, and
planned work, personal access credentials, service accounts, resource grants, and the durable change
feed. Finance fields are scope-gated, and the preserved MCP read profiles remove acquisition cost; finance profiles require the corresponding scopes.

The contract declares 18 project, task, project-sharing, and project-template
mutations with strong ETags and required `If-Match`, plus two revision-bound asynchronous-operation
reads. Another 48
protected operations retain resource-specific revision formats for planned work, custom-field
values, calendar data, documents, workspace administration, automations, workspace settings, and
webhook-secret rotation.

## Authorization registry

Transport parity is only one half of the contract. TeamGrid also maintains a code-owned action-policy
registry for all 238 operations. API discovery and the one-time CLI code exchange are anonymous or
public-client operations; all 236 credential-authenticated operations are bound to their App execution methods, product-permission
resolvers, entitlement checks, resource-grant resolvers, conditional domain policies, sensitive
field overlays, allowed principal kinds, and one of 12 principal-policy rollout families. The two
current-credential self-service operations deliberately require no additional scope, but still
require and revalidate the exact bearer credential, principal, workspace, region, and cell.

The current registry identity and SHA-256 are published in the
[machine-readable contract artifact](/openapi/developer-action-policy-registry.json). The API and
owning App cell exchange this exact identity during startup compatibility negotiation and fail
readiness on any mismatch. The same identity is included in the canonical deployment manifest.

V8 declares every request-dependent scope and dynamic policy used by collaboration, automation,
custom-field content, calendar, work-management, and search/export handlers. The owning App cell
resolves stored targets before evaluating grants, and its V16 runtime provides one exact resolver
for every authenticated action. Promotion remains evidence-gated per cell; contract completeness
alone does not activate principal enforcement.

The registry covers personal access credentials and native service accounts without converting
existing credentials. Regional OAuth for hosted MCP and CLI browser login is enabled in Production DE
and US. This separate connection lifecycle does not add generic third-party OAuth
provider endpoints to the API v1 business capability ledger.

## Product capability ledger

Operation parity is not the same as total TeamGrid product coverage. The separate product ledger
classifies 74 capabilities against the current implementation:

| Status | Count | Meaning |
| --- | ---: | --- |
| Released in the stable contract | 62 | A bounded public v1 workflow is implemented across its required surfaces |
| Partial | 0 | No capability is advertised with an incomplete public workflow |
| Planned | 6 | The workflow remains on the roadmap and is not part of the current contract |
| Intentionally private | 6 | The capability is an implementation or privileged control plane, not a public API target |

API version discovery, system capability discovery, workspace entitlements, safe workspace settings, the event catalog,
project reads, complete project-template capture and instantiation, task reads, writes and lifecycle,
complete planned-work scheduling, complete non-billing time-entry reads and writes, complete contact reads,
complete audit reads and bounded audit exports, complete custom-field-value reads and
compare-and-set writes, credential and service-account lifecycle, service-account resource grants,
project sharing, conflict-safe task bulk operations, recurring tasks, time-entry billing, the qualified change feed,
and webhook-secret rotation are released in the stable contract. The API ledger lists broader delegated-OAuth product coverage, telephony, file
sharing, orders, reports and imports as planned. That ledger entry must not be
interpreted as unavailability of the released MCP OAuth connection flow.

Raw database access, generic Meteor/DDP calls, superadmin controls, provider secrets, internal
automation tasks, and the file-device synchronization protocol remain private. Customer workflows
are represented by stable resources and domain commands instead of those internals.

## Post-1.1 qualification boundary

The six planned domains are additive roadmap candidates, not hidden or partially supported
endpoints:

- **Broader delegated-OAuth API coverage** is a separate ledger item. The MCP/CLI
  connection lifecycle already provides consent, token rotation and revocation;
  generic third-party OAuth-provider APIs are not part of API v1.
- **Telephony calls** need provider-independent resources plus explicit side-effect, recording,
  privacy, and delegated-user semantics.
- **File sharing** needs a public share-link lifecycle distinct from private transfer intents and
  the internal device-synchronization protocol.
- **Commerce orders** need a customer-facing order resource rather than exposure of internal
  project-automation state.
- **Report jobs** need immutable definitions, bounded execution, private result storage, and
  snapshot semantics.
- **Import jobs** need schema-versioned validation, dry-run results, idempotent commit, per-row
  outcomes, and safe rollback boundaries.

Future 1.x releases may add qualified resources and commands without weakening stable 1.1
behavior. Existing operation semantics, scopes, errors, regional routing, and security boundaries
remain compatible throughout the major version. A breaking change requires a new API major.

See the [API v1 reference](/api/v1/reference/), [CLI commands](/cli/commands/), and [MCP tool policy](/mcp/tools-and-security/) for the current public surface.
