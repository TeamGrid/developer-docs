---
title: MCP tool reference
description: Browse the exact input contract, API mapping, scopes, output behavior, safety classification, and failure modes for all 29 TeamGrid MCP tools.
owner: Developer Platform
reviewedAt: 2026-08-10
---

This reference is generated from the tool registry shipped in
`@teamgrid/mcp-server@1.0.5` and joined with the pinned API v1 capability
contract. It contains 29 read-only tools. Unknown input properties are
rejected by every tool schema.

## Profiles at a glance

| Selected profile | Advertised tools | Adds beyond `core` |
| --- | ---: | --- |
| `core` | 15 | Operational workspace, project, task, time-entry, list, tag, product, and product-group reads |
| `collaboration` | 22 | Contacts, contact groups, call notes, and users |
| `governance` | 21 | Custom-field definitions, services, and webhook configuration |
| `all` | 29 | Union of both broader profiles plus curated federated search |

Select the narrowest profile your workflow needs. A profile controls which tools are advertised;
the API credential scopes and resource grants still control which data each advertised tool can
read.

## Core profile

| Tool | Purpose | Required scope | Data classification |
| --- | --- | --- | --- |
| [`teamgrid_list_get`](/mcp/reference/teamgrid_list_get/) | Get one TeamGrid list by id. | `lists:read` | operational-data |
| [`teamgrid_lists_list`](/mcp/reference/teamgrid_lists_list/) | List TeamGrid task lists. | `lists:read` | operational-data |
| [`teamgrid_product_get`](/mcp/reference/teamgrid_product_get/) | Get one TeamGrid product without exposing its purchase price. | `products:read` | operational-data |
| [`teamgrid_product_group_get`](/mcp/reference/teamgrid_product_group_get/) | Get one TeamGrid product group by id. | `product-groups:read` | operational-data |
| [`teamgrid_product_groups_list`](/mcp/reference/teamgrid_product_groups_list/) | List TeamGrid product groups with stable cursor pagination. | `product-groups:read` | operational-data |
| [`teamgrid_products_list`](/mcp/reference/teamgrid_products_list/) | List TeamGrid products without exposing purchase prices. | `products:read` | operational-data |
| [`teamgrid_project_get`](/mcp/reference/teamgrid_project_get/) | Get one TeamGrid project by id. | `projects:read` | operational-data |
| [`teamgrid_projects_list`](/mcp/reference/teamgrid_projects_list/) | List TeamGrid projects with stable cursor pagination. | `projects:read` | operational-data |
| [`teamgrid_tag_get`](/mcp/reference/teamgrid_tag_get/) | Get one TeamGrid tag by id. | `tags:read` | operational-data |
| [`teamgrid_tags_list`](/mcp/reference/teamgrid_tags_list/) | List TeamGrid tags. | `tags:read` | operational-data |
| [`teamgrid_task_get`](/mcp/reference/teamgrid_task_get/) | Get one TeamGrid task by id. | `tasks:read` | operational-data |
| [`teamgrid_tasks_list`](/mcp/reference/teamgrid_tasks_list/) | List TeamGrid tasks with optional project, assignee, and status filters. | `tasks:read` | operational-data |
| [`teamgrid_time_entries_list`](/mcp/reference/teamgrid_time_entries_list/) | List TeamGrid time entries with stable cursor pagination. | `time-entries:read` | work-record-data |
| [`teamgrid_time_entry_get`](/mcp/reference/teamgrid_time_entry_get/) | Get one TeamGrid time entry by id. | `time-entries:read` | work-record-data |
| [`teamgrid_workspace_get`](/mcp/reference/teamgrid_workspace_get/) | Get the authenticated TeamGrid workspace and its region/cell metadata. | `workspace:read` | tenant-metadata |

## Collaboration profile

| Tool | Purpose | Required scope | Data classification |
| --- | --- | --- | --- |
| [`teamgrid_call_note_get`](/mcp/reference/teamgrid_call_note_get/) | Get one TeamGrid call note. The result can contain conversation data. | `call-notes:read` | conversation-data |
| [`teamgrid_call_notes_list`](/mcp/reference/teamgrid_call_notes_list/) | List TeamGrid call notes. Results can contain sensitive conversation data. | `call-notes:read` | conversation-data |
| [`teamgrid_contact_get`](/mcp/reference/teamgrid_contact_get/) | Get one TeamGrid contact by id. The result can contain personal data. | `contacts:read` | personal-data |
| [`teamgrid_contact_group_get`](/mcp/reference/teamgrid_contact_group_get/) | Get one TeamGrid contact group by id. | `contact-groups:read` | personal-data |
| [`teamgrid_contact_groups_list`](/mcp/reference/teamgrid_contact_groups_list/) | List TeamGrid contact groups with stable cursor pagination. | `contact-groups:read` | personal-data |
| [`teamgrid_contacts_list`](/mcp/reference/teamgrid_contacts_list/) | List TeamGrid contacts. Results can contain personal data. | `contacts:read` | personal-data |
| [`teamgrid_users_list`](/mcp/reference/teamgrid_users_list/) | List users in the authenticated TeamGrid workspace. | `users:read` | personal-data |

## Governance profile

| Tool | Purpose | Required scope | Data classification |
| --- | --- | --- | --- |
| [`teamgrid_custom_field_definition_get`](/mcp/reference/teamgrid_custom_field_definition_get/) | Get one canonical TeamGrid custom-field definition without exposing legacy defaults. | `custom-field-definitions:read` | governance-metadata |
| [`teamgrid_custom_field_definitions_list`](/mcp/reference/teamgrid_custom_field_definitions_list/) | List canonical TeamGrid custom-field definitions without exposing defaults. | `custom-field-definitions:read` | governance-metadata |
| [`teamgrid_service_get`](/mcp/reference/teamgrid_service_get/) | Get one TeamGrid service and its potentially sensitive billing rate. | `services:read` | commercial-data |
| [`teamgrid_services_list`](/mcp/reference/teamgrid_services_list/) | List TeamGrid services. | `services:read` | commercial-data |
| [`teamgrid_webhook_get`](/mcp/reference/teamgrid_webhook_get/) | Get one TeamGrid webhook without exposing its signing secret. | `webhooks:read` | security-configuration |
| [`teamgrid_webhooks_list`](/mcp/reference/teamgrid_webhooks_list/) | List configured TeamGrid webhooks without modifying them. | `webhooks:read` | security-configuration |

## All-only curated tool

| Tool | Purpose | Required scope | Data classification |
| --- | --- | --- | --- |
| [`teamgrid_search`](/mcp/reference/teamgrid_search/) | Search authorized TeamGrid contacts, projects, and tasks. Returns at most 50 curated metadata-only results; contact matches can contain personal data. | `search:read` | cross-domain-sensitive |

## Shared result contract

Every successful value is returned twice: as MCP structured content and as the same serialized JSON
in a text content block. Results are capped at 256 KiB. A larger result becomes
`result_too_large`; reduce a list page or narrow the filters. Upstream failures become
`teamgrid_request_failed` with developer secrets redacted.

List tools use opaque cursor pagination. Pass `meta.page.nextCursor` back as `cursor`; never
construct or decode a cursor. The federated search tool is bounded to 50 results and is not
cursor-paginated.

Continue with the [first MCP query](/mcp/first-query/), [configuration](/mcp/configuration/), or
[MCP troubleshooting](/mcp/troubleshooting/).
