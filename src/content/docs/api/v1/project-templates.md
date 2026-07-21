---
title: Project templates
description: Capture safe project templates and instantiate them through credential-owned asynchronous operations.
---

Project templates capture a reusable project, list, and task structure. Public responses contain
only bounded template metadata: title, description, color, source project ID, archive state,
snapshot version, timestamps, and list/task counts. The captured snapshot, actors, workspace
routing, and generated documents are never returned.

Reads require `project-templates:read`; create, update, archive, and restore require
`project-templates:write`. Instantiation and its status resource require both
`project-templates:write` and `projects:write` because the operation creates a project and child
resources.

## Capture and instantiate

Creating a template requires a stable `Idempotency-Key` because TeamGrid captures the current
source project. Instantiation also requires its own key:

```bash
teamgrid project-templates create \
  --data '{"color":"#1557ed","projectId":"PROJECT_ID","title":"Delivery"}' \
  --idempotency-key template-delivery-v1 --output json

teamgrid project-templates instantiate TEMPLATE_ID \
  --data '{"name":"Customer rollout"}' \
  --idempotency-key customer-rollout-42 --wait --output json
```

The HTTP instantiation response is `202 Accepted`, includes `Location`, and returns a
credential-owned `projectTemplateInstantiation` resource. Poll that exact location or use the SDK
wait helper. Terminal states are `succeeded` and `failed`; pending/running responses never imply
that generated resources are complete.

```ts
const accepted = await client.projectTemplates.instantiate(
  templateId,
  { name: 'Customer rollout', dueAt: '2026-08-31T23:59:59.999Z' },
  {
    idempotencyKey: 'customer-rollout-42',
  },
)
const completed = await client.projectTemplateInstantiations.wait(accepted.data.id, {
  acceptedOperation: accepted.data,
  maxWaitMs: 120_000,
})
```

Passing `acceptedOperation` binds every poll to the accepted operation ID and template and generated
project IDs. The SDK rejects a response if any of those immutable fields changes while polling. The
CLI applies the same binding automatically when `--wait` is present.

Only the credential that created an instantiation can read its operation status. A replay with the
same idempotency key and payload returns the original operation; using the key for different input
returns `409`. The static Beta 2 template and operation representations do not expose developer,
source, or result revision fields. Template metadata and operation status are forbidden in every MCP profile because
captured workflow shape and bulk creation state are not suitable bounded model tools.
