---
title: Capability coverage
description: Understand how API v1 operations map to the TeamGrid SDK, CLI, and curated MCP server.
---

TeamGrid maintains one versioned capability contract alongside OpenAPI. It requires an SDK method, CLI command, and explicit MCP decision for every public API operation. CI fails when any surface drifts.

The `1.0.0-beta.2` controlled-beta API v1 contract contains 111 paths and 181 operations. The TypeScript SDK
and CLI map all 181 operations. MCP has an explicit decision for every operation: 29 bounded reads
are available in the `all` profile, while the least-privilege `core` default exposes 15. Writes,
destructive lifecycle operations, project statements, webhook delivery
history, audit events, API discovery, and reveal-once secrets are deliberately not exposed through MCP.

The cross-interface contract currently governs workspace, projects and asynchronous project
lifecycle operations, tasks and timers, time entries, calendar appointments, absences, availability,
contacts, comments, activity, documents, files, workspace administration, search, bounded exports,
automation definitions and runs, integration-installation status, call notes, contact groups, users,
metadata, custom fields, commerce resources, audit events, webhooks, delivery history, templates, and
planned work. Finance fields are scope-gated, and MCP product reads always remove acquisition cost.
The durable change feed is deliberately outside the first public beta contract.

The same release boundary keeps 25 project, task, project-template, and associated asynchronous
operation endpoints on a static non-CAS contract. They do not expose developer revision fields or
core `If-Match` requirements. This does not remove the 31 independent `If-Match` operations for
resource families such as planned work, custom-field values, calendar data, documents, workspace
administration, automations, workspace settings, and webhook-secret rotation.

## Authorization registry

Transport parity is only one half of the contract. TeamGrid also maintains a code-owned action-policy
registry for all 181 operations. Exactly one discovery operation is anonymous; all 180 remaining
operations are bound to their credential scopes, App execution methods, product-permission
resolvers, entitlement checks, resource-grant resolvers, conditional domain policies, sensitive
field overlays, allowed principal kinds, and one of 12 principal-policy rollout families.

The current registry identity and SHA-256 are published in the
[machine-readable contract artifact](/openapi/developer-action-policy-registry.json). The API and
owning App cell exchange this exact identity during startup compatibility negotiation and fail
readiness on any mismatch. The same identity is included in the canonical deployment manifest.

V5 declares every request-dependent scope and dynamic policy used by collaboration, automation,
custom-field content, calendar, work-management, and search/export handlers. The owning App cell
resolves stored targets before evaluating grants, and its V13 runtime provides one exact resolver
for every authenticated action. Promotion remains evidence-gated per cell; contract completeness
alone does not activate principal enforcement.

This registry does not make native service accounts or delegated OAuth generally available. Those
principal types remain separately feature-gated until cell-local migration, shadow comparison, and
family qualification have completed. Existing credentials are never silently converted into
autonomous service accounts.

## Product capability ledger

Operation parity is not the same as total TeamGrid product coverage. The separate product ledger
classifies 73 capabilities against the current implementation:

| Status | Count | Meaning |
| --- | ---: | --- |
| Released in the controlled-beta contract | 39 | A bounded public v1 workflow is implemented across its required surfaces |
| Partial | 15 | Some useful behavior exists, but the product workflow is not yet complete |
| Planned | 13 | The workflow remains on the roadmap and is not part of the current contract |
| Intentionally private | 6 | The capability is an implementation or privileged control plane, not a public API target |

System capability discovery, workspace entitlements, safe workspace settings, the event catalog,
and webhook-secret rotation are now released in the controlled-beta contract. Remaining planned
work includes service accounts, delegated OAuth, project sharing, task ordering, subtasks and bulk
operations, billing, telephony, file sharing, orders, reports, imports, and audit export. Partial
classification applies to discovery, credentials, several core project, task, contact and
time-entry projections, custom-field values, project templates, planned-work lifecycle, audit, and
webhooks where additional product semantics remain. The change feed is excluded rather than marked
as a partially released capability.

Raw database access, generic Meteor/DDP calls, superadmin controls, provider secrets, internal
automation tasks, and the file-device synchronization protocol remain private. Customer workflows
are represented by stable resources and domain commands instead of those internals.

See the [API v1 reference](/api/v1/reference/), [CLI commands](/cli/commands/), and [MCP tool policy](/mcp/tools-and-security/) for the current public surface.
