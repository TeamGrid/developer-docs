---
title: teamgrid_appointment_update
description: "Input schema, permissions, API mapping and write behavior for teamgrid_appointment_update."
owner: Developer Platform
reviewedAt: 2026-09-29
---

`teamgrid_appointment_update` is a write-capable TeamGrid MCP tool. It is introduced by the
`full` profile and is advertised in: `full`, `schedule-write`.

Update a TeamGrid-managed appointment. Changes the selected workspace under current API permissions. Read the target first; submit its exact ETag. On conflict, review the current state before making a new decision.

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
    "expectedRevision": {
      "pattern": "^\"ap1-[a-f0-9]{64}\"$",
      "type": "string",
      "description": "Exact strong ETag (including quotes) from the read reviewed for this action. Never replace it automatically after a conflict."
    },
    "data": {
      "additionalProperties": false,
      "minProperties": 1,
      "properties": {
        "allDay": {
          "type": "boolean",
          "description": "Whether all day applies to this appointment."
        },
        "busy": {
          "type": "boolean",
          "description": "Whether busy applies to this appointment."
        },
        "description": {
          "maxLength": 50000,
          "type": "string",
          "description": "Human-readable description of the resource."
        },
        "end": {
          "additionalProperties": false,
          "properties": {
            "at": {
              "format": "date-time",
              "type": "string",
              "description": "ISO 8601 timestamp for at."
            },
            "timeZone": {
              "maxLength": 128,
              "minLength": 1,
              "type": "string",
              "description": "The time zone associated with this appointment end."
            }
          },
          "required": [
            "at"
          ],
          "type": "object",
          "description": "End timestamp of the represented interval."
        },
        "location": {
          "maxLength": 1000,
          "type": "string",
          "description": "The location associated with this appointment."
        },
        "start": {
          "additionalProperties": false,
          "properties": {
            "at": {
              "format": "date-time",
              "type": "string",
              "description": "ISO 8601 timestamp for at."
            },
            "timeZone": {
              "maxLength": 128,
              "minLength": 1,
              "type": "string",
              "description": "The time zone associated with this appointment start."
            }
          },
          "required": [
            "at"
          ],
          "type": "object",
          "description": "Start timestamp of the represented interval."
        },
        "title": {
          "maxLength": 500,
          "type": "string",
          "description": "Human-readable title of the resource."
        },
        "visibility": {
          "enum": [
            "default",
            "private",
            "public"
          ],
          "type": "string",
          "description": "Canonical visibility value for this appointment."
        }
      },
      "type": "object",
      "description": "Public API representation of appointment."
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

Required scope: `appointments:write`. Conditional domain scopes: `appointments:delegated:write`; only the scopes for requested search types are applicable.

- [`updateAppointment`](/api/v1/reference/operations/updateappointment/) — `PATCH /appointments/{id}`

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

> Prepare a teamgrid_appointment_update operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `full` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `id` is missing or violates this tool’s exact input schema, including any pattern or length restriction. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `appointments:write` or an applicable conditional domain scope (`appointments:delegated:write`) or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds 256 KiB, or the connection ends while awaiting a write. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
