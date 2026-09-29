---
title: teamgrid_task_recurrence_occurrence_override
description: "Input schema, permissions, API mapping and write behavior for teamgrid_task_recurrence_occurrence_override."
owner: Developer Platform
reviewedAt: 2026-09-29
---

`teamgrid_task_recurrence_occurrence_override` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `full`, `tasks-write`.

Override a task recurrence occurrence. Changes the selected workspace under current API permissions. Read the target first; submit its exact ETag. On conflict, review the current state before making a new decision. Changes can affect future automated actions; inspect the definition and schedule first.

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
    "seriesId": {
      "maxLength": 128,
      "minLength": 1,
      "type": "string"
    },
    "occurrenceKey": {
      "maxLength": 256,
      "minLength": 1,
      "pattern": "^(occ1-[a-f0-9]{64}|seed:[A-Za-z0-9_-]{1,128})$",
      "type": "string"
    },
    "expectedRevision": {
      "pattern": "^\"tro1-[a-f0-9]{64}\"$",
      "type": "string",
      "description": "Exact strong ETag (including quotes) from the read reviewed for this action. Never replace it automatically after a conflict."
    },
    "createIfMissing": {
      "type": "boolean",
      "const": true,
      "description": "Create only an absent future occurrence. Mutually exclusive with expectedRevision."
    },
    "data": {
      "additionalProperties": false,
      "properties": {
        "action": {
          "enum": [
            "materialize",
            "skip"
          ],
          "type": "string",
          "description": "Canonical action represented by this record."
        },
        "placeholderToken": {
          "maxLength": 32768,
          "pattern": "^trp1\\.[A-Za-z0-9_-]+$",
          "type": "string",
          "description": "The placeholder token associated with this task recurrence occurrence override."
        },
        "scheduledForLocal": {
          "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2})?$",
          "type": "string",
          "description": "The scheduled for local associated with this task recurrence occurrence override."
        },
        "templatePatch": {
          "additionalProperties": false,
          "properties": {
            "billable": {
              "type": "boolean",
              "description": "Whether this time or service can be billed."
            },
            "contactId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related contact."
            },
            "customFieldValues": {
              "additionalProperties": {
                "oneOf": [
                  {
                    "type": [
                      "boolean",
                      "number",
                      "string",
                      "null"
                    ]
                  },
                  {
                    "items": {
                      "type": [
                        "boolean",
                        "number",
                        "string",
                        "null"
                      ]
                    },
                    "maxItems": 250,
                    "type": "array"
                  }
                ]
              },
              "maxProperties": 256,
              "type": "object",
              "description": "The custom field values associated with this task recurrence template patch."
            },
            "description": {
              "maxLength": 200000,
              "type": "string",
              "description": "Human-readable description of the resource."
            },
            "descriptionFormat": {
              "enum": [
                "markdown-v1",
                "plain-text"
              ],
              "type": "string",
              "description": "How to interpret the task description. Legacy and unmarked descriptions are plain-text; markdown-v1 enables TeamGrid Markdown."
            },
            "groupId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related workspace group."
            },
            "listId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related task list."
            },
            "name": {
              "maxLength": 1000,
              "minLength": 1,
              "type": "string",
              "description": "Human-readable name of the resource."
            },
            "personalListId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "The personal list id associated with this task recurrence template patch."
            },
            "plannedTime": {
              "maximum": 100000000,
              "minimum": 0,
              "type": "number",
              "description": "Planned effort in minutes."
            },
            "projectId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related project."
            },
            "serviceId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related service."
            },
            "subscriberIds": {
              "items": {
                "maxLength": 256,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string"
              },
              "maxItems": 250,
              "type": "array",
              "description": "Ordered set of subscriber identifiers associated with this task recurrence template patch."
            },
            "subTasks": {
              "items": {
                "additionalProperties": false,
                "properties": {
                  "order": {
                    "maximum": 100000000,
                    "minimum": -100000000,
                    "type": "number",
                    "description": "The order associated with this task recurrence template patch sub tasks."
                  },
                  "title": {
                    "maxLength": 5000,
                    "minLength": 1,
                    "type": "string",
                    "description": "Human-readable title of the resource."
                  }
                },
                "required": [
                  "title"
                ],
                "type": "object"
              },
              "maxItems": 500,
              "type": "array",
              "description": "The sub tasks associated with this task recurrence template patch."
            },
            "tagIds": {
              "items": {
                "maxLength": 256,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string"
              },
              "maxItems": 250,
              "type": "array",
              "description": "Ordered set of tag identifiers associated with this task recurrence template patch."
            },
            "userId": {
              "maxLength": 256,
              "minLength": 1,
              "pattern": "^[A-Za-z0-9_.:-]+$",
              "type": "string",
              "description": "Identifier of the related workspace user."
            }
          },
          "type": "object",
          "description": "The template patch associated with this task recurrence occurrence override."
        }
      },
      "required": [
        "action"
      ],
      "type": "object",
      "description": "Public API representation of task recurrence occurrence override."
    }
  },
  "required": [
    "workspaceId",
    "seriesId",
    "occurrenceKey",
    "data"
  ],
  "additionalProperties": false,
  "oneOf": [
    {
      "required": [
        "expectedRevision"
      ],
      "not": {
        "required": [
          "createIfMissing"
        ]
      }
    },
    {
      "required": [
        "createIfMissing"
      ],
      "not": {
        "required": [
          "expectedRevision"
        ]
      }
    }
  ]
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scope: `task-recurrences:write`, `tasks:read`, `tasks:write`.

- [`overrideTaskRecurrenceOccurrence`](/api/v1/reference/operations/overridetaskrecurrenceoccurrence/) — `PUT /task-recurrences/{id}/occurrences/{occurrenceKey}/override`

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

> Prepare a teamgrid_task_recurrence_occurrence_override operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `task-recurrences:write` or `tasks:read` or `tasks:write` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
