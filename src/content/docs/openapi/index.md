---
title: OpenAPI files
description: Download the exact TeamGrid API v0 and v1 OpenAPI 3.1 contracts used to generate this documentation.
---

The API reference is generated from checked-in OpenAPI 3.1 contracts. The same files are available for code generation, validation, or import into an API client:

- [Download API v1 OpenAPI JSON](/openapi/v1.json)
- [Download API v0 OpenAPI JSON](/openapi/v0.json)
- [Download the Developer Platform capability ledger](/openapi/developer-capabilities.json)
- [Download the canonical scope contract](/openapi/developer-scopes.json)
- [Download the complete v0-to-v1 migration map](/openapi/v0-to-v1-migration.json)
- [Download the canonical contract manifest](/openapi/developer-platform-manifest.json)
- [Download the frozen v0 route inventory](/openapi/v0-routes.json)

## Contract policy

API v1 is the source contract for new integrations. The v0 file describes the frozen compatibility runtime rather than every operation historically advertised by the previous documentation.

The canonical manifest publishes byte counts and SHA-256 digests for both OpenAPI files, the v0
runtime inventory, and the cross-interface capability ledger. The documentation repository also
records the immutable contract source commit and the API runtime commit carrying those artifacts
in `sources/contracts.json`. CI fails if any published artifact or provenance field drifts.

The current `1.0.0-rc.1` manifest records 111 v1 paths, 181 governed v1 operations, 87 frozen v0
operations, 87 v0 migration decisions, 78 canonical scopes, and 73 classified TeamGrid product
capabilities. It also records 14 `resource-cas-v1` mutations, two qualified asynchronous-operation
reads, and another 31 domain-specific `If-Match` operations. These counts describe the synchronized
contract; they do not promote planned capabilities into the release candidate.

Consumers should pin the manifest's `contractVersion` together with the OpenAPI digest and package
release they tested. The `1.0.0-rc.1` checkpoint qualifies core project, task, and project-template
CAS while preserving all domain-specific preconditions. Its synchronized SDK, CLI, and MCP package
checkpoint is `1.0.0-rc.1`. See [resource concurrency](/api/v1/resource-concurrency/).

Use the versioned regional server URL from the credential location. Do not rewrite API v1 operations to a global API v0 host.
