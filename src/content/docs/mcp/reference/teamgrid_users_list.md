---
title: teamgrid_users_list
description: "Input schema, permissions, API mapping and read behavior for teamgrid_users_list."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_users_list` is a read-only TeamGrid MCP tool. It is advertised in: `all`, `collaboration`, `context`, `work`, `full`, `schedule-write`, `content-write`, `admin-write`, `automation-write`, `crm-write`, `catalog-write`, `integrations-write`, `projects-write`, `finance-write`, `tasks-write`, `time-write`.

List workspace users

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `cursor` | Optional | string | See the exact schema below for values and constraints. |
| `limit` | Optional | integer | See the exact schema below for values and constraints. |

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
    }
  },
  "required": [],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.

### Input in all

```json
{
  "type": "object",
  "properties": {
    "cursor": {
      "type": "string",
      "maxLength": 512
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  },
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": false
}
```

### Input in collaboration

```json
{
  "type": "object",
  "properties": {
    "cursor": {
      "type": "string",
      "maxLength": 512
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    }
  },
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": false
}
```

## Scope and API operation

Required scopes (all): `users:read`.

- [`listUsers`](/api/v1/reference/operations/listusers/) — `GET /users`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Read behavior

This tool does not change business state.

## Output and limits

The bounded API result is returned as MCP structured content and equivalent JSON text. This is a cursor-paginated tool. `limit` accepts 1–200. When `meta.page.nextCursor` is not null, pass that opaque value as `cursor` to request the next page. Do not construct, edit, or decode cursors. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_users_list.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**personal-data:** The response can contain personal or relationship data.

The exact safety annotations are `{"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> List the first 20 TeamGrid users. Do not request another page; tell me whether another cursor is available.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_users_list`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `users:read` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds the 256 KiB tool result limit. | The tool returns `result_too_large`. Request a smaller page or narrower filters. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
