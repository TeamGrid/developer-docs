---
title: teamgrid_list_get
description: "Get one TeamGrid list by id."
owner: Developer Platform
reviewedAt: 2026-08-10
---

`teamgrid_list_get` is a read-only, idempotent TeamGrid MCP tool. It is introduced by the
`core` profile and is advertised in: `core`, `collaboration`, `governance`, `all`.

## Input schema

This is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.0.5`:

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128
    }
  },
  "required": [
    "id"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#",
  "additionalProperties": false
}
```

The schema is strict: properties not shown above are rejected before TeamGrid receives a request.

## Scope and API operation

Required scope: `lists:read`.

- [`getList`](/api/v1/reference/operations/getlist/) — `GET /lists/{id}`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Output and limits

The API v1 response envelope is returned as MCP structured content and as the same serialized JSON in a text content block. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

The linked API operation is the canonical reference for the response envelope and resource schema.
MCP does not add write fields, an ETag input, or a hidden authorization path.

## Security classification

**operational-data:** The response contains operational workspace data visible to the credential.

The server advertises MCP annotations `readOnlyHint: true`, `idempotentHint: true`,
`destructiveHint: false`, and `openWorldHint: false`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Read the TeamGrid list with ID `<id>` and summarize only the fields returned by TeamGrid.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| `id` is missing, empty, or longer than 128 characters. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `lists:read` or cannot access the requested resource. | The tool returns `teamgrid_request_failed`; the redacted detail comes from the rejected TeamGrid request. |
| The serialized result exceeds 256 KiB. | The tool returns `result_too_large`. Use a narrower supported read, or move the workflow to the API, SDK, or CLI. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
