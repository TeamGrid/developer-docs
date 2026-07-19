---
title: SDK quickstart
description: Install the TeamGrid TypeScript SDK and list tasks through a region-aware API v1 client.
---

## Install

```bash
npm install @teamgrid/api-client@next
```

## Create a client

```ts
import { TeamGridClient } from '@teamgrid/api-client'

const client = new TeamGridClient({
  token: process.env.TEAMGRID_API_TOKEN!,
})
```

The client derives the regional API endpoint from the credential. Do not hard-code the German endpoint in a multi-region service.

## Read a page

```ts
const page = await client.tasks.list({
  limit: 50,
  projectId: 'project-id',
})

for (const task of page.data) {
  console.log(task.id, task.attributes.name)
}
```

## Create safely

```ts
const result = await client.tasks.create(
  {
    name: 'Prepare launch',
    projectId: 'project-id',
  },
  { idempotencyKey: 'launch-task-1' },
)

console.log(result.data.id)
```

## Update with a typed precondition

Task, project, and project-template mutation options require a resource-specific `ifMatch` value.
Use the branded revision from the latest representation:

```ts
const current = await client.tasks.get('task-id')

const updated = await client.tasks.update(
  current.data.id,
  { name: 'Reviewed launch plan' },
  { ifMatch: current.data.attributes.developerRevision },
)

console.log(updated.data.attributes.developerRevision)
console.log(updated.transport.headers.etag)
```

The client verifies that the strong response ETag matches the returned `developerRevision`. It
rejects a task revision used for a project or template mutation at compile time, and rejects
malformed raw values before sending a request. On `412`, fetch the task again and reconcile the
patch; do not resend the same decision automatically. See [resource revisions and concurrent
writes](/api/v1/resource-concurrency/).

Keep the credential in a secret manager and inject it through the process environment. Never bundle it into browser code.
