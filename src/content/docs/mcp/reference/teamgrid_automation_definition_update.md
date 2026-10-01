---
title: teamgrid_automation_definition_update
description: "Input schema, permissions, API mapping and write behavior for teamgrid_automation_definition_update."
owner: Developer Platform
reviewedAt: 2026-10-01
---

`teamgrid_automation_definition_update` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `full`, `automation-write`.

Update an automation definition. Changes the selected workspace under current API permissions. Read the target first; submit its exact ETag. On conflict, review the current state before making a new decision. Changes can affect future automated actions; inspect the definition and schedule first.

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
      "pattern": "^\"aut1-[a-f0-9]{64}\"$",
      "type": "string",
      "description": "Exact strong ETag (including quotes) from the read reviewed for this action. Never replace it automatically after a conflict."
    },
    "data": {
      "additionalProperties": false,
      "minProperties": 1,
      "properties": {
        "description": {
          "maxLength": 5000,
          "type": "string",
          "description": "Human-readable description of the resource."
        },
        "flow": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "actionId": {
                "enum": [
                  "automationTask",
                  "condition",
                  "createDate",
                  "forEach",
                  "formatDate",
                  "listCreate",
                  "listEdit",
                  "loop",
                  "loopBreak",
                  "loopContinue",
                  "projectCreate",
                  "projectEdit",
                  "projectStatementCreate",
                  "projectStatementEdit",
                  "serviceCreate",
                  "serviceEdit",
                  "setAutomationStatus",
                  "setVariable",
                  "stopCurrentAutomation",
                  "taskCreate",
                  "taskEdit",
                  "timeentryCreate",
                  "timeentryEdit",
                  "waitFor",
                  "waitForCustomFieldChange",
                  "waitForProjectChange",
                  "waitForTaskChange",
                  "waitForTaskCompletion",
                  "waitUntil"
                ],
                "type": "string",
                "description": "Canonical action id value for this automation step."
              },
              "branches": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "flow": {
                      "items": {
                        "$ref": "#/$defs/AutomationInputStep"
                      },
                      "maxItems": 100,
                      "type": "array",
                      "description": "The flow associated with this automation branch."
                    },
                    "key": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "Stable machine-readable key."
                    }
                  },
                  "required": [
                    "flow",
                    "key"
                  ],
                  "type": "object",
                  "description": "Public API representation of automation branch."
                },
                "maxItems": 10,
                "type": "array",
                "description": "The branches associated with this automation step."
              },
              "config": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "key": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "Stable machine-readable key."
                    },
                    "value": {
                      "maxLength": 16384,
                      "type": "string",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "required": [
                    "key",
                    "value"
                  ],
                  "type": "object"
                },
                "maxItems": 50,
                "type": "array",
                "description": "The config associated with this automation step."
              },
              "input": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "key": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "Stable machine-readable key."
                    },
                    "value": {
                      "maxLength": 16384,
                      "type": "string",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "required": [
                    "key",
                    "value"
                  ],
                  "type": "object"
                },
                "maxItems": 50,
                "type": "array",
                "description": "The input associated with this automation step."
              },
              "output": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "key": {
                      "maxLength": 128,
                      "minLength": 1,
                      "pattern": "^[A-Za-z0-9_.:-]+$",
                      "type": "string",
                      "description": "Stable machine-readable key."
                    },
                    "value": {
                      "maxLength": 16384,
                      "type": "string",
                      "description": "Canonical value represented by this field."
                    }
                  },
                  "required": [
                    "key",
                    "value"
                  ],
                  "type": "object"
                },
                "maxItems": 50,
                "type": "array",
                "description": "The output associated with this automation step."
              }
            },
            "required": [
              "actionId"
            ],
            "type": "object",
            "description": "Public API representation of automation step."
          },
          "maxItems": 100,
          "type": "array",
          "description": "The flow associated with this automation definition."
        },
        "name": {
          "maxLength": 200,
          "minLength": 1,
          "type": "string",
          "description": "Human-readable name of the resource."
        },
        "trigger": {
          "additionalProperties": false,
          "properties": {
            "data": {
              "additionalProperties": false,
              "properties": {
                "type": {
                  "enum": [
                    "projects",
                    "tasks"
                  ],
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Response data for the completed request."
            },
            "event": {
              "enum": [
                "change",
                "create"
              ],
              "type": "string",
              "description": "Canonical TeamGrid event name."
            }
          },
          "required": [
            "data",
            "event"
          ],
          "type": "object",
          "description": "The trigger associated with this automation definition."
        }
      },
      "type": "object",
      "description": "Public API representation of automation definition."
    }
  },
  "required": [
    "workspaceId",
    "id",
    "expectedRevision",
    "data"
  ],
  "additionalProperties": false,
  "$defs": {
    "AutomationInputStep": {
      "additionalProperties": false,
      "properties": {
        "actionId": {
          "enum": [
            "automationTask",
            "condition",
            "createDate",
            "forEach",
            "formatDate",
            "listCreate",
            "listEdit",
            "loop",
            "loopBreak",
            "loopContinue",
            "projectCreate",
            "projectEdit",
            "projectStatementCreate",
            "projectStatementEdit",
            "serviceCreate",
            "serviceEdit",
            "setAutomationStatus",
            "setVariable",
            "stopCurrentAutomation",
            "taskCreate",
            "taskEdit",
            "timeentryCreate",
            "timeentryEdit",
            "waitFor",
            "waitForCustomFieldChange",
            "waitForProjectChange",
            "waitForTaskChange",
            "waitForTaskCompletion",
            "waitUntil"
          ],
          "type": "string",
          "description": "Canonical action id value for this automation step."
        },
        "branches": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "flow": {
                "items": {
                  "$ref": "#/$defs/AutomationInputStep"
                },
                "maxItems": 100,
                "type": "array",
                "description": "The flow associated with this automation branch."
              },
              "key": {
                "maxLength": 128,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string",
                "description": "Stable machine-readable key."
              }
            },
            "required": [
              "flow",
              "key"
            ],
            "type": "object",
            "description": "Public API representation of automation branch."
          },
          "maxItems": 10,
          "type": "array",
          "description": "The branches associated with this automation step."
        },
        "config": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "key": {
                "maxLength": 128,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string",
                "description": "Stable machine-readable key."
              },
              "value": {
                "maxLength": 16384,
                "type": "string",
                "description": "Canonical value represented by this field."
              }
            },
            "required": [
              "key",
              "value"
            ],
            "type": "object"
          },
          "maxItems": 50,
          "type": "array",
          "description": "The config associated with this automation step."
        },
        "input": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "key": {
                "maxLength": 128,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string",
                "description": "Stable machine-readable key."
              },
              "value": {
                "maxLength": 16384,
                "type": "string",
                "description": "Canonical value represented by this field."
              }
            },
            "required": [
              "key",
              "value"
            ],
            "type": "object"
          },
          "maxItems": 50,
          "type": "array",
          "description": "The input associated with this automation step."
        },
        "output": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "key": {
                "maxLength": 128,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9_.:-]+$",
                "type": "string",
                "description": "Stable machine-readable key."
              },
              "value": {
                "maxLength": 16384,
                "type": "string",
                "description": "Canonical value represented by this field."
              }
            },
            "required": [
              "key",
              "value"
            ],
            "type": "object"
          },
          "maxItems": 50,
          "type": "array",
          "description": "The output associated with this automation step."
        }
      },
      "required": [
        "actionId"
      ],
      "type": "object",
      "description": "Public API representation of automation step."
    }
  }
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scope: `automations:write`. Conditional domain scopes: `custom-field-values:read`, `lists:write`, `projects:read`, `projects:write`, `project-statements:write`, `services:write`, `tasks:read`, `tasks:write`, `time-entries:write`; only the scopes for requested search types are applicable.

- [`updateAutomationDefinition`](/api/v1/reference/operations/updateautomationdefinition/) — `PATCH /automation-definitions/{id}`

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

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_automation_definition_update operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `id` is missing or violates this tool’s exact input schema, including any pattern or length restriction. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `automations:write` or an applicable conditional domain scope (`custom-field-values:read`, `lists:write`, `projects:read`, `projects:write`, `project-statements:write`, `services:write`, `tasks:read`, `tasks:write`, `time-entries:write`) or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
