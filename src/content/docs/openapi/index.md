---
title: OpenAPI files
description: Download the exact TeamGrid API v0 and v1 OpenAPI 3.1 contracts used to generate this documentation.
---

The API reference is generated from checked-in OpenAPI 3.1 contracts. The same files are available for code generation, validation, or import into an API client:

- [Download API v1 OpenAPI JSON](/openapi/v1.json)
- [Download API v0 OpenAPI JSON](/openapi/v0.json)

## Contract policy

API v1 is the source contract for new integrations. The v0 file describes the frozen compatibility runtime rather than every operation historically advertised by the previous documentation.

The documentation repository records the SHA-256 digest, source repository commit, path count, and operation count for both contracts in `sources/contracts.json`. CI fails if the published files drift from that manifest.

Use the versioned regional server URL from the credential location. Do not rewrite API v1 operations to a global API v0 host.
