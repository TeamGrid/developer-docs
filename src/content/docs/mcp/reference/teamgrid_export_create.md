---
title: teamgrid_export_create
description: "Input schema, permissions, API mapping and write behavior for teamgrid_export_create."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_export_create` is a write-capable TeamGrid MCP tool. It is advertised in: `full`, `admin-write`.

Create an asynchronous export. Changes the selected workspace under current API permissions. Reuse the same idempotencyKey and payload for the same intent. Administrative action: review the exact target and access impact with the user.

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `workspaceId` | Required | string | Workspace returned by teamgrid_workspace_get and selected for this exact action. |
| `idempotencyKey` | Required | string | Stable key for this exact intent. Retain and reuse the same key and payload after a timeout; a timeout does not prove failure. |
| `data` | Required | object | Public API representation of export. |

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
    "idempotencyKey": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128,
      "pattern": "^[\\x21-\\x7e]+$",
      "description": "Stable key for this exact intent. Retain and reuse the same key and payload after a timeout; a timeout does not prove failure."
    },
    "data": {
      "additionalProperties": false,
      "allOf": [
        {
          "else": {
            "not": {
              "anyOf": [
                {
                  "required": [
                    "createdAtFrom"
                  ]
                },
                {
                  "required": [
                    "createdAtTo"
                  ]
                }
              ]
            }
          },
          "if": {
            "properties": {
              "resourceType": {
                "const": "auditEvents"
              }
            },
            "required": [
              "resourceType"
            ]
          },
          "then": {
            "not": {
              "anyOf": [
                {
                  "required": [
                    "includeArchived"
                  ]
                },
                {
                  "required": [
                    "updatedFrom"
                  ]
                },
                {
                  "required": [
                    "updatedUntil"
                  ]
                }
              ]
            },
            "required": [
              "createdAtTo"
            ]
          }
        }
      ],
      "properties": {
        "createdAtFrom": {
          "format": "date-time",
          "type": "string",
          "description": "ISO 8601 timestamp for created at from."
        },
        "createdAtTo": {
          "format": "date-time",
          "type": "string",
          "description": "ISO 8601 timestamp for created at to."
        },
        "fields": {
          "items": {
            "maxLength": 80,
            "minLength": 1,
            "type": "string"
          },
          "maxItems": 16,
          "minItems": 1,
          "type": "array",
          "uniqueItems": true,
          "description": "The fields associated with this export."
        },
        "fileName": {
          "maxLength": 120,
          "minLength": 1,
          "type": "string",
          "description": "Original or user-visible name of the file."
        },
        "format": {
          "const": "csv",
          "type": "string",
          "description": "The format associated with this export."
        },
        "includeArchived": {
          "type": "boolean",
          "description": "Whether include archived applies to this export."
        },
        "maxRows": {
          "maximum": 10000,
          "minimum": 1,
          "type": "integer",
          "description": "The max rows associated with this export."
        },
        "resourceType": {
          "enum": [
            "auditEvents",
            "contacts",
            "projects",
            "taskRecurrences",
            "tasks",
            "timeEntries"
          ],
          "type": "string",
          "description": "Canonical TeamGrid resource type."
        },
        "updatedFrom": {
          "format": "date-time",
          "type": "string",
          "description": "ISO 8601 timestamp for updated from."
        },
        "updatedUntil": {
          "format": "date-time",
          "type": "string",
          "description": "ISO 8601 timestamp for updated until."
        }
      },
      "required": [
        "resourceType"
      ],
      "type": "object",
      "description": "Public API representation of export."
    }
  },
  "required": [
    "workspaceId",
    "idempotencyKey",
    "data"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scopes (all): `exports:write`, `workspace:read`. Conditional domain scopes: `contacts:read`, `projects:read`, `task-recurrences:read`, `tasks:read`, `time-entries:read`, `audit:read`; the applicable scopes depend on the request and the stored target. See the linked API operation and [scope rules](/mcp/tools-and-security/#field-level-and-scope-boundaries).

- [`createExport`](/api/v1/reference/operations/createexport/) — `POST /exports`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Write preconditions

Concurrency: **unconditional**. No top-level revision precondition is declared; do not assume conflict protection. Reuse `idempotencyKey` only for the same creation intent and exact payload.

## Output and limits

A compact mutation receipt includes target and revision when available; outcome metadata distinguishes accepted, complete, partial and uncertain results. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_export_create.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**workspace-mutation:** This changes workspace state and may trigger business or external effects. Use its exact scope, revision and idempotency contract; profile selection grants no authority.

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_export_create operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_export_create`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `exports:write` and `workspace:read` and an applicable conditional domain scope (`contacts:read`, `projects:read`, `task-recurrences:read`, `tasks:read`, `time-entries:read`, `audit:read`) or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| The connection ends while awaiting the write result. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
