---
title: Developer tooling and downloads
description: Official TeamGrid packages, API contracts and importable client collections in one place.
owner: Developer Experience
reviewedAt: 2026-08-08
---

## Official packages

The stable public packages share version `1.0.5` and the API v1 contract:

| Package | Install | Use |
| --- | --- | --- |
| [`@teamgrid/api-client`](https://www.npmjs.com/package/@teamgrid/api-client) | `npm install @teamgrid/api-client@1.0.5` | TypeScript and Node.js services |
| [`@teamgrid/cli`](https://www.npmjs.com/package/@teamgrid/cli) | `npm install --global @teamgrid/cli@1.0.5` | Terminal, scripts and CI |
| [`@teamgrid/mcp-server`](https://www.npmjs.com/package/@teamgrid/mcp-server) | `npm install --global @teamgrid/mcp-server@1.0.5` | Compatible MCP hosts |

Pin the exact package version in reproducible deployments. CI for this portal verifies that every
documented stable package is publicly available before Production deployment.

## Contracts and collections

- [API v1 OpenAPI 3.1 JSON](/openapi/v1.json)
- [API v0 OpenAPI 3.1 JSON](/openapi/v0.json)
- [Postman collection for API v1](/collections/teamgrid-api-v1.postman.json)
- [HTTP client collection for API v1](/collections/teamgrid-api-v1.http)
- [Developer Platform manifest](/openapi/developer-platform-manifest.json)
- [Canonical scope contract](/openapi/developer-scopes.json)

Bruno, Insomnia and other OpenAPI-capable tools should import the API v1 JSON directly. This keeps
their generated requests aligned with every path, parameter and schema in the stable contract.

## Credential setup

Create credentials from **TeamGrid Settings → Team → Developer → Access**. Select the smallest required scopes,
copy the reveal-once secret into the client’s environment or secret store, and use the region
encoded by the credential.

For a local CLI, prefer browser login instead of creating and pasting a token. For a deployed
integration or CI job, create a service account and inject its credential from a secret manager.

Never commit a credential into a collection, `.http` file, shell history or source repository.
