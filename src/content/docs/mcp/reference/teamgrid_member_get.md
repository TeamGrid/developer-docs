---
title: teamgrid_member_get
description: "Input schema, permissions, API mapping and read behavior for teamgrid_member_get."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_member_get` is a read-only TeamGrid MCP tool. It is advertised in: `full`, `admin-write`.

Get a workspace member

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `id` | Required | string | See the exact schema below for values and constraints. |
| `includePii` | Optional | boolean | See the exact schema below for values and constraints. |

## Input schema

**Stable release:** this is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.2.2`:

```json
{
  "type": "object",
  "properties": {
    "id": {
      "maxLength": 128,
      "minLength": 1,
      "type": "string"
    },
    "includePii": {
      "default": false,
      "type": "boolean"
    }
  },
  "required": [
    "id"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scopes (all): `members:read`. Optional field scopes: `members:pii:read`; required when requesting the corresponding protected fields.

- [`getMember`](/api/v1/reference/operations/getmember/) — `GET /members/{id}`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Read behavior

This tool does not change business state.

## Output and limits

The bounded API result is returned as MCP structured content and equivalent JSON text. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_member_get.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**personal-data:** The response can contain membership, individual schedule or absence information. Review the exact fields and applicable PII scopes.

The exact safety annotations are `{"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Read the TeamGrid member with ID `<id>` and summarize only the fields returned by TeamGrid.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_member_get`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `id` is missing or violates this tool’s exact input schema, including any pattern or length restriction. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `members:read` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds the 256 KiB tool result limit. | Use a bounded section, smaller supported read, private resource or authorized App/CLI transfer. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
