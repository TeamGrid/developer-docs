---
title: teamgrid_project_statement_create
description: "Input schema, permissions, API mapping and write behavior for teamgrid_project_statement_create."
owner: Developer Platform
reviewedAt: 2026-10-01
---

`teamgrid_project_statement_create` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `full`, `finance-write`.

Create a project statement. Changes the selected workspace under current API permissions. Reuse the same idempotencyKey and payload for the same intent.

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
          "if": {
            "properties": {
              "type": {
                "const": "product"
              }
            },
            "required": [
              "type"
            ]
          },
          "then": {
            "properties": {
              "count": {
                "maximum": 1000000,
                "minimum": 1,
                "type": "integer"
              },
              "productId": {
                "maxLength": 128,
                "minLength": 1,
                "type": "string"
              }
            },
            "required": [
              "count",
              "productId"
            ]
          }
        },
        {
          "if": {
            "properties": {
              "type": {
                "const": "manual"
              }
            },
            "required": [
              "type"
            ]
          },
          "then": {
            "properties": {
              "productId": {
                "type": "null"
              }
            }
          }
        }
      ],
      "properties": {
        "amount": {
          "maximum": 1000000000000,
          "minimum": 0,
          "type": [
            "number",
            "null"
          ],
          "description": "The amount associated with this project statement."
        },
        "comment": {
          "maxLength": 50000,
          "type": [
            "string",
            "null"
          ],
          "description": "The comment associated with this project statement."
        },
        "count": {
          "maximum": 1000000,
          "minimum": 1,
          "type": [
            "integer",
            "null"
          ],
          "description": "The count associated with this project statement."
        },
        "date": {
          "format": "date-time",
          "type": "string",
          "description": "ISO 8601 timestamp for date."
        },
        "description": {
          "maxLength": 50000,
          "type": [
            "string",
            "null"
          ],
          "description": "Human-readable description of the resource."
        },
        "isCharge": {
          "type": "boolean",
          "description": "Whether is charge applies to this project statement."
        },
        "productNumber": {
          "maxLength": 1000,
          "type": [
            "string",
            "null"
          ],
          "description": "The product number associated with this project statement."
        },
        "purchasePrice": {
          "maximum": 1000000000000,
          "minimum": 0,
          "type": [
            "number",
            "null"
          ],
          "description": "Requires project-statements:finance:write when supplied."
        },
        "title": {
          "maxLength": 500,
          "minLength": 1,
          "type": "string",
          "description": "Human-readable title of the resource."
        },
        "projectId": {
          "maxLength": 128,
          "minLength": 1,
          "type": "string",
          "description": "Identifier of the related project."
        },
        "productId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "The product id associated with this project statement."
        },
        "type": {
          "enum": [
            "manual",
            "product"
          ],
          "type": "string",
          "description": "Canonical type discriminator for this resource."
        }
      },
      "required": [
        "date",
        "isCharge",
        "projectId",
        "title",
        "type"
      ],
      "type": "object",
      "description": "Public API representation of project statement."
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

Required scope: `project-statements:write`.

- [`createProjectStatement`](/api/v1/reference/operations/createprojectstatement/) — `POST /project-statements`

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

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_project_statement_create operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `project-statements:write` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
