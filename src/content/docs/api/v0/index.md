---
title: API v0 · Legacy
description: Compatibility documentation for existing TeamGrid API v0 integrations.
---

API v0 is a frozen compatibility surface for existing integrations. New integrations should use [API v1](/api/v1/).

## Base URLs

```text
https://api.teamgrid.app
https://api.teamgridapp.com
```

The first hostname is canonical for v0 examples. The second remains available for existing integrations.

## Compatibility policy

- Existing authorized behavior remains supported.
- Security fixes can reject unsafe or unauthorized behavior without being a compatibility regression.
- v0 uses broad team tokens and page-number pagination.
- v0 does not gain API v1 credentials, scopes, cursor pagination, idempotent creates, regional routing, or webhook v2 signatures.
- New capabilities are developed on API v1.

The endpoint reference is generated from the checked runtime route inventory rather than copied from historical documentation pages.

## Continue

- [Read the migrated v0 guides](/api/v0/guides/overview/).
- [Open the generated endpoint reference](/api/v0/reference/).
- [Plan a migration to v1](/api/v0/migration/).
