---
title: SDK pagination and errors
description: Traverse TeamGrid cursor pages and handle typed API and client failures.
---

## Async page iteration

```ts
for await (const page of client.tasks.pages({ projectId: 'project-id' })) {
  for (const task of page.data) {
    console.log(task.id)
  }
}
```

The iterator stops when `nextCursor` is `null` and detects a repeated cursor instead of looping forever.

## Error classes

```ts
import { TeamGridApiError, TeamGridClientError } from '@teamgrid/api-client'

try {
  await client.workspace.get()
} catch (error) {
  if (error instanceof TeamGridApiError) {
    console.error(error.status, error.requestId, error.errors)
  } else if (error instanceof TeamGridClientError) {
    console.error(error.code, error.message)
  } else {
    throw error
  }
}
```

`TeamGridApiError` represents an HTTP response from API v1. `TeamGridClientError` represents local validation, routing, timeout, response-size, malformed-response, or network failures.

Neither error class stores the bearer credential. Application logs should still avoid serializing request headers, input payloads, or environment variables.
