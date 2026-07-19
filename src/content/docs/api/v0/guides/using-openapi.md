---
title: "Using the OpenAPI File"
description: "Use the TeamGrid OpenAPI definition with API tools, generated clients, bearer authentication, request schemas, and response envelopes."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Use the TeamGrid OpenAPI definition with API tools, generated clients, bearer authentication, request schemas, and response envelopes.

The TeamGrid API Reference is generated from an OpenAPI 3.1 definition. Use the
specification as the contract for endpoint paths, request bodies, response
schemas, authentication, and generated examples.

## Server And Authentication

The canonical API server is:

```text
https://api.teamgrid.app
```

Every operation uses bearer token authentication:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Use [GET /teams](/api/v0/reference/operations/v0_get_teams/) as a lightweight token check after setting
up a new environment.

## Import Into API Tools

Use the OpenAPI definition behind the TeamGrid API Reference when configuring
API tooling such as Postman, Insomnia, Stoplight, or generated clients.

Recommended import settings:

| Setting         | Value                      |
| --------------- | -------------------------- |
| OpenAPI version | 3.1                        |
| Server URL      | `https://api.teamgrid.app` |
| Authentication  | HTTP bearer token          |
| Token variable  | `TEAMGRID_API_TOKEN`       |
| Content type    | `application/json`         |

After import, set the bearer token once at the collection or environment level.
Do not paste production tokens into generated code or committed files.

## Generate A Client

OpenAPI client generators can be useful for typed request and response models,
but keep generated clients thin. TeamGrid integrations should still handle:

* pagination on list endpoints
* `401`, `403`, `429`, and transient `5xx` responses
* nullable or missing optional fields
* newly added response fields
* idempotency in retry logic for create requests

For example, a generated TypeScript client should wrap request calls with your
own retry, logging, and token-rotation behavior instead of exposing generated
methods directly throughout the application.

## Request Schemas

Create and update operations use request-specific schemas such as
`CreateTaskRequest` and `UpdateProjectRequest`. These schemas intentionally
exclude server-managed fields like `_id`, `teamId`, `createdAt`, and
`updatedAt`.

Use response schemas such as `Task`, `Project`, and `TimeEntry` for data you
read back from TeamGrid. Do not send read-only response fields back as write
input unless a request schema explicitly includes them.

`PUT /services`, `DELETE /services`, `PUT /tags`, and `DELETE /tags` are legacy
mutation endpoints without an id parameter in the URL. Their request schemas
therefore include `_id` in the JSON body to identify the resource.

## Response Envelopes

Successful JSON responses use the TeamGrid response envelope:

```json
{
  "statusCode": 200,
  "status": "success",
  "info": "OK",
  "data": {}
}
```

List endpoints also include `pagination`. See
[Pagination and Filtering](/api/v0/guides/pagination/) for paging and filter behavior.

Single-resource `GET` endpoints return a single object in `data`. Collection
`GET` endpoints return an array in `data` and include `pagination`. `204 No
Content` responses do not include a JSON body.

## Error Handling

The OpenAPI definition documents common error responses:

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| `400`  | Invalid request body, selector, or parameters.           |
| `401`  | Missing or invalid API token.                            |
| `403`  | Locked team or operation not allowed for the token team. |
| `429`  | Rate limit exceeded.                                     |

See [Errors and Rate Limits](/api/v0/guides/rate-limit/) before running a production
integration.
