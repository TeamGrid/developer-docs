---
title: API v1 overview
description: Use TeamGrid API v1 for scoped, cell-aware reads, writes, audit access, and signed webhooks.
owner: Developer Platform
reviewedAt: 2026-07-29
---

API v1 is the stable, recommended contract for new TeamGrid integrations. It uses regional ingress, scoped reveal-once credentials, cursor pagination, idempotent creates, consistent errors, strong write preconditions, and signed webhook deliveries. Version `1.0.0` contains 128 paths and 206 operations. This is interface coverage, not a claim that every TeamGrid product capability is public.

## Base URL

The credential identifies its home region. Official clients derive the corresponding regional endpoint automatically:

```text
https://api.<region>.teamgrid.app/v1
```

German credentials use:

```text
https://api.de.teamgrid.app/v1
```

Do not send a bearer credential through a cross-region redirect. The target cell authenticates the full credential and rejects a region or cell mismatch.

## Available resources

API v1 currently provides capability discovery, workspace entitlements and safe workspace settings;
workspace and administration resources; projects, tasks, time entries,
planned work, appointments, absences, and availability; contacts, comments, activity, documents,
files, call notes, and contact groups; product and project-statement resources; federated search and
bounded export jobs; automation definitions, action metadata, runs, and integration-installation
status; plus audit, an authorization-filtered webhook event catalog, webhook, secret-rotation,
and credential-owned asynchronous-operation resources.

Most mutable resources use explicit domain operations instead of a generic database mutation endpoint. Project completion, reopen, archive, and restore are asynchronous lifecycle operations with a separately readable operation resource. Task and time-entry transitions remain synchronous domain commands. Product acquisition cost and project-statement finance data require additional finance scopes. Webhook delivery history is readable only for deliveries owned by the authenticated service credential.

Projects, project sharing, tasks, and project templates expose developer revisions and require strong
`If-Match` preconditions for their 18 mutating operations. Another 34 protected operations retain
domain-specific revision formats. Review [resource concurrency](/api/v1/resource-concurrency/)
before building a writer.

For durable mirrors, create an initial resource snapshot and continue from the matching
[change-feed checkpoint](/api/v1/change-feed/). Signed webhooks remain useful delivery signals but
are not a replayable history.

[Review resource and security semantics](/api/v1/resources-and-semantics/) before implementing finance, lifecycle, custom-field, administration, export, automation, or webhook-observability workflows.

## Next steps

1. [Create and protect a scoped credential](/api/v1/authentication/).
2. [Run the quickstart](/api/v1/quickstart/).
3. Negotiate [capabilities, entitlements, events, and safe settings](/api/v1/platform-control-plane/).
4. Choose the [SDK](/sdk/) or [CLI](/cli/) if it fits your runtime.
5. Review [resources and semantics](/api/v1/resources-and-semantics/), [resource concurrency](/api/v1/resource-concurrency/), and [pagination and idempotency](/api/v1/pagination/) before implementing synchronization or writes.
