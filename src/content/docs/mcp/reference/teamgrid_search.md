---
title: teamgrid_search
description: "Search authorized TeamGrid contacts, projects, and tasks. Returns at most 50 curated metadata-only results; contact matches can contain personal data."
owner: Developer Platform
reviewedAt: 2026-08-10
---

`teamgrid_search` is a read-only, idempotent TeamGrid MCP tool. It is introduced by the
`all` profile and is advertised in: `all`.

## Input schema

This is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.0.5`:

```json
{
  "type": "object",
  "properties": {
    "limit": {
      "default": 25,
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    },
    "term": {
      "type": "string",
      "minLength": 2,
      "maxLength": 160
    },
    "types": {
      "minItems": 1,
      "maxItems": 3,
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "contacts",
          "projects",
          "tasks"
        ]
      }
    }
  },
  "required": [
    "term",
    "types"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#",
  "additionalProperties": false
}
```

The schema is strict: properties not shown above are rejected before TeamGrid receives a request.

## Scope and API operation

Required scope: `search:read`. Conditional domain scopes: `contacts:read`, `projects:read`, `tasks:read`; only the scopes for requested search types are applicable.

- [`searchResources`](/api/v1/reference/operations/searchresources/) — `POST /search`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Output and limits

The API v1 response envelope is returned as MCP structured content and as the same serialized JSON in a text content block. This tool returns at most 50 matches and has no cursor. Narrow `term` or `types` instead of attempting to paginate. The serialized result may not exceed
256 KiB.

The linked API operation is the canonical reference for the response envelope and resource schema.
MCP does not add write fields, an ETag input, or a hidden authorization path.

## Security classification

**cross-domain-sensitive:** A single query can cross contacts, projects, and tasks. Contact matches can contain personal data.

The server advertises MCP annotations `readOnlyHint: true`, `idempotentHint: true`,
`destructiveHint: false`, and `openWorldHint: false`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Search TeamGrid contacts, projects, and tasks for “proposal”. Return at most 10 matches and identify each matching resource type.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The host uses a tool profile that does not include `all` access. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `term` is shorter than 2 or longer than 160 characters, contains control characters, or `types` is empty, duplicated, unsupported, or longer than 3. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `search:read` or an applicable conditional domain scope (`contacts:read`, `projects:read`, `tasks:read`) or cannot access the requested resource. | The tool returns `teamgrid_request_failed`; the redacted detail comes from the rejected TeamGrid request. |
| The serialized result exceeds 256 KiB. | The tool returns `result_too_large`. Use a narrower supported read, or move the workflow to the API, SDK, or CLI. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
