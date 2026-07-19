---
title: "Recipes"
description: "Follow practical TeamGrid API integration recipes for projects, contacts, reporting, webhooks, and time tracking."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Follow practical TeamGrid API integration recipes for projects, contacts, reporting, webhooks, and time tracking.

Recipes are practical integration patterns built from the API Reference and
guides. Use them when you want to copy a working sequence rather than assemble
individual endpoint calls from scratch.

## Available Recipes

| Recipe                                                                          | Use case                                                     |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Create a project with tasks](/api/v0/recipes/create-a-project-with-tasks/)             | Create a project, add tasks, and store returned ids.         |
| [Import contacts](/api/v0/recipes/import-contacts/)                                     | Upsert customer or supplier contacts from another system.    |
| [Sync time entries for reporting](/api/v0/recipes/sync-time-entries-for-reporting/)     | Pull time entries into a BI, payroll, or invoicing pipeline. |
| [Build a webhook receiver](/api/v0/recipes/build-a-webhook-receiver/)                   | Receive TeamGrid events safely and idempotently.             |
| [Start and stop task time tracking](/api/v0/recipes/start-and-stop-task-time-tracking/) | Start an active timer and close it with an end timestamp.    |

## Before You Start

Read these guides first:

* [Authentication](/api/v0/guides/authentication/)
* [Requests and Responses](/api/v0/guides/requests-and-responses/)
* [Pagination and Filtering](/api/v0/guides/pagination/)
* [Errors and Rate Limits](/api/v0/guides/rate-limit/)

## Production Checklist

* Store the TeamGrid API token in a secret manager.
* Use `https://api.teamgrid.app` as the API base URL.
* Verify tokens with [GET /teams](/api/v0/reference/operations/v0_get_teams/).
* Add retry behavior for `429` and transient `5xx` responses.
* Avoid blind retries for create requests unless your own system can detect
  duplicates.
* Log TeamGrid ids returned by create requests.
