---
title: API v1 quickstart
description: Create a TeamGrid API v1 credential and make the first workspace and task requests.
owner: Developer Experience
reviewedAt: 2026-07-29
---

## 1. Create a credential

In TeamGrid, open **Settings → Team → Developer**, choose API v1, select the minimum required scopes, and create a credential.

The secret is shown once. Store it in an OS keychain or secret manager. Do not place it in source control, command history, URLs, or logs.

## 2. Verify the workspace

Set the credential only for the current process and call the regional endpoint encoded by the credential:

```bash
export TEAMGRID_API_TOKEN='your-reveal-once-credential'

curl --fail-with-body \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header 'Accept: application/json' \
  https://api.de.teamgrid.app/v1/workspace
```

The response identifies the authenticated workspace and its region and cell. A credential never selects another workspace through a request parameter.

```json
{
  "data": {
    "type": "workspace",
    "id": "exampleWorkspaceId",
    "attributes": {
      "name": "Example workspace",
      "region": "de",
      "cellId": "de-nbg-001"
    }
  },
  "meta": {
    "requestId": "req_example"
  }
}
```

The exact attribute set follows the [workspace operation](/api/v1/reference/operations/getworkspace/).
Persist resource identifiers, but do not infer routing or permissions from their format.

## 3. List tasks

```bash
curl --fail-with-body \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header 'Accept: application/json' \
  'https://api.de.teamgrid.app/v1/tasks?limit=25'
```

Use `meta.page.nextCursor` to request the next page. Treat cursors as opaque strings.

```json
{
  "data": [
    {
      "type": "task",
      "id": "exampleTaskId",
      "attributes": {
        "title": "Prepare integration rollout",
        "completed": false,
        "archived": false
      }
    }
  ],
  "meta": {
    "requestId": "req_example",
    "page": {
      "limit": 25,
      "nextCursor": null
    }
  }
}
```

## 4. Diagnose the first request

| Result | Meaning | Next step |
| --- | --- | --- |
| `200` | The credential and regional endpoint are correct | Continue with the required resource scopes |
| `401 invalid_token` | The credential is missing, malformed, expired, or revoked | Re-copy the reveal-once value or create a replacement |
| `403 insufficient_scope` | The credential lacks a scope required by the operation | Add only the required scope through a new credential |
| `404` from the host | The path or regional hostname is incorrect | Verify the `/v1` prefix and the credential's region |
| `429` | The current rate-limit bucket is exhausted | Respect `Retry-After` before retrying |

For every support case, retain `meta.requestId`, the timestamp, HTTP status, and regional hostname.
Never record the bearer credential itself. Continue with the
[request troubleshooting guide](/resources/troubleshooting/) if workspace discovery fails.

## 5. Prefer an official client when possible

For Node.js applications, continue with the [TypeScript SDK quickstart](/sdk/quickstart/). For shell scripts or local operation, use the [CLI](/cli/install-and-authenticate/).

Task, project, and project-template mutations require the latest strong ETag through `If-Match`.
Other protected resource families retain their own explicit revision formats; see
[resource concurrency](/api/v1/resource-concurrency/) before adding writes.
