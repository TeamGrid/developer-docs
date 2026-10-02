---
title: teamgrid_contact_update
description: "Input schema, permissions, API mapping and write behavior for teamgrid_contact_update."
owner: Developer Platform
reviewedAt: 2026-10-01
---

`teamgrid_contact_update` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `full`, `crm-write`.

Update a contact. Changes the selected workspace under current API permissions. The API has no conditional-write or replay contract for this action. Do not retry an uncertain result automatically; read the current state first.

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
    "data": {
      "additionalProperties": false,
      "minProperties": 1,
      "properties": {
        "birthday": {
          "format": "date-time",
          "type": [
            "string",
            "null"
          ],
          "description": "ISO 8601 timestamp for birthday."
        },
        "category": {
          "enum": [
            "customer",
            "supplier",
            null
          ],
          "type": [
            "string",
            "null"
          ],
          "description": "Canonical category value for this contact."
        },
        "companyTitle": {
          "maxLength": 500,
          "type": [
            "string",
            "null"
          ],
          "description": "The company title associated with this contact."
        },
        "customerId": {
          "maxLength": 500,
          "type": [
            "string",
            "null"
          ],
          "description": "The customer id associated with this contact."
        },
        "emails": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "email": {
                "maxLength": 500,
                "minLength": 1,
                "type": "string",
                "description": "Email address associated with this record."
              },
              "type": {
                "enum": [
                  "business",
                  "other",
                  "private"
                ],
                "type": "string",
                "description": "Canonical type discriminator for this resource."
              }
            },
            "required": [
              "email",
              "type"
            ],
            "type": "object"
          },
          "maxItems": 100,
          "type": [
            "array",
            "null"
          ],
          "description": "The emails associated with this contact."
        },
        "firstName": {
          "maxLength": 500,
          "type": [
            "string",
            "null"
          ],
          "description": "The first name associated with this contact."
        },
        "gender": {
          "enum": [
            "female",
            "male",
            null
          ],
          "type": [
            "string",
            "null"
          ],
          "description": "Canonical gender value for this contact."
        },
        "groupId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Identifier of the related workspace group."
        },
        "lastName": {
          "maxLength": 500,
          "type": [
            "string",
            "null"
          ],
          "description": "The last name associated with this contact."
        },
        "nickname": {
          "maxLength": 500,
          "type": [
            "string",
            "null"
          ],
          "description": "The nickname associated with this contact."
        },
        "notes": {
          "maxLength": 50000,
          "type": [
            "string",
            "null"
          ],
          "description": "The notes associated with this contact."
        },
        "parentContactId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "The parent contact id associated with this contact."
        },
        "phoneNumbers": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "number": {
                "maxLength": 500,
                "minLength": 1,
                "type": "string",
                "description": "The number associated with this contact phone numbers."
              },
              "type": {
                "enum": [
                  "business",
                  "direct",
                  "fax",
                  "landline",
                  "mobile",
                  "other"
                ],
                "type": "string",
                "description": "Canonical type discriminator for this resource."
              }
            },
            "required": [
              "number",
              "type"
            ],
            "type": "object"
          },
          "maxItems": 100,
          "type": [
            "array",
            "null"
          ],
          "description": "The phone numbers associated with this contact."
        },
        "salutation": {
          "maxLength": 500,
          "type": [
            "string",
            "null"
          ],
          "description": "The salutation associated with this contact."
        }
      },
      "type": "object",
      "description": "Public API representation of contact."
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

Required scope: `contacts:write`.

- [`updateContact`](/api/v1/reference/operations/updatecontact/) — `PATCH /contacts/{id}`

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

> Prepare a teamgrid_contact_update operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `id` is missing or violates this tool’s exact input schema, including any pattern or length restriction. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `contacts:write` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
