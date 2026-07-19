---
title: "Overview"
description: "Programmatic access to TeamGrid contacts, projects, tasks, time entries, webhooks, scheduled work, journal entries, and project templates."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Programmatic access to TeamGrid contacts, projects, tasks, time entries, webhooks, scheduled work, journal entries, and project templates.

The TeamGrid API provides programmatic access to the data in a TeamGrid team.
Use it to connect TeamGrid with reporting tools, import or synchronize contacts,
create projects and tasks, track time, register webhooks, and build operational
workflows around your TeamGrid workspace.

The API accepts JSON request bodies and returns JSON responses. All requests are
scoped to the team that owns the API token. A token cannot be used to read or
write data from another team.

## Base URL

```text
https://api.teamgrid.app
```

Use this URL as the canonical API base URL in new integrations. The legacy
`https://api.teamgridapp.com` host is also reachable for existing integrations,
but examples and generated reference snippets use `https://api.teamgrid.app`
consistently.

## Main Resources

The API is organized around the core TeamGrid work objects:

* [Teams](/api/v0/reference/operations/v0_get_teams/) and [users](/api/v0/reference/operations/v0_get_users/)
* [Contacts](/api/v0/reference/operations/v0_get_contacts/)
* [Projects](/api/v0/reference/operations/v0_get_projects/)
* [Tasks](/api/v0/reference/operations/v0_get_tasks/)
* [Time entries](/api/v0/reference/operations/v0_get_times/)
* [Services](/api/v0/reference/operations/v0_get_services/), [tags](/api/v0/reference/operations/v0_get_tags/), and [lists](/api/v0/reference/operations/v0_get_lists/)
* [Webhooks](/api/v0/reference/operations/v0_get_webhooks/)
* [Scheduled work](/api/v0/reference/operations/v0_get_scheduledwork/)
* [Project journal entries](/api/v0/reference/operations/v0_get_journalentries/)
* [Project templates](/api/v0/reference/operations/v0_get_projecttemplates/)

## Data Ownership

TeamGrid API tokens are team-specific. When you create or update records through
the API, TeamGrid determines the team from the token and applies that team scope
on the server. Do not send `teamId` to choose a team. Treat `teamId` in API
responses as read-only metadata.

## Recommended First Steps

1. Create an API token in TeamGrid.
2. Make a test request to [GET /teams](/api/v0/reference/operations/v0_get_teams/).
3. Retrieve [users](/api/v0/reference/operations/v0_get_users/) and [contacts](/api/v0/reference/operations/v0_get_contacts/).
4. Create a test [project](/api/v0/reference/operations/v0_post_projects/) or [task](/api/v0/reference/operations/v0_post_tasks/).
5. Register a [webhook](/api/v0/reference/operations/v0_post_webhooks/) in a test environment.
6. Use [Recipes](/api/v0/recipes/) for copyable integration sequences.

Keep production tokens secure. A TeamGrid API token grants broad access to the
team data exposed by the API.
