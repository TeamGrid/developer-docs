---
title: Search and exports
description: Search authorized resources and download bounded CSV exports through a header-only capability.
---

## Federated search

`POST /search` searches a bounded set of `contacts`, `projects`, and `tasks`. The request requires a
term of at least two characters, one to three unique resource types, and an optional limit of at most
50.

`search:read` is only the federation scope. Every requested type also requires its domain read scope
and the normal product permission. Asking for `projects` and `tasks`, for example, requires both
`projects:read` and `tasks:read`. Results never cross the credential's workspace or cell boundary.

Search is the only newly added AI-facing operation: `teamgrid_search` is a curated, sensitive MCP
tool. Use a dedicated credential and request only the resource types needed for the question.

## Bounded asynchronous exports

`POST /exports` creates a CSV export job for `contacts`, `projects`, `tasks`, or `timeEntries`.
Exports are bounded to 10,000 rows and at most 16 selected fields. The request supports archived and
updated-at filters and must use a stable `Idempotency-Key` when retried.

Creating a job requires `exports:write`; status and download operations require `exports:read`. The
matching domain read scope and analytics permission are also enforced. Poll `GET /exports/{id}` until
the state is `succeeded` or `failed`; a successful job records whether the requested result was
truncated.

Exports stay in the workspace's owning cell and use a dedicated private bucket that is separate
from normal file uploads. A completed job record is retained for approximately one hour. Objects
under the private `developer-exports/` prefix expire after one day, so download a completed export
promptly. If the job is no longer available, create a new export instead of retaining or replaying
an old download capability.

## Header-only download capability

Completed exports use a two-step download flow:

1. Call `POST /exports/{id}/download-intent` to create a short-lived opaque capability.
2. Call `GET /exports/{id}/download` with that value **only** in the
   `X-TeamGrid-Export-Download-Intent` header.

```bash
curl --fail-with-body \
  --header "Authorization: Bearer $TEAMGRID_TOKEN" \
  --header "X-TeamGrid-Export-Download-Intent: $DOWNLOAD_INTENT" \
  --output teamgrid-export.csv \
  "https://api.de.teamgrid.app/v1/exports/$EXPORT_ID/download"
```

Never put the intent in a query parameter, URL, command history, log, or analytics field. The
download endpoint does not accept a query-string fallback. TeamGrid resolves private object storage
internally and streams the file through the API with redirects disabled, a 50 MiB response limit,
`Cache-Control: no-store`, and content-type hardening. It does not reveal a storage URL.

Export jobs, intents, metadata, and bulk content are forbidden in every MCP profile.
