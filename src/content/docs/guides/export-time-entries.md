---
title: Export time entries for reporting
description: Build a bounded, repeatable time-entry export for reporting or finance workflows.
owner: Developer Experience
reviewedAt: 2026-07-29
---

## Define the reporting interval

Use an explicit inclusive start and exclusive end. Keep the timezone used by the reporting system
alongside the export job; do not infer it from a user’s current browser.

Read `GET /time-entries` with the narrowest available date, user, project, service and billing
filters. Follow cursor pagination and persist the cursor only after the corresponding page has been
stored successfully.

## Treat commercial fields carefully

Billing and finance fields can require additional scopes. Missing fields are not necessarily zero:
they may be deliberately omitted because the credential lacks authority. Keep commercially
sensitive exports in access-controlled storage and use short retention periods.

## Prefer asynchronous exports for large datasets

For larger workloads, create an export through `POST /exports`, poll `GET /exports/{id}` until it is
terminal, then create a short-lived download intent. Do not share or persist the resulting download
URL as if it were a permanent file location.

## Make reruns deterministic

Name each export job with the workspace, interval and contract version. Upsert downstream records by
opaque TeamGrid ID and record the last successful boundary. A rerun of the same interval should
replace or reconcile records rather than duplicate them.
