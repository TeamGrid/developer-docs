---
title: Test and mock SDK integrations
description: Test TeamGrid SDK code with injected transports, deterministic retries, contract fixtures, and a dedicated non-production workspace.
owner: Developer Experience
reviewedAt: 2026-08-10
---

Test the boundary you own. Most application tests should replace your TeamGrid adapter, a smaller
set should exercise the SDK through an injected Fetch implementation, and a final smoke suite
should call a dedicated non-production workspace with a least-privilege credential.

## Put the SDK behind an application adapter

Keep TeamGrid calls in a small module instead of constructing a client throughout the application:

```ts
import { TeamGridClient, type Task } from '@teamgrid/api-client'

export type TaskSource = {
  listOpen(projectId: string): Promise<Task[]>
}

export function teamGridTaskSource(client: TeamGridClient): TaskSource {
  return {
    async listOpen(projectId) {
      const tasks: Task[] = []
      for await (const page of client.tasks.pages({ completed: false, projectId })) {
        tasks.push(...page.data)
      }
      return tasks
    },
  }
}
```

Application-domain tests can now supply a small `TaskSource` fake without reproducing HTTP,
pagination, or retry behavior.

## Inject Fetch for SDK boundary tests

`TeamGridClientOptions.fetch` accepts the runtime Fetch signature. This lets a test inspect the
actual URL and headers and return a contract-shaped response without opening a port.

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { TeamGridClient } from '@teamgrid/api-client'
import { testCredential } from './fixtures/test-credential.js'

test('loads the current workspace through the SDK boundary', async () => {
  const client = new TeamGridClient({
    token: testCredential, // a synthetic, structurally valid credential; never a live secret
    fetch: async (input, init) => {
      const url = new URL(String(input))
      assert.equal(url.pathname, '/v1/workspace')
      assert.match(new Headers(init?.headers).get('authorization')!, /^Bearer /)

      return new Response(JSON.stringify({
        data: {
          attributes: {
            cellId: 'test-cell',
            currency: 'EUR',
            name: 'SDK contract test',
            region: 'de',
            subdomain: 'sdk-contract-test',
          },
          id: 'workspace-test',
          type: 'workspace',
        },
        meta: { requestId: 'request-test' },
      }), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      })
    },
  })

  const workspace = await client.workspace.get()
  assert.equal(workspace.data.id, 'workspace-test')
})
```

The test credential must match the documented credential grammar because regional parsing happens
before the request. Keep only a synthetic credential in test fixtures and mark it according to
your repository's secret-scanner policy. Never copy a personal or service credential into source.

## Use contract-shaped fixtures

The SDK deliberately validates sensitive and newer domain responses. A partial object that happens
to satisfy your application may be rejected as `invalid_api_response`. Build fixtures from the
response example or schema linked on the corresponding [SDK method page](/sdk/reference/), then
override only the fields relevant to the test.

Also test the failures your adapter promises to handle:

- an HTTP error envelope that becomes `TeamGridApiError`;
- a `412` conflict requiring a fresh read;
- `429` with `Retry-After`;
- a caller abort and an SDK timeout;
- an oversized response;
- repeated cursors causing `pagination_cycle`;
- `410` for an expired change-feed checkpoint.

## Make retry tests deterministic

Inject `sleep` and `random` to observe retry delays without waiting:

```ts
const delays: number[] = []
const client = new TeamGridClient({
  token: testCredential,
  fetch: transientThenSuccessfulFetch,
  random: () => 0,
  retries: 2,
  sleep: async (milliseconds) => { delays.push(milliseconds) },
})

await client.workspace.get()
assert.equal(delays.length, 1)
```

Do not assert a private internal backoff formula. Assert the externally important behavior: bounded
attempts, cancellation, `Retry-After`, and whether a particular HTTP method is eligible.

## Run a non-production smoke test

Use a dedicated workspace and credential with only the scopes required by the smoke path. A useful
post-deploy test performs the following in the credential's own region:

1. call `system.getApiVersion()` and check the supported SDK major;
2. read `workspace.get()`;
3. create a uniquely named disposable task with a stable idempotency key;
4. read and update it with the returned ETag;
5. archive the task with the next ETag;
6. revoke or rotate the smoke credential on schedule.

Never run destructive integration tests against an arbitrary customer workspace. Record the API
request IDs and remove only resources carrying the unique test-run marker.

## Test webhooks independently

Use the real `verifyTeamGridWebhook()` implementation with synthetic request bytes, headers, and a
synthetic signing secret. Cover valid delivery, invalid signature, timestamp outside tolerance,
body-size limit, and duplicate delivery. See [webhook verification](/sdk/webhook-verification/).
