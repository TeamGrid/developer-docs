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

Keep the credential in a secret manager and inject it through the process environment. Never bundle it into browser code.
