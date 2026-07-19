---
title: Collaboration and files
description: Use scoped comments, activity, documents, and private file-transfer intents.
---

## Comments and activity

Comments attach plain text to a `contact`, `project`, or `task`. Activity is a read-only, paginated
projection for the same target types. Both require an explicit `targetType` and `targetId`.

`comments:read` or `comments:write` and `activity:read` are base scopes. TeamGrid also requires the
matching target-domain scope: `contacts:read`, `projects:read`, or `tasks:read`. This prevents a
cross-domain comment or activity query from becoming a side channel around the resource's normal
authorization. Comment creation is idempotent; archive and restore are explicit lifecycle commands.

## Documents

Documents expose bounded text content through list, get, create, compare-and-set update, archive, and
restore operations. Creates use `documents:write` and an idempotency key. Updates require the latest
strong `doc1` revision in `If-Match`; clients must re-read after a `412` instead of overwriting a
concurrent edit.

## Files and transfer intents

File metadata has list, get, rename, archive, and restore operations. Binary transfer uses a separate,
short-lived capability flow:

1. Create a private upload intent with file metadata and a destination.
2. Upload to the returned transfer target exactly as instructed.
3. Finalize the intent so TeamGrid can validate and attach the file, or cancel it when the upload is
   abandoned.

Downloads likewise begin with `POST /files/{id}/download-intent`. Treat every returned transfer
capability as a bearer secret: keep it out of source control, URLs, logs, analytics, error reports,
and AI transcripts. Official clients do not follow redirects and apply bounded response limits.

Documents, file metadata, file content, and signed transfer capabilities are unavailable through
MCP. Use API v1, the SDK, or the CLI for a controlled file workflow.
