---
title: "Requests and Responses"
description: "Understand JSON request bodies, TeamGrid response envelopes, server-managed fields, and partial updates."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Understand JSON request bodies, TeamGrid response envelopes, server-managed fields, and partial updates.

The TeamGrid API accepts JSON request bodies and returns JSON responses.

## Request Format

Use `Content-Type: application/json` for requests with a body:

```http
Content-Type: application/json
Accept: application/json
```

Example:

```json
{
  "name": "Prepare launch checklist",
  "projectId": "PROJECT_ID",
  "plannedTime": 120
}
```

For a complete task request example, see [Create task](/api/v0/reference/operations/v0_post_tasks/).

## Response Format

API responses use JSON. Most successful responses are wrapped in a TeamGrid
response envelope:

```json
{
  "statusCode": 200,
  "status": "OK",
  "info": "Tasks",
  "data": []
}
```

List endpoints such as [List tasks](/api/v0/reference/operations/v0_get_tasks/) return an array in
`data`. Item endpoints such as [Get task](/api/v0/reference/operations/v0_get_tasks_id/) return a single
object in `data`. Some endpoints can return an empty response when no record is
found, depending on the endpoint.

Common response fields include:

* `_id`: TeamGrid document id
* `teamId`: team id assigned from the API token
* `createdAt`: creation timestamp
* `createdBy`: creator id
* `updatedAt`: last update timestamp
* `updatedBy`: last updater id

These fields are managed by TeamGrid. Treat them as read-only unless a specific
endpoint explicitly documents otherwise.

## Pagination Envelope

Paginated list responses include a `pagination` object:

```json
{
  "statusCode": 200,
  "status": "OK",
  "info": "Contacts",
  "data": [],
  "pagination": {
    "total": 41,
    "limit": 50,
    "page": 1,
    "pages": 1
  }
}
```

## Server-Assigned Fields

Do not use request bodies to choose the team for an operation. The API token
determines the team.

The following fields are generally server-managed:

* `_id`
* `teamId`
* `createdAt`
* `createdBy`
* `updatedAt`
* `updatedBy`

Some responses also include calculated fields such as `_details`, `_aggregated`,
or `_projectSharing`. These fields are useful for reading enriched TeamGrid
data, but they should not be treated as stable write inputs.

## Partial Updates

Update endpoints accept the fields that should be changed. You do not need to
send a full resource unless the endpoint documentation says so.

Example:

```json
{
  "completed": true
}
```

## Character Encoding

Use UTF-8 for request and response bodies.
