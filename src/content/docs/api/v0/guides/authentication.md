---
title: "Authentication"
description: "Authenticate requests with team-specific TeamGrid API tokens and understand token scope."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Authenticate requests with team-specific TeamGrid API tokens and understand token scope.

TeamGrid authenticates API requests with team-specific API tokens.

Send the token as a Bearer token:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Example:

```sh
curl https://api.teamgrid.app/teams \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

Use [GET /teams](/api/v0/reference/operations/v0_get_teams/) as a simple authentication check. A
successful response confirms that the token is valid and shows which team the
token belongs to.

## Token Scope

Each API token belongs to exactly one TeamGrid team. The token determines which
team the request can access.

When you create, update, or delete data, TeamGrid applies the token team on the
server. Sending a different `teamId` in the request body or selector does not
move the operation to another team.

## Permissions

Treat API tokens as high-privilege team secrets. The current API token model is
team-scoped, not endpoint-scoped. A token should only be shared with systems
that are trusted to access the team data exposed by the API.

Recommended practices:

* Use separate tokens for separate integrations.
* Give each token a clear description in TeamGrid.
* Rotate tokens after vendor changes, employee offboarding, or suspected
  exposure.
* Do not embed tokens in frontend code, mobile apps, public repositories, or
  client-side configuration.
* Store production tokens in a secret manager.

## Failed Authentication

Requests can be rejected when:

* the token is missing
* the token is invalid
* the token belongs to a locked team
* the request is made with a malformed authorization header

Authentication failures return an error response and no team data.
