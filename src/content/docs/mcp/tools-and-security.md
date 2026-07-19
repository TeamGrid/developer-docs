---
title: MCP tools and security
description: Review the exact read-only TeamGrid MCP tool surface, pagination behavior, and trust boundaries.
---

## Available tools

The default `core` profile exposes 15 operational tools. `collaboration` adds seven contact,
call-note, and user tools. `governance` adds seven audit, custom-field-definition, service, and
webhook tools. `all` exposes those 29 tools plus the separately curated `teamgrid_search` tool, for a
total of 30. Select a broader profile only when the host
and workflow require it. Service reads are not in `core` because service objects can include
commercially sensitive billing rates.

| Tool | Profile | Purpose |
| --- | --- | --- |
| `teamgrid_workspace_get` | Core | Read workspace, region, and cell metadata |
| `teamgrid_products_list` | Core | List products without `purchasePrice` |
| `teamgrid_product_get` | Core | Read one product without `purchasePrice` |
| `teamgrid_product_groups_list` | Core | List product groups |
| `teamgrid_product_group_get` | Core | Read one product group by ID |
| `teamgrid_projects_list` | Core | List projects |
| `teamgrid_project_get` | Core | Read one project by ID |
| `teamgrid_tasks_list` | Core | List tasks with project, assignee, and status filters |
| `teamgrid_task_get` | Core | Read one task by ID |
| `teamgrid_time_entries_list` | Core | List time entries with date, task, and user filters |
| `teamgrid_time_entry_get` | Core | Read one time entry by ID |
| `teamgrid_lists_list` | Core | List task lists |
| `teamgrid_list_get` | Core | Read one list by ID |
| `teamgrid_tags_list` | Core | List tags |
| `teamgrid_tag_get` | Core | Read one tag by ID |
| `teamgrid_call_notes_list` | Collaboration | List plain-text call notes |
| `teamgrid_call_note_get` | Collaboration | Read one plain-text call note by ID |
| `teamgrid_contacts_list` | Collaboration | List people or companies |
| `teamgrid_contact_get` | Collaboration | Read one person or company by ID |
| `teamgrid_contact_groups_list` | Collaboration | List contact groups |
| `teamgrid_contact_group_get` | Collaboration | Read one contact group by ID |
| `teamgrid_users_list` | Collaboration | List workspace users |
| `teamgrid_custom_field_definitions_list` | Governance | List custom-field definitions and compatibility metadata |
| `teamgrid_custom_field_definition_get` | Governance | Read one custom-field definition by ID |
| `teamgrid_services_list` | Governance | List services, including billing configuration |
| `teamgrid_service_get` | Governance | Read one service, including its billing rate |
| `teamgrid_webhooks_list` | Governance | List configured webhooks without changing them |
| `teamgrid_webhook_get` | Governance | Read one webhook without its signing secret |
| `teamgrid_audit_events_list` | Governance | List Developer Platform audit events |
| `teamgrid_search` | All · curated | Search explicitly requested contacts, projects, or tasks with all matching domain scopes enforced |

List tools return API v1 cursor metadata. Pass the returned opaque cursor to continue; do not construct or decode cursors.

Every tool is declared read-only and idempotent. A serialized tool result is limited to 256 KiB;
request a smaller page if the server returns `result_too_large`. Call-note, contact, service, audit,
and webhook tools can expose personal, commercial, or security-sensitive information and should use
dedicated least-privilege credentials.

Product tools deliberately remove `purchasePrice` even if the selected API credential also has
`products:finance:read`. Project statements are forbidden in every MCP profile because they contain
financial and budget-adjacent data. Webhook delivery history is also forbidden because it contains
sensitive operational metadata. The change feed is forbidden because a high-volume durable
synchronization stream is not a bounded interactive model task. Custom-field values, project
templates and their instantiation status, and planned-work schedules and operation status are
forbidden because they expose sensitive per-resource workflow or workload data. These resources
cannot be enabled through `--tool-profile all`; no tool for them is registered or advertised.
Custom-field **definition** reads are the only custom-field exception and remain confined to the
`governance` profile.

Federated search is the only additional curated tool. It requires `search:read` plus every matching
domain read scope, accepts at most three resource types and 50 results, and is marked sensitive
because one query can cross several authorized domains. Calendar, absence, availability, comments,
activity, documents, files, workspace administration, exports, automation metadata and execution,
integration-installation status, capability and entitlement negotiation, the event catalog,
workspace settings, and webhook-secret rotation remain forbidden even in `all`. Reveal-once secrets
must never enter a model transcript.

## Security model

The host can read every object allowed by the selected API credential. The local server does not broaden those permissions, but model prompts, host logs, tool transcripts, and third-party extensions can still become data-exposure paths.

- Create a dedicated credential with the smallest practical scopes.
- Select the intended TeamGrid profile explicitly.
- Enable the server only in hosts and workspaces you trust.
- Review tool calls and results before using them in consequential decisions.
- Revoke the TeamGrid credential to terminate access.
- Inspect API v1 audit events for access history.

MCP tools intentionally cannot create, update, archive, or remove TeamGrid resources. Use the API, SDK, or CLI for an explicitly controlled write workflow.
