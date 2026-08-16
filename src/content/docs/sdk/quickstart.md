---
title: SDK quickstart
description: Install the TeamGrid TypeScript SDK and list tasks through a region-aware API v1 client.
owner: Developer Experience
reviewedAt: 2026-08-08
---

## Install

```bash
npm install @teamgrid/api-client@1.0.7
```

## Create a client

```ts
import { TeamGridClient } from '@teamgrid/api-client'

const client = new TeamGridClient({
  token: process.env.TEAMGRID_API_TOKEN!,
})
```

The client derives the regional API endpoint from the credential. Do not hard-code the German endpoint in a multi-region service.
The SDK never starts browser authentication and does not read CLI profiles. Use a personal
credential from the process environment for a local developer-owned script. Use a service-account
credential from a secret manager for every deployed, scheduled, or shared process.

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

## Update a task

Tasks expose a developer revision and strong ETag. Read the task and pass that validator to the
mutation:

```ts
const task = await client.tasks.get('task-id')
const updated = await client.tasks.update(
  'task-id',
  { name: 'Reviewed launch plan' },
  { ifMatch: task.transport.headers.etag },
)

console.log(updated.data.attributes.name)
```

## Use task workflows

Task placement and checklist replacement are atomic, revision-protected operations:

```ts
const current = await client.tasks.get('task-id')
const moved = await client.tasks.move(
  current.data.id,
  {
    axis: 'projectList',
    listId: 'review-list-id',
    projectId: 'project-id',
  },
  { ifMatch: current.transport.headers.etag },
)

await client.tasks.replaceSubtasks(
  moved.data.id,
  {
    subtasks: [
      { completed: true, id: 'existing-check-id', title: 'Draft reviewed' },
      { title: 'Obtain approval' },
    ],
  },
  { ifMatch: moved.transport.headers.etag },
)
```

For an exact insertion position, pass `previousTaskId`, `nextTaskId`, or both to `move()`. Those
neighbors must still belong to the selected axis and container. Checklist replacement preserves
supplied item IDs and creates IDs for new items.

Do not synthesize a task ETag. Other protected resources retain explicit, typed compare-and-set
options; always read their current revision first. See
[resource concurrency](/api/v1/resource-concurrency/).

Keep the credential in a secret manager and inject it through the process environment. Never bundle it into browser code.
See [authentication by environment](/resources/authentication-by-environment/) for lifecycle and
revocation guidance.
