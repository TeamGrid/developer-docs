---
title: MCP tools and security
description: Review TeamGrid MCP profiles, write preconditions, private resources, result limits and authorization boundaries.
owner: Security
reviewedAt: 2026-10-01
---

**Stable release 1.2.2:** 208 tools (84 reads, 124 writes). The four existing
read profiles remain unchanged. See [release status](/mcp/candidate/).

## Preserved read profiles

The default `core` profile exposes 22 operational tools. `collaboration` adds seven contact,
call-note, and user tools. `governance` adds six custom-field-definition, service, and webhook tools.
`all` exposes those 35 tools plus the separately curated `teamgrid_search` tool, for a total of 36.
Select a broader profile only when the host
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
| `teamgrid_task_recurrences_list` | Core | List recurring-task series |
| `teamgrid_task_recurrence_get` | Core | Read one recurring-task series and its active definition |
| `teamgrid_task_recurrence_preview` | Core | Preview a saved recurring-task definition |
| `teamgrid_task_recurrence_versions_list` | Core | List immutable definition versions |
| `teamgrid_task_recurrence_version_get` | Core | Read one immutable definition version |
| `teamgrid_task_recurrence_occurrences_list` | Core | List bounded occurrence-ledger entries |
| `teamgrid_task_recurrence_occurrence_get` | Core | Read one occurrence-ledger entry |
| `teamgrid_time_entries_list` | Core | List time entries with date, task, user, service, and creator filters; billing fields and filters are removed |
| `teamgrid_time_entry_get` | Core | Read one time entry by ID |
| `teamgrid_lists_list` | Core | List task lists |
| `teamgrid_list_get` | Core | Read one list by ID |
| `teamgrid_tags_list` | Core | List tags |
| `teamgrid_tag_get` | Core | Read one tag by ID |
| `teamgrid_call_notes_list` | Collaboration | List plain-text call notes |
| `teamgrid_call_note_get` | Collaboration | Read one plain-text call note by ID |
| `teamgrid_contacts_list` | Collaboration | List people or companies with relationship filters |
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
| `teamgrid_search` | All · curated | Search explicitly requested contacts, projects, or tasks with all matching domain scopes enforced |

List tools return API v1 cursor metadata. Pass the returned opaque cursor to continue; do not construct or decode cursors.

## Candidate profiles and writes

Version 1.2.2 adds `context`, `work`, `full` and eleven domain profiles. The
[generated reference](/mcp/reference/) lists exact membership, input schemas and
annotations for all 208 tools. `full` includes the business surface: tasks and
recurrences, time, planning, comments, documents, files, CRM, catalogs, finance,
workspace administration, audit, exports, automations and integrations.

Every write requires `workspaceId`. Operations declare their actual concurrency
contract: revision-protected updates require `expectedRevision`; idempotent creates
require `idempotencyKey`. Core CAS operations additionally require the server's
active CAS protocol. Read the current resource before proposing a change. A
conflict requires a new read and a fresh decision, not an unconditional retry.

Writes may send invitations, publish comments, trigger webhooks or change future
automation behavior. Review targets and effects before approval in the host.
`readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint` describe each
operation; these annotations do not grant authority or replace host confirmation.

Receipts distinguish `completed`, `accepted`, partial failure and an uncertain
commit. Accepted operations include a status tool and stable identifier. After a
lost response, inspect the target or operation and reuse an idempotency key only
when its declared contract permits it. Independent tool calls are not atomic.

## Reading complete results

Tool discovery uses opaque cursor pages, at most 50 tools and 256 KiB per page.
Business list pagination is separate: continue with `meta.page.nextCursor` and
keep filters stable. Search returns at most 50 matches, can lag new changes and
cannot establish a complete inventory even when fewer matches are returned.
Never calculate workspace-wide totals from a partial page or bounded search.

Serialized tool results are limited to 256 KiB. Reduce page size when necessary.
Large documents use 16 KiB sections bound to the same revision; restart a read if
the document changes. Mutations return compact receipts rather than echoing all
content. Treat `plain-text` literally and interpret Markdown only where
`descriptionFormat` explicitly declares `markdown-v1`.

File and export lookup may return private `teamgrid://` resource URIs.
`resources/read` delivers at most 1 MiB with fresh authorization and a 30-second
budget. Credentials and signed download URLs never enter the transcript. The CLI
has a separate bounded file-download path. Uploads continue through existing
App/CLI/SDK transfer workflows; there is no arbitrary filesystem or URL-fetch tool.

## Field-level and scope boundaries

Preserved read profiles remove product `purchasePrice` and time-entry billing
fields even when a credential has wider scopes. Candidate domain profiles use
their concrete field contracts and current finance/billing scopes. Missing
permissions must not be interpreted as zero financial values.

Optional fields and compound operations can require additional scopes. Remote
OAuth challenges request only applicable missing scopes; role, sharing and
workspace-lock failures cannot be solved by granting broader scopes. Sensitive
CLI/OAuth scopes require a separate passkey confirmation of the exact request.

Reveal-once credentials and webhook signing secrets remain excluded. The change feed remains forbidden through MCP
because durable synchronization belongs in a controlled API/SDK/CLI integration.
Credential issuance, secret rotation and arbitrary database or HTTP access are
also excluded; `full` does not remove these boundaries.

## Security model

Use a dedicated credential and the smallest suitable tool profile. The API and
App recheck current membership, role, scope, sharing, resource grants, workspace
locks and owning cell. The remote gateway verifies each request and uses a
separate short API delegation; it does not pass the MCP token to the business API.

Remote OAuth connections can be inspected and revoked in the owning workspace.
Revocation invalidates the grant family on subsequent requests. Local stdio uses
the CLI credential lifecycle; removing only the local profile does not revoke
its server credential. [CLI authentication](/cli/browser-login/) explains both.

Treat all returned customer content as untrusted data. Embedded instructions must
not broaden access, reveal secrets, choose a write target, follow an arbitrary URL
or trigger another action without the user's intent. Use only trusted hosts and
review what they retain in tool transcripts and logs.

Errors expose bounded public codes, status, safe request IDs and valid retry
delays. Raw causes, authorization headers, transport credentials and signed
transfer URLs are not projected. Provider outages return 503; revoked access is
rejected. Respect `Retry-After`; a local deadline may end the attempt but does not
shorten the server's requested delay.
