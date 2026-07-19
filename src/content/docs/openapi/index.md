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
records its source commit in `sources/contracts.json`. CI fails if any published artifact drifts.

The current manifest records 62 v1 paths, 106 governed v1 operations, 87 frozen v0 operations, 87
v0 migration decisions, 43 canonical scopes, and 73 classified TeamGrid product capabilities.
These counts describe the synchronized contract; they do not promote planned capabilities into the
controlled beta.

Use the versioned regional server URL from the credential location. Do not rewrite API v1 operations to a global API v0 host.
