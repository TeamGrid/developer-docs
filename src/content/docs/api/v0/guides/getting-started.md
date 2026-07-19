---
title: "Quickstart"
description: "Create a token, call the API, retrieve users, create projects and tasks, and start tracking time."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Create a token, call the API, retrieve users, create projects and tasks, and start tracking time.

This quickstart shows the shortest path from a new API token to a working
TeamGrid integration.

## 1. Create an API Token

Open TeamGrid and go to:

```text
Team settings -> Developer -> API tokens
```

Create a token for the team you want to integrate. Store the token securely.
TeamGrid does not require a separate team id in API requests because the token
already identifies the team.

## 2. Call the API

Send the token in the `Authorization` header:

```sh
curl https://api.teamgrid.app/teams \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

A successful [GET /teams](/api/v0/reference/operations/v0_get_teams/) response returns the team
associated with the token.

## 3. List Users

Users are often needed before assigning tasks or creating time entries. Use
[GET /users](/api/v0/reference/operations/v0_get_users/) to list users in the token team.

```sh
curl https://api.teamgrid.app/users \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

You can filter by email address:

```sh
curl "https://api.teamgrid.app/users?email=alex@example.com" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

## 4. Create a Project

Use [POST /projects](/api/v0/reference/operations/v0_post_projects/) to create a project.

```sh
curl https://api.teamgrid.app/projects \
  -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Website relaunch",
    "description": "Implementation project for the new website."
  }'
```

## 5. Create a Task

Use the project id returned by the project request, then create the task with
[POST /tasks](/api/v0/reference/operations/v0_post_tasks/).

```sh
curl https://api.teamgrid.app/tasks \
  -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Prepare launch checklist",
    "projectId": "PROJECT_ID",
    "plannedTime": 120
  }'
```

`plannedTime` is expressed in minutes.

## 6. Start and Stop Time Tracking

Use [Start task time tracking](/api/v0/reference/operations/v0_post_tasks_id_starttracking/) to start tracking
with `POST /tasks/{_id}/startTracking`. Use
[Stop task time tracking](/api/v0/reference/operations/v0_post_tasks_id_stoptracking/) to stop tracking with
`POST /tasks/{_id}/stopTracking`.

```sh
curl https://api.teamgrid.app/tasks/TASK_ID/startTracking \
  -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "time": "2026-07-01T09:00:00Z"
  }'
```

```sh
curl https://api.teamgrid.app/tasks/TASK_ID/stopTracking \
  -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "time": "2026-07-01T10:15:00Z"
  }'
```

## Next

Read the guides on [authentication](/api/v0/guides/authentication/),
[pagination](/api/v0/guides/pagination/), [date handling](/api/v0/guides/dates-and-time-zones/),
[errors](/api/v0/guides/rate-limit/), [webhooks](/api/v0/guides/webhooks/),
[OpenAPI tooling](/api/v0/guides/using-openapi/), and [recipes](/api/v0/recipes/) before
using the API in production.
