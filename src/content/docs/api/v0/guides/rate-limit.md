---
title: "Errors and Rate Limits"
description: "Handle TeamGrid API status codes, rate limits, retries, and non-idempotent create requests."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Handle TeamGrid API status codes, rate limits, retries, and non-idempotent create requests.

The TeamGrid API returns HTTP status codes to indicate whether a request
succeeded.

## Common Status Codes

`200 OK`

The request succeeded and returned data.

`201 Created`

A resource was created.

`204 No Content`

The request succeeded and there is no response body.

`400 Bad Request`

The request body, selector, or parameters are invalid.

`401 Unauthorized`

The API token is missing, malformed, or invalid. Check the `Authorization:
Bearer YOUR_API_TOKEN` header and verify the token with
[GET /teams](/api/v0/reference/operations/v0_get_teams/).

`403 Forbidden`

The API token belongs to a locked team or cannot perform the requested
operation.

`404 Not Found`

The requested resource or route does not exist.

`429 Too Many Requests`

The rate limit was exceeded.

`5xx`

The request reached TeamGrid, but the server could not complete it.

## Rate Limit

The documented API rate limit is:

```text
100 requests per minute per API token and URL path
```

When building an integration, assume requests can be rate limited and implement
retry behavior with backoff.

Recommended retry strategy:

* Retry `429` responses after a delay.
* If the response includes a `Retry-After` header, wait at least that long
  before sending the next request.
* If no retry header is present, use exponential backoff with jitter instead of
  retrying immediately.
* Retry transient `5xx` responses with exponential backoff.
* Do not retry `400` responses without changing the request.
* Do not retry `401` or `403` responses without checking the token and team
  state.

Use [GET /teams](/api/v0/reference/operations/v0_get_teams/) to verify a token after configuration or
rotation.

## Idempotency

Create endpoints are not documented as idempotent. If your integration retries a
create request after a timeout, it may create a duplicate record.

Recommended approach:

* Store TeamGrid ids returned by successful create requests.
* Use update endpoints for follow-up changes.
* Add your own external reference fields only where the endpoint and data model
  support them.
