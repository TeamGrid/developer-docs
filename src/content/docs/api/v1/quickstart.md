---
title: API v1 quickstart
description: Create a TeamGrid API v1 credential and make the first workspace and task requests.
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

## 3. List tasks

```bash
curl --fail-with-body \
  --header "Authorization: Bearer $TEAMGRID_API_TOKEN" \
  --header 'Accept: application/json' \
  'https://api.de.teamgrid.app/v1/tasks?limit=25'
```

Use `meta.page.nextCursor` to request the next page. Treat cursors as opaque strings.

## 4. Prefer an official client when possible

For Node.js applications, continue with the [TypeScript SDK quickstart](/sdk/quickstart/). For shell scripts or local operation, use the [CLI](/cli/install-and-authenticate/).

Task, project, and project-template mutations use the static Beta 2 contract and do not accept a
core `If-Match` precondition. Other resource families retain explicit read-before-write revisions;
see [resource concurrency in Beta 2](/api/v1/resource-concurrency/) before adding writes.
