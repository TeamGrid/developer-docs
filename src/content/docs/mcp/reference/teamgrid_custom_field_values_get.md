---
title: teamgrid_custom_field_values_get
description: "Input schema, permissions, API mapping and read behavior for teamgrid_custom_field_values_get."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_custom_field_values_get` is a read-only TeamGrid MCP tool. It is advertised in: `full`, `catalog-write`.

Read custom-field values for one resource

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `targetType` | Required | string | See the exact schema below for values and constraints. |
| `resourceId` | Required | string | See the exact schema below for values and constraints. |
| `data` | Required | object | Public API representation of custom field value batch read. |

## Input schema

**Stable release:** this is the exact JSON Schema advertised by `@teamgrid/mcp-server@1.2.2`:

```json
{
  "type": "object",
  "properties": {
    "targetType": {
      "enum": [
        "contact",
        "project",
        "project-journal-entry",
        "task"
      ],
      "type": "string"
    },
    "resourceId": {
      "maxLength": 128,
      "minLength": 1,
      "pattern": "^[A-Za-z0-9_-]+$",
      "type": "string"
    },
    "data": {
      "additionalProperties": false,
      "properties": {
        "fieldIds": {
          "items": {
            "maxLength": 128,
            "minLength": 1,
            "pattern": "^[A-Za-z0-9]+$",
            "type": "string"
          },
          "maxItems": 100,
          "minItems": 1,
          "type": "array",
          "uniqueItems": true,
          "description": "Ordered set of field identifiers associated with this custom field value batch read."
        }
      },
      "required": [
        "fieldIds"
      ],
      "type": "object",
      "description": "Public API representation of custom field value batch read."
    }
  },
  "required": [
    "targetType",
    "resourceId",
    "data"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scopes (all): `custom-field-values:read`. Conditional domain scopes: `contacts:read`, `projects:read`, `project-statements:read`, `tags:read`, `tasks:read`, `users:read`; the applicable scopes depend on the request and the stored target. See the linked API operation and [scope rules](/mcp/tools-and-security/#field-level-and-scope-boundaries).

- [`getCustomFieldValues`](/api/v1/reference/operations/getcustomfieldvalues/) — `POST /custom-field-values/{targetType}/{resourceId}/batch-read`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Read behavior

This tool does not change business state.

## Output and limits

The bounded API result is returned as MCP structured content and equivalent JSON text. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_custom_field_values_get.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**operational-data:** The response contains operational workspace data visible to the credential.

The exact safety annotations are `{"readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Use `teamgrid_custom_field_values_get` to inspect or preview the selected TeamGrid resource. Resolve its required arguments from the schema and report only returned data. Do not change business state.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_custom_field_values_get`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `custom-field-values:read` and an applicable conditional domain scope (`contacts:read`, `projects:read`, `project-statements:read`, `tags:read`, `tasks:read`, `users:read`) or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| A read exceeds the 256 KiB tool result limit. | Use a bounded section, smaller supported read, private resource or authorized App/CLI transfer. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
