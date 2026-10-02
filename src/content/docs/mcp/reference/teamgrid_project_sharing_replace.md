---
title: teamgrid_project_sharing_replace
description: "Input schema, permissions, API mapping and write behavior for teamgrid_project_sharing_replace."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_project_sharing_replace` is a write-capable TeamGrid MCP tool. It is advertised in: `full`, `projects-write`.

Replace project sharing. Changes the selected workspace under current API permissions. Read the target first; submit its exact ETag. On conflict, review the current state before making a new decision. Administrative action: review the exact target and access impact with the user.

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `workspaceId` | Required | string | Workspace returned by teamgrid_workspace_get and selected for this exact action. |
| `id` | Required | string | See the exact schema below for values and constraints. |
| `expectedRevision` | Required | string | Exact strong ETag (including quotes) from the read reviewed for this action. Never replace it automatically after a conflict. |
| `data` | Required | object | Public API representation of project sharing replace. |

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
      "pattern": "^\"prj1-[a-f0-9]{64}\"$",
      "type": "string",
      "description": "Exact strong ETag (including quotes) from the read reviewed for this action. Never replace it automatically after a conflict."
    },
    "data": {
      "additionalProperties": false,
      "properties": {
        "entries": {
          "items": {
            "additionalProperties": false,
            "properties": {
              "permissions": {
                "items": {
                  "maxLength": 256,
                  "minLength": 1,
                  "type": "string"
                },
                "maxItems": 100,
                "type": "array",
                "uniqueItems": true,
                "description": "The permissions associated with this project sharing replace entries."
              },
              "userId": {
                "maxLength": 128,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9.:-]+$",
                "type": [
                  "string",
                  "null"
                ],
                "description": "Identifier of the related workspace user."
              },
              "workspaceId": {
                "maxLength": 128,
                "minLength": 1,
                "pattern": "^[A-Za-z0-9.:-]+$",
                "type": "string",
                "description": "Identifier of the authenticated TeamGrid workspace."
              }
            },
            "required": [
              "workspaceId"
            ],
            "type": "object"
          },
          "maxItems": 1000,
          "type": "array",
          "description": "The entries associated with this project sharing replace."
        }
      },
      "required": [
        "entries"
      ],
      "type": "object",
      "description": "Public API representation of project sharing replace."
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

Required scopes (all): `projects:sharing`, `workspace:read`.

- [`replaceProjectSharing`](/api/v1/reference/operations/replaceprojectsharing/) — `PUT /projects/{id}/sharing`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Write preconditions

Concurrency: **conditional**. The core CAS protocol must be enforced by the server. Pass the exact quoted `meta.etag` from a fresh read as `expectedRevision`. No top-level idempotency key is declared; a lost response must be inspected before replay.

## Output and limits

A compact mutation receipt includes target and revision when available; outcome metadata distinguishes accepted, complete, partial and uncertain results. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_project_sharing_replace.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**workspace-mutation:** This changes workspace state and may trigger business or external effects. Use its exact scope, revision and idempotency contract; profile selection grants no authority.

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_project_sharing_replace operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_project_sharing_replace`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `id` is missing or violates this tool’s exact input schema, including any pattern or length restriction. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `projects:sharing` and `workspace:read` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| The connection ends while awaiting the write result. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
