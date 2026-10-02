---
title: teamgrid_availability_list
description: "Input schema, permissions, API mapping and read behavior for teamgrid_availability_list."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_availability_list` is a read-only TeamGrid MCP tool. It is advertised in: `context`, `work`, `full`, `schedule-write`.

List user availability

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `start` | Required | string | See the exact schema below for values and constraints. |
| `end` | Required | string | See the exact schema below for values and constraints. |
| `timeZone` | Required | string | See the exact schema below for values and constraints. |
| `userId` | Optional | array | See the exact schema below for values and constraints. |

## Input schema

**Stable release:** this is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.2.2`:

```json
{
  "type": "object",
  "properties": {
    "start": {
      "format": "date-time",
      "type": "string"
    },
    "end": {
      "format": "date-time",
      "type": "string"
    },
    "timeZone": {
      "maxLength": 128,
      "minLength": 1,
      "type": "string"
    },
    "userId": {
      "items": {
        "maxLength": 128,
        "minLength": 1,
        "type": "string"
      },
      "maxItems": 50,
      "type": "array",
      "uniqueItems": true
    }
  },
  "required": [
    "start",
    "end",
    "timeZone"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scopes (all): `availability:read`. Conditional domain scopes: `availability:delegated:read`; the applicable scopes depend on the request and the stored target. See the linked API operation and [scope rules](/mcp/tools-and-security/#field-level-and-scope-boundaries).

- [`listAvailability`](/api/v1/reference/operations/listavailability/) — `GET /availability`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Read behavior

This tool does not change business state.

## Output and limits

The bounded API result is returned as MCP structured content and equivalent JSON text. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_availability_list.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**personal-data:** The response can contain membership, individual schedule or absence information. Review the exact fields and applicable PII scopes.

The exact safety annotations are `{"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Use `teamgrid_availability_list` to inspect or preview the selected TeamGrid resource. Resolve its required arguments from the schema and report only returned data. Do not change business state.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_availability_list`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `availability:read` and an applicable conditional domain scope (`availability:delegated:read`) or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds the 256 KiB tool result limit. | Use a bounded section, smaller supported read, private resource or authorized App/CLI transfer. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
