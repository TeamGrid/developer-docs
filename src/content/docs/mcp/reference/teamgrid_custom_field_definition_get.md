---
title: teamgrid_custom_field_definition_get
description: "Get one canonical TeamGrid custom-field definition without exposing legacy defaults."
owner: Developer Platform
reviewedAt: 2026-08-10
---

`teamgrid_custom_field_definition_get` is a read-only, idempotent TeamGrid MCP tool. It is introduced by the
`governance` profile and is advertised in: `governance`, `all`.

## Input schema

This is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.1.0`:

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

Required scope: `custom-field-definitions:read`.

- [`getCustomFieldDefinition`](/api/v1/reference/operations/getcustomfielddefinition/) — `GET /custom-field-definitions/{id}`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Output and limits

The API v1 response envelope is returned as MCP structured content and as the same serialized JSON in a text content block. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Additional output boundary:

- The tool exposes canonical definitions, not legacy defaults or per-resource values.

The linked API operation is the canonical reference for the response envelope and resource schema.
MCP does not add write fields, an ETag input, or a hidden authorization path.

## Security classification

**governance-metadata:** Custom-field definitions describe workspace schema and compatibility, but not per-resource values.

The server advertises MCP annotations `readOnlyHint: true`, `idempotentHint: true`,
`destructiveHint: false`, and `openWorldHint: false`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Read the TeamGrid custom field definition with ID `<id>` and summarize only the fields returned by TeamGrid.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `governance` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `id` is missing, empty, or longer than 128 characters. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `custom-field-definitions:read` or cannot access the requested resource. | The tool returns `teamgrid_request_failed`; the redacted detail comes from the rejected TeamGrid request. |
| The serialized result exceeds 256 KiB. | The tool returns `result_too_large`. Use a narrower supported read, or move the workflow to the API, SDK, or CLI. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
