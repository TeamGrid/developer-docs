---
title: teamgrid_task_recurrence_event_submit
description: "Input schema, permissions, API mapping and write behavior for teamgrid_task_recurrence_event_submit."
owner: Developer Platform
reviewedAt: 2026-09-29
---

`teamgrid_task_recurrence_event_submit` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `full`, `tasks-write`.

Submit an event to a task recurrence. Changes the selected workspace under current API permissions. The API has no conditional-write or replay contract for this action. Do not retry an uncertain result automatically; read the current state first. Changes can affect future automated actions; inspect the definition and schedule first. Acceptance is not completion. Use the corresponding operation-get tool to inspect the returned operation until terminal.

## Input schema

**Unpublished candidate:** this is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.2.2`:

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
    "data": {
      "additionalProperties": false,
      "properties": {
        "causationId": {
          "maxLength": 256,
          "minLength": 1,
          "pattern": "^[A-Za-z0-9_.:-]+$",
          "type": "string",
          "description": "The causation id associated with this task recurrence event submit."
        },
        "correlationId": {
          "maxLength": 256,
          "minLength": 1,
          "pattern": "^[A-Za-z0-9_.:-]+$",
          "type": "string",
          "description": "The correlation id associated with this task recurrence event submit."
        },
        "eventId": {
          "maxLength": 256,
          "minLength": 1,
          "type": "string",
          "description": "The event id associated with this task recurrence event submit."
        },
        "eventType": {
          "maxLength": 128,
          "minLength": 1,
          "type": "string",
          "description": "The event type associated with this task recurrence event submit."
        },
        "occurredAt": {
          "format": "date-time",
          "type": "string",
          "description": "ISO 8601 timestamp for occurred at."
        },
        "payload": {
          "additionalProperties": true,
          "maxProperties": 256,
          "type": "object",
          "description": "The payload associated with this task recurrence event submit."
        },
        "schemaVersion": {
          "const": 1,
          "type": "integer",
          "description": "The schema version associated with this task recurrence event submit."
        },
        "sourceId": {
          "maxLength": 256,
          "minLength": 1,
          "type": "string",
          "description": "The source id associated with this task recurrence event submit."
        }
      },
      "required": [
        "eventId",
        "eventType",
        "occurredAt",
        "schemaVersion",
        "sourceId"
      ],
      "type": "object",
      "description": "Public API representation of task recurrence event submit."
    }
  },
  "required": [
    "workspaceId",
    "id",
    "data"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scope: `task-recurrences:run`, `tasks:write`.

- [`submitTaskRecurrenceEvent`](/api/v1/reference/operations/submittaskrecurrenceevent/) — `POST /task-recurrences/{id}/events`

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

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":true,"idempotentHint":false,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_task_recurrence_event_submit operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `id` is missing or violates this tool’s exact input schema, including any pattern or length restriction. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `task-recurrences:run` or `tasks:write` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
