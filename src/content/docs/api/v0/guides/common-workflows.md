---
title: "Common Workflows"
description: "Build common integrations such as project creation, task assignment, contact imports, time sync, and webhook handling."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Build common integrations such as project creation, task assignment, contact imports, time sync, and webhook handling.

This guide shows common API workflows that combine multiple TeamGrid resources.
For copyable end-to-end examples, see [Recipes](/api/v0/recipes/).

## Create a Project with Tasks

1. Create the project with [POST /projects](/api/v0/reference/operations/v0_post_projects/).
2. Store the returned project id.
3. Create tasks with [POST /tasks](/api/v0/reference/operations/v0_post_tasks/) and `projectId`.

```sh
curl https://api.teamgrid.app/projects \
  -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer onboarding"
  }'
```

```sh
curl https://api.teamgrid.app/tasks \
  -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Prepare kickoff agenda",
    "projectId": "PROJECT_ID",
    "plannedTime": 60
  }'
```

## Assign a Task

Fetch users with [GET /users](/api/v0/reference/operations/v0_get_users/), then update the task with
the selected `userId`.

```sh
curl https://api.teamgrid.app/tasks/TASK_ID \
  -X PUT \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID"
  }'
```

## Complete a Task

Use [Update task](/api/v0/reference/operations/v0_put_tasks_id/) to complete a task with
`PUT /tasks/{_id}`.

```sh
curl https://api.teamgrid.app/tasks/TASK_ID \
  -X PUT \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

## Import Contacts

Create companies and people with [POST /contacts](/api/v0/reference/operations/v0_post_contacts/).
Use `type` to distinguish them.

Company:

```json
{
  "type": "company",
  "companyTitle": "Acme Inc."
}
```

Person:

```json
{
  "type": "person",
  "firstname": "Alex",
  "lastname": "Morgan",
  "emails": [
    {
      "type": "business",
      "email": "alex@example.com"
    }
  ]
}
```

## Synchronize Time Entries

Use [GET /times](/api/v0/reference/operations/v0_get_times/) with date filters for incremental
synchronization.

```text
GET /times?startFrom=2026-07-01T00:00:00Z&startTo=2026-07-31T23:59:59Z
```

Store the TeamGrid `_id` of every synchronized time entry. Use update endpoints
for follow-up changes instead of creating duplicate records.

## React to Changes with Webhooks

Register webhook actions with [POST /webhooks](/api/v0/reference/operations/v0_post_webhooks/) for
the events your system needs.

Examples:

* `task_created` to mirror new tasks
* `task_completed` to trigger downstream workflow
* `timeentry_created_manually` to sync time reports
* `project_completed` to close project work in another system

Webhook handlers should be idempotent. TeamGrid can send rich event payloads,
but your integration should still tolerate repeated or delayed deliveries.
