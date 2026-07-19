---
title: Capability coverage
description: Understand how API v1 operations map to the TeamGrid SDK, CLI, and curated MCP server.
---

TeamGrid maintains one versioned capability contract alongside OpenAPI. It requires an SDK method, CLI command, and explicit MCP decision for every public API operation. CI fails when any surface drifts.

The current controlled-beta API v1 contract contains 107 paths and 176 operations. The TypeScript SDK
and CLI map all 176 operations. MCP has an explicit decision for every operation: 30 bounded reads
are available in the `all` profile, while the least-privilege `core` default exposes 15. Writes,
destructive lifecycle operations, project statements, the high-volume change feed, webhook delivery
history, API discovery, and reveal-once secrets are deliberately not exposed through MCP.

The cross-interface contract currently governs workspace, projects and asynchronous project
lifecycle operations, tasks and timers, time entries, calendar appointments, absences, availability,
contacts, comments, activity, documents, files, workspace administration, search, bounded exports,
automation definitions and runs, integration-installation status, call notes, contact groups, users,
metadata, custom fields, commerce resources, audit events, webhooks, delivery history, templates, and
planned work. Finance fields are scope-gated, and MCP product reads always remove acquisition cost.
The change feed supplies a metadata-only, cell-local synchronization boundary rather than resource
payloads.

## Product capability ledger

Operation parity is not the same as total TeamGrid product coverage. The separate product ledger
classifies 73 capabilities against the current implementation:

| Status | Count | Meaning |
| --- | ---: | --- |
| Released in the controlled-beta contract | 34 | A bounded public v1 workflow is implemented across its required surfaces |
| Partial | 15 | Some useful behavior exists, but the product workflow is not yet complete |
| Planned | 18 | The workflow remains on the roadmap and is not part of the current contract |
| Intentionally private | 6 | The capability is an implementation or privileged control plane, not a public API target |

Examples of planned work include workspace settings and entitlements, service accounts, delegated
OAuth, project sharing, task ordering, subtasks and bulk operations, billing, telephony, file sharing,
orders, reports, imports, audit export, an event catalog, and webhook-secret rotation. Partial
classification applies to discovery, credentials, several core project, task, contact and
time-entry projections, custom-field values, project templates, planned-work lifecycle, audit,
webhooks, and the change feed where additional product semantics remain.

Raw database access, generic Meteor/DDP calls, superadmin controls, provider secrets, internal
automation tasks, and the file-device synchronization protocol remain private. Customer workflows
are represented by stable resources and domain commands instead of those internals.

See the [API v1 reference](/api/v1/reference/), [CLI commands](/cli/commands/), and [MCP tool policy](/mcp/tools-and-security/) for the current public surface.
