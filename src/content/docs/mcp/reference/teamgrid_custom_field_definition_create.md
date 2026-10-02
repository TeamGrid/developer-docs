---
title: teamgrid_custom_field_definition_create
description: "Input schema, permissions, API mapping and write behavior for teamgrid_custom_field_definition_create."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_custom_field_definition_create` is a write-capable TeamGrid MCP tool. It is advertised in: `full`, `catalog-write`.

Create a custom-field definition. Changes the selected workspace under current API permissions. Reuse the same idempotencyKey and payload for the same intent.

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `workspaceId` | Required | string | Workspace returned by teamgrid_workspace_get and selected for this exact action. |
| `idempotencyKey` | Required | string | Stable key for this exact intent. Retain and reuse the same key and payload after a timeout; a timeout does not prove failure. |
| `data` | Required | object | The configuration discriminator must equal fieldType. |

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
      "description": "The configuration discriminator must equal fieldType.",
      "properties": {
        "configuration": {
          "oneOf": [
            {
              "additionalProperties": false,
              "properties": {
                "groupId": {
                  "maxLength": 128,
                  "minLength": 1,
                  "type": "string",
                  "description": "Identifier of the related workspace group."
                },
                "multi": {
                  "type": "boolean",
                  "description": "Whether multi applies to this custom field contact configuration."
                },
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field contact configuration."
                },
                "type": {
                  "const": "contact",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field contact configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field date configuration."
                },
                "type": {
                  "const": "date",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field date configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "multi": {
                  "type": "boolean",
                  "description": "Whether multi applies to this custom field dropdown configuration."
                },
                "options": {
                  "items": {
                    "additionalProperties": false,
                    "properties": {
                      "label": {
                        "maxLength": 500,
                        "minLength": 1,
                        "type": "string",
                        "description": "The label associated with this custom field dropdown configuration options."
                      },
                      "value": {
                        "maxLength": 500,
                        "minLength": 1,
                        "type": "string",
                        "description": "Canonical value represented by this field."
                      }
                    },
                    "required": [
                      "label",
                      "value"
                    ],
                    "type": "object"
                  },
                  "maxItems": 200,
                  "minItems": 1,
                  "type": "array",
                  "description": "The options associated with this custom field dropdown configuration."
                },
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field dropdown configuration."
                },
                "type": {
                  "const": "dropdown",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "options",
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field dropdown configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "decimalSeparator": {
                  "type": "boolean",
                  "description": "Whether decimal separator applies to this custom field number configuration."
                },
                "max": {
                  "type": "number",
                  "description": "The max associated with this custom field number configuration."
                },
                "min": {
                  "type": "number",
                  "description": "The min associated with this custom field number configuration."
                },
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field number configuration."
                },
                "thousandSeparator": {
                  "type": "boolean",
                  "description": "Whether thousand separator applies to this custom field number configuration."
                },
                "unit": {
                  "maxLength": 100,
                  "type": "string",
                  "description": "The unit associated with this custom field number configuration."
                },
                "type": {
                  "const": "number",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field number configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "multi": {
                  "type": "boolean",
                  "description": "Whether multi applies to this custom field project configuration."
                },
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field project configuration."
                },
                "type": {
                  "const": "project",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field project configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "type": {
                  "const": "switcher",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field switcher configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "multi": {
                  "type": "boolean",
                  "description": "Whether multi applies to this custom field tag configuration."
                },
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field tag configuration."
                },
                "type": {
                  "const": "tag",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field tag configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "maxChars": {
                  "maximum": 100000,
                  "minimum": 1,
                  "type": "integer",
                  "description": "The max chars associated with this custom field text configuration."
                },
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field text configuration."
                },
                "type": {
                  "const": "text",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field text configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "maxChars": {
                  "maximum": 100000,
                  "minimum": 1,
                  "type": "integer",
                  "description": "The max chars associated with this custom field textarea configuration."
                },
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field textarea configuration."
                },
                "type": {
                  "const": "textarea",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field textarea configuration."
            },
            {
              "additionalProperties": false,
              "properties": {
                "multi": {
                  "type": "boolean",
                  "description": "Whether multi applies to this custom field user configuration."
                },
                "placeholder": {
                  "maxLength": 500,
                  "type": "string",
                  "description": "The placeholder associated with this custom field user configuration."
                },
                "type": {
                  "const": "user",
                  "type": "string",
                  "description": "Canonical type discriminator for this resource."
                }
              },
              "required": [
                "type"
              ],
              "type": "object",
              "description": "Public API representation of custom field user configuration."
            }
          ],
          "description": "Type-specific, validated configuration for this resource."
        },
        "defaultEnabled": {
          "type": "boolean",
          "description": "Whether default enabled applies to this custom field definition."
        },
        "description": {
          "maxLength": 5000,
          "type": "string",
          "description": "Human-readable description of the resource."
        },
        "required": {
          "type": "boolean",
          "description": "Whether required applies to this custom field definition."
        },
        "title": {
          "maxLength": 500,
          "minLength": 1,
          "type": "string",
          "description": "Human-readable title of the resource."
        },
        "fieldType": {
          "enum": [
            "contact",
            "date",
            "dropdown",
            "number",
            "project",
            "switcher",
            "tag",
            "text",
            "textarea",
            "user"
          ],
          "type": "string",
          "description": "Canonical type used to validate and interpret the custom field."
        },
        "targetType": {
          "enum": [
            "contact",
            "project",
            "projectJournalEntry",
            "task"
          ],
          "type": "string",
          "description": "Canonical type of the target resource."
        }
      },
      "required": [
        "configuration",
        "fieldType",
        "targetType",
        "title"
      ],
      "type": "object"
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

Required scopes (all): `custom-field-definitions:write`, `workspace:read`.

- [`createCustomFieldDefinition`](/api/v1/reference/operations/createcustomfielddefinition/) — `POST /custom-field-definitions`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Write preconditions

Concurrency: **unconditional**. No top-level revision precondition is declared; do not assume conflict protection. Reuse `idempotencyKey` only for the same creation intent and exact payload.

## Output and limits

A compact mutation receipt includes target and revision when available; outcome metadata distinguishes accepted, complete, partial and uncertain results. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_custom_field_definition_create.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**workspace-mutation:** This changes workspace state and may trigger business or external effects. Use its exact scope, revision and idempotency contract; profile selection grants no authority.

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_custom_field_definition_create operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_custom_field_definition_create`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `custom-field-definitions:write` and `workspace:read` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| The connection ends while awaiting the write result. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
