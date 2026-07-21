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

Before updating, completing, reopening, archiving, or restoring a task or project, read it and retain
the returned strong ETag. Project-template changes use the same pattern. These operations reject a
missing precondition with `428` and a stale revision with `412`; see [resource revisions and
concurrent writes](/api/v1/resource-concurrency/).
