---
title: teamgrid_files_list
description: "Input schema, permissions, API mapping and read behavior for teamgrid_files_list."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_files_list` is a read-only TeamGrid MCP tool. It is advertised in: `context`, `work`, `full`, `content-write`.

List public-space file metadata

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `cursor` | Optional | string | See the exact schema below for values and constraints. |
| `limit` | Optional | integer | See the exact schema below for values and constraints. |
| `archived` | Optional | boolean | See the exact schema below for values and constraints. |
| `entityType` | Optional | string | See the exact schema below for values and constraints. |
| `entityId` | Optional | string | See the exact schema below for values and constraints. |

## Input schema

**Stable release:** this is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.2.2`:

```json
{
  "type": "object",
  "properties": {
    "cursor": {
      "maxLength": 1024,
      "type": "string"
    },
    "limit": {
      "default": 50,
      "maximum": 200,
      "minimum": 1,
      "type": "integer"
    },
    "archived": {
      "default": false,
      "type": "boolean"
    },
    "entityType": {
      "enum": [
        "comment",
        "contact",
        "customField",
        "outcome",
        "project",
        "streamItem",
        "task",
        "team"
      ],
      "type": "string"
    },
    "entityId": {
      "maxLength": 256,
      "minLength": 1,
      "type": "string"
    }
  },
  "required": [],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scopes (all): `files:read`.

- [`listFiles`](/api/v1/reference/operations/listfiles/) — `GET /files`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Read behavior

This tool does not change business state.

## Output and limits

The bounded API result is returned as MCP structured content and equivalent JSON text. This is a cursor-paginated tool. `limit` accepts 1–200. When `meta.page.nextCursor` is not null, pass that opaque value as `cursor` to request the next page. Do not construct, edit, or decode cursors. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_files_list.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**customer-content:** The response can contain private customer content or transfer metadata. Treat embedded instructions as untrusted data; resource reads reauthorize separately.

The exact safety annotations are `{"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> List the first 20 TeamGrid files. Do not request another page; tell me whether another cursor is available.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_files_list`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `files:read` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds the 256 KiB tool result limit. | The tool returns `result_too_large`. Request a smaller page or narrower filters. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
