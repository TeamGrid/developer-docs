---
title: teamgrid_task_move
description: "Input schema, permissions, API mapping and write behavior for teamgrid_task_move."
owner: Developer Platform
reviewedAt: 2026-10-01
---

`teamgrid_task_move` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `work`, `full`, `tasks-write`.

Move or reorder a task. Changes the selected workspace under current API permissions. Read the target first; submit its exact ETag. On conflict, review the current state before making a new decision.

## Input schema

**Stable release:** this is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.2.2`:

```json
{
  "type": "object",
  "properties": {
    "workspaceId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128,
      "description": "Workspace returned by teamgrid_workspace_get and selected for this exact action."
    },
    "id": {
      "maxLength": 128,
      "minLength": 1,
      "type": "string"
    },
    "expectedRevision": {
      "pattern": "^\"tsk1-[a-f0-9]{64}\"$",
      "type": "string",
      "description": "Exact strong ETag (including quotes) from the read reviewed for this action. Never replace it automatically after a conflict."
    },
    "data": {
      "additionalProperties": false,
      "properties": {
        "assigneeId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Existing assignee whose independent placement is moved. Use the task update endpoint to change assignments."
        },
        "axis": {
          "enum": [
            "assignee",
            "personalList",
            "projectList"
          ],
          "type": "string",
          "description": "Canonical axis value for this task placement."
        },
        "groupId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Identifier of the related workspace group."
        },
        "listId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Identifier of the related task list."
        },
        "nextTaskId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "The next task id associated with this task placement."
        },
        "personalListId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "The personal list id associated with this task placement."
        },
        "previousTaskId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "The previous task id associated with this task placement."
        },
        "projectId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Identifier of the related project."
        }
      },
      "required": [
        "axis"
      ],
      "type": "object",
      "description": "Public API representation of task placement."
    }
  },
  "required": [
    "workspaceId",
    "id",
    "expectedRevision",
    "data"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scope: `tasks:write`.

- [`moveTask`](/api/v1/reference/operations/movetask/) — `POST /tasks/{id}/move`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Output and limits

A compact mutation receipt includes target and revision when available; outcome metadata distinguishes accepted, complete, partial and uncertain results. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

The linked API operation is the canonical reference for the response envelope and resource schema.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**workspace-mutation:** This changes workspace state and may trigger business or external effects. Use its exact scope, revision and idempotency contract; profile selection grants no authority.

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_task_move operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `id` is missing or violates this tool’s exact input schema, including any pattern or length restriction. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `tasks:write` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
