---
title: teamgrid_tasks_bulk_update
description: "Input schema, permissions, API mapping and write behavior for teamgrid_tasks_bulk_update."
owner: Developer Platform
reviewedAt: 2026-10-01
---

`teamgrid_tasks_bulk_update` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `full`, `tasks-write`.

Update multiple tasks safely. Changes the selected workspace under current API permissions. Each item requires the developerRevision from its reviewed task. Results are independent: inspect every item for success, conflict or failure. Never refresh revisions and retry the entire batch automatically.

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
    "data": {
      "additionalProperties": false,
      "properties": {
        "items": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "data": {
                "additionalProperties": false,
                "dependentRequired": {
                  "descriptionFormat": [
                    "description"
                  ]
                },
                "minProperties": 1,
                "properties": {
                  "billable": {
                    "type": [
                      "boolean",
                      "null"
                    ],
                    "description": "Whether this time or service can be billed."
                  },
                  "contactId": {
                    "maxLength": 128,
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "Identifier of the related contact."
                  },
                  "description": {
                    "maxLength": 50000,
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "Human-readable description of the resource."
                  },
                  "descriptionFormat": {
                    "enum": [
                      "plain-text",
                      "markdown-v1"
                    ],
                    "type": "string",
                    "description": "How to interpret the task description. Legacy and unmarked descriptions are plain-text; markdown-v1 enables TeamGrid Markdown."
                  },
                  "dueAt": {
                    "format": "date-time",
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "ISO 8601 timestamp for due at."
                  },
                  "name": {
                    "maxLength": 500,
                    "minLength": 1,
                    "type": "string",
                    "description": "Human-readable name of the resource."
                  },
                  "plannedEndAt": {
                    "format": "date-time",
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "ISO 8601 timestamp for planned end at."
                  },
                  "plannedMinutes": {
                    "minimum": 0,
                    "type": [
                      "integer",
                      "null"
                    ],
                    "description": "The planned minutes associated with this task bulk data."
                  },
                  "plannedStartAt": {
                    "format": "date-time",
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "ISO 8601 timestamp for planned start at."
                  },
                  "serviceId": {
                    "maxLength": 128,
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "Identifier of the related service."
                  },
                  "subscriberIds": {
                    "items": {
                      "maxLength": 128,
                      "minLength": 1,
                      "type": "string"
                    },
                    "maxItems": 500,
                    "type": [
                      "array",
                      "null"
                    ],
                    "description": "Ordered set of subscriber identifiers associated with this task bulk data."
                  },
                  "tagIds": {
                    "items": {
                      "maxLength": 128,
                      "minLength": 1,
                      "type": "string"
                    },
                    "maxItems": 500,
                    "type": [
                      "array",
                      "null"
                    ],
                    "description": "Ordered set of tag identifiers associated with this task bulk data."
                  }
                },
                "type": "object",
                "description": "Response data for the completed request."
              },
              "id": {
                "maxLength": 128,
                "minLength": 1,
                "type": "string",
                "description": "Stable TeamGrid identifier for this resource."
              },
              "revision": {
                "pattern": "^[a-f0-9]{64}$",
                "type": "string",
                "description": "Strong resource revision used for optimistic concurrency control."
              }
            },
            "required": [
              "id",
              "revision",
              "data"
            ],
            "type": "object",
            "description": "Public API representation of task bulk item."
          },
          "maxItems": 35,
          "minItems": 1,
          "type": "array",
          "description": "The items associated with this task bulk."
        }
      },
      "required": [
        "items"
      ],
      "type": "object",
      "description": "Public API representation of task bulk."
    }
  },
  "required": [
    "workspaceId",
    "data"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scope: `tasks:write`.

- [`bulkUpdateTasks`](/api/v1/reference/operations/bulkupdatetasks/) — `POST /tasks/bulk-update`

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

> Prepare a teamgrid_tasks_bulk_update operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `tasks:write` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
