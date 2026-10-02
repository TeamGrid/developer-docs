---
title: teamgrid_workspace_settings_update
description: "Input schema, permissions, API mapping and write behavior for teamgrid_workspace_settings_update."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_workspace_settings_update` is a write-capable TeamGrid MCP tool. It is advertised in: `full`, `admin-write`.

Update public workspace settings. Changes the selected workspace under current API permissions. Read the target first; submit its exact ETag. On conflict, review the current state before making a new decision. Reuse the same idempotencyKey and payload for the same intent. Administrative action: review the exact target and access impact with the user.

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `workspaceId` | Required | string | Workspace returned by teamgrid_workspace_get and selected for this exact action. |
| `expectedRevision` | Required | string | Exact strong ETag (including quotes) from the read reviewed for this action. Never replace it automatically after a conflict. |
| `idempotencyKey` | Required | string | Stable key for this exact intent. Retain and reuse the same key and payload after a timeout; a timeout does not prove failure. |
| `data` | Required | object | Public API representation of workspace settings. |

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
    "expectedRevision": {
      "pattern": "^\"wst1-[a-f0-9]{64}\"$",
      "type": "string",
      "description": "Exact strong ETag (including quotes) from the read reviewed for this action. Never replace it automatically after a conflict."
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
      "minProperties": 1,
      "properties": {
        "currency": {
          "enum": [
            "AUD",
            "CAD",
            "CHF",
            "EUR",
            "GBP",
            "NZD",
            "USD",
            "ZAR"
          ],
          "type": "string",
          "description": "ISO 4217 currency code used for monetary values."
        },
        "defaultLanguage": {
          "enum": [
            "de",
            "de-XX",
            "en"
          ],
          "type": "string",
          "description": "Canonical default language value for this workspace settings."
        },
        "defaultPlannedTime": {
          "maximum": 525600,
          "minimum": 0,
          "type": "number",
          "description": "The default planned time associated with this workspace settings."
        },
        "defaultProductivity": {
          "exclusiveMinimum": 0,
          "maximum": 200,
          "type": "number",
          "description": "The default productivity associated with this workspace settings."
        },
        "defaultShowInScheduling": {
          "type": "boolean",
          "description": "Whether default show in scheduling applies to this workspace settings."
        },
        "name": {
          "maxLength": 200,
          "minLength": 1,
          "type": "string",
          "description": "Human-readable name of the resource."
        }
      },
      "type": "object",
      "description": "Public API representation of workspace settings."
    }
  },
  "required": [
    "workspaceId",
    "expectedRevision",
    "idempotencyKey",
    "data"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scopes (all): `workspace-settings:write`, `workspace:read`.

- [`updateWorkspaceSettings`](/api/v1/reference/operations/updateworkspacesettings/) — `PATCH /workspace/settings`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Write preconditions

Concurrency: **conditional**. Pass the exact quoted `meta.etag` from a fresh read as `expectedRevision`. Reuse `idempotencyKey` only for the same creation intent and exact payload.

## Output and limits

A compact mutation receipt includes target and revision when available; outcome metadata distinguishes accepted, complete, partial and uncertain results. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_workspace_settings_update.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**workspace-mutation:** This changes workspace state and may trigger business or external effects. Use its exact scope, revision and idempotency contract; profile selection grants no authority.

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_workspace_settings_update operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_workspace_settings_update`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `workspace-settings:write` and `workspace:read` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| The connection ends while awaiting the write result. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
