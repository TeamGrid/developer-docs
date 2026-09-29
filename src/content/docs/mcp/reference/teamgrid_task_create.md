---
title: teamgrid_task_create
description: "Input schema, permissions, API mapping and write behavior for teamgrid_task_create."
owner: Developer Platform
reviewedAt: 2026-09-29
---

`teamgrid_task_create` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `work`, `full`, `tasks-write`.

Create a task. Changes the selected workspace under current API permissions. Reuse the same idempotencyKey and payload for the same intent.

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
          "not": {
            "properties": {
              "assigneeId": {
                "maxLength": 128,
                "type": [
                  "string",
                  "null"
                ],
                "description": "Identifier of the user assigned to this work item."
              },
              "assigneeIds": {
                "items": {
                  "maxLength": 128,
                  "minLength": 1,
                  "type": "string"
                },
                "maxItems": 20,
                "type": [
                  "array",
                  "null"
                ],
                "uniqueItems": true,
                "description": "Ordered, unique set of users assigned to this task. A task supports at most 20 assignees."
              }
            },
            "required": [
              "assigneeId",
              "assigneeIds"
            ]
          }
        },
        {
          "not": {
            "properties": {
              "assigneeId": {
                "type": "string",
                "description": "Identifier of the user assigned to this work item."
              },
              "groupId": {
                "type": "string",
                "description": "Identifier of the related workspace group."
              }
            },
            "required": [
              "assigneeId",
              "groupId"
            ]
          }
        },
        {
          "not": {
            "properties": {
              "assigneeIds": {
                "minItems": 1,
                "type": "array",
                "description": "Ordered, unique set of users assigned to this task. A task supports at most 20 assignees."
              },
              "groupId": {
                "type": "string",
                "description": "Identifier of the related workspace group."
              }
            },
            "required": [
              "assigneeIds",
              "groupId"
            ]
          }
        },
        {
          "not": {
            "properties": {
              "groupId": {
                "type": "string",
                "description": "Identifier of the related workspace group."
              },
              "primaryAssigneeId": {
                "type": "string",
                "description": "Primary assignee used for legacy placement and assigneeId compatibility. It must be included in assigneeIds."
              }
            },
            "required": [
              "groupId",
              "primaryAssigneeId"
            ]
          }
        },
        {
          "if": {
            "properties": {
              "primaryAssigneeId": {
                "type": "string"
              }
            },
            "required": [
              "primaryAssigneeId"
            ]
          },
          "then": {
            "anyOf": [
              {
                "properties": {
                  "assigneeId": {
                    "type": "string"
                  }
                },
                "required": [
                  "assigneeId"
                ]
              },
              {
                "properties": {
                  "assigneeIds": {
                    "minItems": 1,
                    "type": "array"
                  }
                },
                "required": [
                  "assigneeIds"
                ]
              }
            ]
          }
        }
      ],
      "dependentRequired": {
        "descriptionFormat": [
          "description"
        ]
      },
      "properties": {
        "assigneeId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Identifier of the user assigned to this work item."
        },
        "assigneeIds": {
          "items": {
            "maxLength": 128,
            "minLength": 1,
            "type": "string"
          },
          "maxItems": 20,
          "type": [
            "array",
            "null"
          ],
          "uniqueItems": true,
          "description": "Ordered, unique set of users assigned to this task. A task supports at most 20 assignees."
        },
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
          "description": "The planned minutes associated with this task."
        },
        "plannedStartAt": {
          "format": "date-time",
          "type": [
            "string",
            "null"
          ],
          "description": "ISO 8601 timestamp for planned start at."
        },
        "primaryAssigneeId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Primary assignee used for legacy placement and assigneeId compatibility. It must be included in assigneeIds."
        },
        "projectId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Identifier of the related project."
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
          "description": "Ordered set of subscriber identifiers associated with this task."
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
          "description": "Ordered set of tag identifiers associated with this task."
        }
      },
      "required": [
        "name"
      ],
      "type": "object",
      "description": "Public API representation of task."
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

Required scope: `tasks:write`.

- [`createTask`](/api/v1/reference/operations/createtask/) — `POST /tasks`

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

> Prepare a teamgrid_task_create operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

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
