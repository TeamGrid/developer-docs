---
title: API v0 recipes
description: Follow practical TeamGrid API v0 integration recipes for projects, contacts, reporting, webhooks, and time tracking.
owner: Developer Platform
reviewedAt: 2026-07-29
---

These recipes are retained for existing v0 integrations. They combine several endpoint calls into
copyable workflows and call out the retry, identifier, and synchronization behavior that matters in
production.

| Recipe | Use case |
| --- | --- |
| [Create a project with tasks](/api/v0/recipes/create-a-project-with-tasks/) | Create a project, add its first tasks, and store the returned identifiers |
| [Import contacts](/api/v0/recipes/import-contacts/) | Move customer or supplier contacts from another system into TeamGrid |
| [Synchronize time entries for reporting](/api/v0/recipes/sync-time-entries-for-reporting/) | Pull time entries into a BI, payroll, or invoicing pipeline |
| [Build a webhook receiver](/api/v0/recipes/build-a-webhook-receiver/) | Receive events safely and process repeated deliveries idempotently |
| [Start and stop task time tracking](/api/v0/recipes/start-and-stop-task-time-tracking/) | Start an active timer and close it with an explicit timestamp |

## Before you start

Read [authentication](/api/v0/guides/authentication/),
[requests and responses](/api/v0/guides/requests-and-responses/),
[pagination](/api/v0/guides/pagination/), and
[rate limits](/api/v0/guides/rate-limit/) before using a recipe against production data.

Store tokens in a secret manager, retain TeamGrid identifiers returned by create requests, and avoid
blind retries for v0 write operations. The legacy API does not provide the idempotency and
resource-concurrency guarantees available in API v1.
