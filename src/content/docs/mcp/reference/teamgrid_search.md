---
title: teamgrid_search
description: "Input schema, permissions, API mapping and read behavior for teamgrid_search."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_search` is a read-only TeamGrid MCP tool. It is advertised in: `all`, `context`, `work`, `full`, `schedule-write`, `content-write`, `admin-write`, `automation-write`, `crm-write`, `catalog-write`, `integrations-write`, `projects-write`, `finance-write`, `tasks-write`, `time-write`.

Search authorized TeamGrid resources

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `data` | Required | object | Public API representation of search request. |

## Input schema

**Stable release:** this is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.2.2`:

```json
{
  "type": "object",
  "properties": {
    "data": {
      "additionalProperties": false,
      "properties": {
        "limit": {
          "maximum": 50,
          "minimum": 1,
          "type": "integer",
          "description": "Maximum number of records requested or returned for this page."
        },
        "term": {
          "maxLength": 160,
          "minLength": 2,
          "type": "string",
          "description": "The term associated with this search request."
        },
        "types": {
          "items": {
            "enum": [
              "contacts",
              "projects",
              "tasks"
            ],
            "type": "string"
          },
          "maxItems": 3,
          "minItems": 1,
          "type": "array",
          "uniqueItems": true,
          "description": "The types associated with this search request."
        }
      },
      "required": [
        "term",
        "types"
      ],
      "type": "object",
      "description": "Public API representation of search request."
    }
  },
  "required": [
    "data"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.

### Input in all

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
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": false
}
```

## Scope and API operation

Required scopes (all): `search:read`. Conditional domain scopes: `contacts:read`, `projects:read`, `tasks:read`; the applicable scopes depend on the request and the stored target. See the linked API operation and [scope rules](/mcp/tools-and-security/#field-level-and-scope-boundaries).

- [`searchResources`](/api/v1/reference/operations/searchresources/) — `POST /search`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Read behavior

This tool does not change business state.

## Output and limits

The bounded API result is returned as MCP structured content and equivalent JSON text. This tool returns at most 50 matches and has no cursor. Narrow `term` or `types` instead of attempting to paginate. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_search.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**cross-domain-sensitive:** A single query can cross contacts, projects, and tasks. Contact matches can contain personal data.

The exact safety annotations are `{"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Search TeamGrid contacts, projects, and tasks for “proposal”. Return at most 10 matches and identify each matching resource type.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_search`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| `term` is shorter than 2 or longer than 160 characters, `types` is empty, duplicated, unsupported, or longer than 3. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `search:read` and an applicable conditional domain scope (`contacts:read`, `projects:read`, `tasks:read`) or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds the 256 KiB tool result limit. | Use a bounded section, smaller supported read, private resource or authorized App/CLI transfer. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
