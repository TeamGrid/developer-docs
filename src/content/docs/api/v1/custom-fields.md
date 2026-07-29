---
title: Custom-field definitions and values
description: Manage TeamGrid custom-field schemas and safely compare and set values on supported resources.
owner: Developer Platform
reviewedAt: 2026-07-29
---

API v1 separates a custom-field **definition** from the value stored on one resource. Definitions
use `custom-field-definitions:read` or `custom-field-definitions:write`. Values use the dedicated
`custom-field-values:read` or `custom-field-values:write` scope **and** the matching target-resource
scope. A project value, for example, also requires `projects:read` for GET or `projects:write` for a
mutation.

Supported value targets are `contact`, `project`, `project-journal-entry`, and `task`. The path uses
the kebab-case `project-journal-entry`; definition objects retain the canonical definition target
name `projectJournalEntry`.

## Compare-and-set values

Every value GET returns a strong `ETag` and the same unquoted revision in
`data.attributes.revision`. A value that has never been set is still a resource with `state: unset`
and a revision. Send that latest revision on every PUT or DELETE:

```bash
CURRENT=$(curl --silent \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  'https://api.de.teamgrid.app/v1/custom-field-values/task/TASK_ID/FIELD_ID')

REVISION=$(printf '%s' "$CURRENT" | jq -r '.data.attributes.revision')

curl --request PUT \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header "Content-Type: application/json" \
  --header "If-Match: \"$REVISION\"" \
  --data '{"value":"ACME-42"}' \
  'https://api.de.teamgrid.app/v1/custom-field-values/task/TASK_ID/FIELD_ID'
```

The API returns `428` when `If-Match` is missing, `400` for a weak validator, wildcard, list, or
malformed revision, and `412` when another writer changed the value. On `412`, read again, decide
whether the new state should be overwritten, and retry with the new revision. Do not silently loop
over conflicts.

Values are validated against the definition type. Text and text-area values are strings; switchers
are booleans; numbers are finite and non-negative; dates are RFC 3339 timestamps; reference-like
fields contain one ID or a bounded unique ID array. The API never returns legacy raw storage,
workspace fields, internal defaults, or an invalid stored value.

## Bounded batch reads

Read 1–100 unique definitions for one resource with one order-preserving request:

```ts
const values = await client.customFieldValues.getMany(
  'task',
  taskId,
  ['customerReference', 'priority', 'owner'],
)
```

The response contains exactly one value state per requested field ID in the same order. The App
re-authenticates the credential once, checks every definition and the target resource in its owning
cell, and requires every target and reference-domain scope needed by the complete batch. Empty,
duplicate, oversized, reordered, or structurally extended results fail closed.

## SDK and CLI

```ts
const current = await client.customFieldValues.get('task', taskId, fieldId)
const changed = await client.customFieldValues.set(
  'task',
  taskId,
  fieldId,
  { value: 'ACME-42' },
  { ifMatch: current.data.attributes.revision },
)
await client.customFieldValues.clear('task', taskId, fieldId, {
  ifMatch: changed.data.attributes.revision,
})
```

```bash
teamgrid custom-field-values get task TASK_ID FIELD_ID --output json
teamgrid custom-field-values get-many task TASK_ID \
  --field-id FIELD_ID ANOTHER_FIELD_ID --output json
teamgrid custom-field-values set task TASK_ID FIELD_ID \
  --data '{"value":"ACME-42"}' --if-match "$REVISION" --output json
teamgrid custom-field-values clear task TASK_ID FIELD_ID \
  --if-match "$REVISION" --yes --output json
```

Custom-field values are deliberately unavailable through MCP. Definition reads are available only
in the `governance` profile; definition writes and every value operation, including batch reads,
remain forbidden.
