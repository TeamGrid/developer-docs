---
title: teamgrid_product_create
description: "Input schema, permissions, API mapping and write behavior for teamgrid_product_create."
owner: Developer Platform
reviewedAt: 2026-10-02
---

`teamgrid_product_create` is a write-capable TeamGrid MCP tool. It is advertised in: `full`, `catalog-write`.

Create a product. Changes the selected workspace under current API permissions. Reuse the same idempotencyKey and payload for the same intent.

## Arguments at a glance

The table describes `full`. When a profile variant is shown below, use that variant’s exact schema.

| Argument | Presence | Type | Meaning |
| --- | --- | --- | --- |
| `workspaceId` | Required | string | Workspace returned by teamgrid_workspace_get and selected for this exact action. |
| `idempotencyKey` | Required | string | Stable key for this exact intent. Retain and reuse the same key and payload after a timeout; a timeout does not prove failure. |
| `data` | Required | object | Public API representation of product. |

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
    "idempotencyKey": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128,
      "pattern": "^[\\x21-\\x7e]+$",
      "description": "Stable key for this exact intent. Retain and reuse the same key and payload after a timeout; a timeout does not prove failure."
    },
    "data": {
      "additionalProperties": false,
      "properties": {
        "amount": {
          "maximum": 1000000000,
          "minimum": 0,
          "type": [
            "number",
            "null"
          ],
          "description": "The amount associated with this product."
        },
        "annotation": {
          "maxLength": 50000,
          "type": [
            "string",
            "null"
          ],
          "description": "The annotation associated with this product."
        },
        "costCenter": {
          "items": {
            "maxLength": 128,
            "minLength": 1,
            "type": "string"
          },
          "maxItems": 2,
          "type": [
            "array",
            "null"
          ],
          "uniqueItems": true,
          "description": "The cost center associated with this product."
        },
        "description": {
          "maxLength": 50000,
          "type": [
            "string",
            "null"
          ],
          "description": "Human-readable description of the resource."
        },
        "disabled": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Whether this resource is disabled for new use."
        },
        "financeAccount": {
          "maxLength": 1000,
          "type": [
            "string",
            "null"
          ],
          "description": "The finance account associated with this product."
        },
        "name": {
          "maxLength": 500,
          "minLength": 1,
          "type": "string",
          "description": "Human-readable name of the resource."
        },
        "priceGroupIds": {
          "items": {
            "maxLength": 128,
            "minLength": 1,
            "type": "string"
          },
          "maxItems": 100,
          "type": [
            "array",
            "null"
          ],
          "uniqueItems": true,
          "description": "Ordered set of price group identifiers associated with this product."
        },
        "productGroupId": {
          "maxLength": 128,
          "type": [
            "string",
            "null"
          ],
          "description": "Identifier of the product group that contains this product."
        },
        "productNumber": {
          "maxLength": 1000,
          "type": [
            "string",
            "null"
          ],
          "description": "The product number associated with this product."
        },
        "purchasePrice": {
          "maximum": 1000000000000,
          "minimum": 0,
          "type": [
            "number",
            "null"
          ],
          "description": "Requires products:finance:write when supplied."
        },
        "retailPrice": {
          "maximum": 1000000000000,
          "minimum": 0,
          "type": [
            "number",
            "null"
          ],
          "description": "The retail price associated with this product."
        },
        "taxRate": {
          "maximum": 100,
          "minimum": 0,
          "type": [
            "number",
            "null"
          ],
          "description": "The tax rate associated with this product."
        },
        "unit": {
          "maxLength": 1000,
          "type": [
            "string",
            "null"
          ],
          "description": "The unit associated with this product."
        }
      },
      "required": [
        "name"
      ],
      "type": "object",
      "description": "Public API representation of product."
    }
  },
  "required": [
    "workspaceId",
    "idempotencyKey",
    "data"
  ],
  "additionalProperties": false
}
```

The schema above is for `full`. Properties not in the selected profile schema are rejected.



## Scope and API operation

Required scopes (all): `products:write`, `workspace:read`. Optional field scopes: `products:finance:write`; required when requesting the corresponding protected fields.

- [`createProduct`](/api/v1/reference/operations/createproduct/) — `POST /products`

The credential must also satisfy normal workspace authorization and any service-account resource
grants. Selecting an MCP tool profile never adds scopes to a credential.

## Write preconditions

Concurrency: **unconditional**. No top-level revision precondition is declared; do not assume conflict protection. Reuse `idempotencyKey` only for the same creation intent and exact payload.

## Output and limits

A compact mutation receipt includes target and revision when available; outcome metadata distinguishes accepted, complete, partial and uncertain results. This tool returns a single API response envelope and is not paginated. The serialized result may not exceed
256 KiB.

Download the [exact MCP input and output contract](/mcp/contracts/teamgrid_product_create.json), including profile variants, scopes and safety annotations. Its `outputSchema` describes the advertised MCP envelope and local `$defs`; it includes MCP projection metadata in addition to the underlying API schema.

The linked API operation describes the business resource and its field semantics.
Write tools preserve their declared revision/idempotency contract and require current permissions.
Accepted jobs provide status/resume information; uncertain writes must not be replayed blindly.

## Security classification

**workspace-mutation:** This changes workspace state and may trigger business or external effects. Use its exact scope, revision and idempotency contract; profile selection grants no authority.

The exact safety annotations are `{"readOnlyHint":false,"destructiveHint":false,"idempotentHint":true,"openWorldHint":false}`. The host and model can still retain tool
arguments and results in prompts, logs, or transcripts; use a dedicated least-privilege credential.

## Example prompt

> Prepare a teamgrid_product_create operation for my chosen target. Resolve IDs, read current state and revisions, show the intended change, then report its confirmed or uncertain outcome without automatic retries.

The prompt is illustrative. Inspect the proposed tool arguments before approving access to
personal, commercial, conversation, or security-configuration data.

## Common failures

| Condition | Observable behavior and recovery |
| --- | --- |
| The selected tool profile or allow/deny filter excludes `teamgrid_product_create`. | The tool is not advertised to the host. Select the narrowest profile that contains it and restart the host. |
| An argument violates this tool’s input schema: required field, type, enum, pattern, length, or range. | MCP input validation rejects the call before an API request is made. |
| The credential lacks `products:write` and `workspace:read` or cannot access the requested resource. | The tool preserves a safe API error code such as `insufficient_scope`, with redacted detail and available status/request metadata. |
| The connection ends while awaiting the write result. | Inspect the outcome and status/resume information. An interrupted wait does not prove rollback; never blindly repeat the write. |
| An unknown input property is supplied. | The strict input schema rejects the call before an API request is made. |

Authentication failures that prevent the MCP process from starting are covered separately in
[MCP troubleshooting](/mcp/troubleshooting/).

[Back to all MCP tools](/mcp/reference/) · [MCP security model](/mcp/tools-and-security/)
