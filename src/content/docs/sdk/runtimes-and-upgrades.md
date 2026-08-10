---
title: SDK runtimes and upgrades
description: Run the ESM-only TeamGrid SDK on supported Node.js versions and upgrade package releases with a repeatable compatibility check.
owner: Developer Platform
reviewedAt: 2026-08-10
---

`@teamgrid/api-client@1.0.5` is an ESM-only Node.js package. Its declared runtime range is Node.js
22.14 through Node.js 24 (`>=22.14 <25`). Pin both the package and Node major in deployed builds.

## ESM setup

Use an ESM project by setting `"type": "module"` in `package.json`, or use `.mjs` files:

```json
{
  "type": "module",
  "dependencies": {
    "@teamgrid/api-client": "1.0.5"
  }
}
```

```ts
import { TeamGridClient, TeamGridApiError } from '@teamgrid/api-client'
```

The package exports JavaScript and TypeScript declarations from its root entry point. It does not
publish a CommonJS `require()` condition or internal subpath imports. Do not import files from
`@teamgrid/api-client/dist`; those paths are not part of the public package contract.

## Required runtime capabilities

Supported Node releases provide the required Fetch, Web Crypto, URL, streams, `AbortController`,
and `Uint8Array` behavior. The SDK checks for a usable Fetch implementation when the client is
constructed and requires secure `crypto.randomUUID()` when it must create an idempotency key.

The SDK is designed for server-side integrations. Do not bundle personal or service credentials
into browser JavaScript, desktop packages, public mobile applications, or static site output. A
browser-facing application should call its own authenticated backend, which then calls TeamGrid.

## Containers, jobs, and serverless functions

- Inject the credential through the platform's secret manager.
- Keep the credential and its regional endpoint together; do not copy requests between regions.
- Reuse a configured client inside a process where practical, but pass per-request cancellation and
  request IDs through method options.
- Set the platform execution timeout above the SDK timeout so the SDK can return a structured
  failure before the runtime terminates the process.
- Bound cursor pages, wait helpers, export sizes, and job execution time explicitly.
- Never serialize or cache reveal-once credential, webhook-secret, or transfer-intent responses.

## Check server compatibility

The anonymous API discovery response declares the stable contract and minimum supported client
versions. After constructing a client, call the typed discovery method during a deployment smoke
test:

```ts
const discovery = await client.system.getApiVersion()

if (discovery.data.supportedClients.sdk.supportedMajor !== 1) {
  throw new Error('This deployment does not support the active TeamGrid SDK major')
}

console.log(discovery.data.contractVersion)
console.log(discovery.data.supportedClients.sdk.minimumVersion)
```

Do not use discovery as a reason to install a new package automatically at runtime. Package
updates belong in the normal reviewed build and deployment process.

## Upgrade procedure

1. Read the [Developer Platform changelog](/changelog/) and
   [compatibility policy](/resources/compatibility/).
2. Update to an exact package version; do not change a floating range in production without
   reviewing the resolved lockfile.
3. Run TypeScript compilation. New type errors often expose a contract assumption before runtime.
4. Regenerate or validate any mocks against the current OpenAPI response shapes.
5. Exercise the read, create, compare-and-set update, pagination, and error paths your integration
   uses.
6. Deploy to a dedicated non-production workspace and run `system.getApiVersion()` plus your smoke
   test.
7. Roll out gradually while monitoring `TeamGridApiError.status`, stable error codes, request IDs,
   retry counts, and latency.

Keep the previous application artifact and lockfile available for rollback. Credential rotation is
independent of a package rollback: never restore a credential that was revoked during an incident.

## TypeScript upgrade boundaries

The public data and options types are exported from the package root. Prefer those names over
copying local versions of request interfaces:

```ts
import type {
  Task,
  TaskCreate,
  TaskListOptions,
  TaskMutationOptions,
} from '@teamgrid/api-client'
```

Finance-gated properties remain optional because their presence depends on scopes and workspace
entitlements. Treat an absent optional field as undisclosed, not as zero or false.

## Reference checkpoints

- [Exact SDK resource and method reference](/sdk/reference/)
- [Client configuration](/sdk/configuration/)
- [Testing and mocking](/sdk/testing-and-mocking/)
- [API discovery and capabilities](/api/v1/platform-control-plane/)
