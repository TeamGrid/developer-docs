---
title: End-to-end task workflow
description: Complete the same safe TeamGrid task workflow through HTTP, the TypeScript SDK, the CLI, and the read-only MCP server.
owner: Developer Experience
reviewedAt: 2026-08-10
---

This tutorial reads a task, changes its name with a strong precondition, and verifies the result.
Use a dedicated test task. MCP stops after the read because its public tool surface is deliberately
read-only.

## Prerequisites

- a credential in the correct region with `workspace:read` and `tasks:read`;
- `tasks:write` only for the HTTP, SDK, or CLI update;
- one existing test task ID;
- an explicit intended new name.

Set the values without printing the credential:

```bash
export TEAMGRID_API_TOKEN='reveal-once-value'
export TEAMGRID_TASK_ID='task-id'
export TEAMGRID_TASK_NAME='Reviewed integration task'
```

## HTTP

Read the task and retain its strong ETag response header:

```bash
curl --fail-with-body --dump-header task.headers \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header "Accept: application/json" \
  "https://api.de.teamgrid.app/v1/tasks/$TEAMGRID_TASK_ID"
```

Extract the ETag without copying it into logs, then send the guarded update:

```bash
TEAMGRID_TASK_ETAG="$(awk 'tolower($1)=="etag:" {sub(/\r$/, "", $2); print $2}' task.headers)"
curl --fail-with-body \
  --request PATCH \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header "Accept: application/json" \
  --header "Content-Type: application/json" \
  --header "If-Match: $TEAMGRID_TASK_ETAG" \
  --data "{\"name\":\"$TEAMGRID_TASK_NAME\"}" \
  "https://api.de.teamgrid.app/v1/tasks/$TEAMGRID_TASK_ID"
```

For customer-provided text, construct JSON with a JSON library rather than shell interpolation.
A `412` means the task changed after the read; fetch it again and decide whether the new server
value can be merged.

## TypeScript SDK

```ts
import { TeamGridApiError, TeamGridClient } from '@teamgrid/api-client'

const client = new TeamGridClient({
  token: process.env.TEAMGRID_API_TOKEN!,
  timeoutMs: 30_000,
})

const task = await client.tasks.get(process.env.TEAMGRID_TASK_ID!)

try {
  const updated = await client.tasks.update(
    task.data.id,
    { name: process.env.TEAMGRID_TASK_NAME! },
    { ifMatch: task.transport.headers.etag },
  )
  console.log(updated.data.id, updated.data.attributes.name)
} catch (error) {
  if (error instanceof TeamGridApiError && error.status === 412) {
    throw new Error('Task changed; re-read and reconcile before retrying.')
  }
  throw error
}
```

The client derives the regional API endpoint from the credential and validates the returned task
envelope and strong ETag.

Download the runnable [example module](/examples/teamgrid-task-workflow.mjs) and its
[pinned package manifest](/examples/teamgrid-task-workflow.package.json), save the manifest as
`package.json`, run `npm install`, and then execute `node teamgrid-task-workflow.mjs` with the three
required environment variables. Inspect both files before running them against a workspace.

## CLI

```bash
teamgrid tasks get "$TEAMGRID_TASK_ID" --output json
teamgrid tasks update "$TEAMGRID_TASK_ID" \
  --data "{\"name\":\"$TEAMGRID_TASK_NAME\"}" \
  --if-match "$TEAMGRID_TASK_ETAG" \
  --output json
```

For automation, parse the first command's JSON output rather than scraping table text. A stale
revision exits with the documented concurrency exit code; re-read instead of repeating the same
write blindly. See the exact [CLI task reference](/cli/reference/tasks/).

## MCP

Configure the `core` profile, then ask the trusted host:

```text
Use teamgrid_task_get to read task TASK_ID. Return only its id, name, project id,
completion state, and developer revision. Do not call any other TeamGrid tool.
```

Review the proposed tool call before allowing it. MCP can return the current revision but exposes
no mutation tool and cannot submit `If-Match`. Complete the update through HTTP, SDK, or CLI.

## Verify and clean up

Read the task again and verify the expected name and a new revision. Remove `task.headers`, unset
the shell variables, and restore or archive the dedicated test task according to the workspace's
test-data policy. Finally, confirm the request in the API audit trail without exporting the bearer
credential or payload.
