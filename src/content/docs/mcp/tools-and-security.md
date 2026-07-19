---
title: MCP tools and security
description: Review the exact read-only TeamGrid MCP tool surface, pagination behavior, and trust boundaries.
---

## Available tools

| Tool | Purpose |
| --- | --- |
| `teamgrid_workspace_get` | Read workspace, region, and cell metadata |
| `teamgrid_projects_list` | List projects |
| `teamgrid_tasks_list` | List tasks with project, assignee, and status filters |
| `teamgrid_task_get` | Read one task by ID |
| `teamgrid_time_entries_list` | List time entries with date, task, and user filters |
| `teamgrid_contacts_list` | List people or companies |
| `teamgrid_users_list` | List workspace users |
| `teamgrid_webhooks_list` | List configured webhooks without changing them |
| `teamgrid_audit_events_list` | List Developer Platform audit events |

List tools return API v1 cursor metadata. Pass the returned opaque cursor to continue; do not construct or decode cursors.

## Security model

The host can read every object allowed by the selected API credential. The local server does not broaden those permissions, but model prompts, host logs, tool transcripts, and third-party extensions can still become data-exposure paths.

- Create a dedicated credential with the smallest practical scopes.
- Select the intended TeamGrid profile explicitly.
- Enable the server only in hosts and workspaces you trust.
- Review tool calls and results before using them in consequential decisions.
- Revoke the TeamGrid credential to terminate access.
- Inspect API v1 audit events for access history.

MCP tools intentionally cannot create, update, archive, or remove TeamGrid resources. Use the API, SDK, or CLI for an explicitly controlled write workflow.
