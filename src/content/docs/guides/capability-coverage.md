---
title: Capability coverage
description: Understand how API v1 operations map to the TeamGrid SDK, CLI, and curated MCP server.
---

TeamGrid maintains one versioned capability contract alongside OpenAPI. It requires an SDK method, CLI command, and explicit MCP decision for every public API operation. CI fails when any surface drifts.

The current controlled-beta API v1 contract contains 62 paths and 106 operations. The TypeScript SDK
and CLI map all 106 operations. MCP has an explicit decision for every operation: 29 bounded reads
are available in the `all` profile, while the least-privilege `core` default exposes 15. Writes,
destructive lifecycle operations, project statements, the high-volume change feed, webhook delivery
history, API discovery, and reveal-once secrets are deliberately not exposed through MCP.

The cross-interface contract currently governs workspace, projects and asynchronous project
lifecycle operations, tasks and timers, time entries, contacts, call notes, contact groups, users,
lists, services, tags, custom-field definitions, products, product groups, project statements, audit
events, webhooks, credential-owned webhook delivery history, custom-field values, project templates,
and planned work. Finance fields are scope-gated, and MCP product reads always remove acquisition
cost. The change feed supplies a metadata-only, cell-local synchronization boundary rather than
resource payloads.

## Product capability ledger

Operation parity is not the same as total TeamGrid product coverage. The separate product ledger
classifies 73 capabilities against the current implementation:

| Status | Count | Meaning |
| --- | ---: | --- |
| Released in the controlled-beta contract | 15 | A bounded public v1 workflow is implemented across its required surfaces |
| Partial | 16 | Some useful behavior exists, but the product workflow is not yet complete |
| Planned | 36 | The workflow remains on the roadmap and is not part of the current contract |
| Intentionally private | 6 | The capability is an implementation or privileged control plane, not a public API target |

Examples of planned work include scheduling availability, absences, appointments, comments,
documents and files, activity, integrations, search, reporting, and imports and exports. Partial
classification applies to areas such as read projections, credentials, time entries, audit,
webhooks, change feed, custom-field values, project templates, and planned-work lifecycle where
additional product semantics remain.

Raw database access, generic Meteor/DDP calls, superadmin controls, provider secrets, internal
automation tasks, and the file-device synchronization protocol remain private. Customer workflows
are represented by stable resources and domain commands instead of those internals.

See the [API v1 reference](/api/v1/reference/), [CLI commands](/cli/commands/), and [MCP tool policy](/mcp/tools-and-security/) for the current public surface.
