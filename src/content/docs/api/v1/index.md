---
title: API v1 overview
description: Use TeamGrid API v1 for scoped, cell-aware reads, writes, audit access, and signed webhooks.
---

API v1 is the recommended contract for new TeamGrid integrations. It uses regional ingress, scoped reveal-once credentials, cursor pagination, idempotent creates, consistent errors, and signed webhook deliveries. The `1.0.0-beta.2` controlled-beta contract contains 111 paths and 181 operations. This is interface coverage, not a claim that every TeamGrid product capability is already public or generally available.

## Base URL

The credential identifies its home region. Official clients derive the corresponding regional endpoint automatically:

```text
https://api.<region>.teamgrid.app/v1
```

During the controlled beta, German credentials use:

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

Projects, tasks, and project templates use the static Beta 2 contract: they do not expose developer
revision fields or accept a core `If-Match` precondition. Other resource families retain 31
endpoint-specific protected mutations. Review [resource concurrency in Beta 2](/api/v1/resource-concurrency/)
before building a writer.

For bounded mirrors, traverse the normal resource endpoints and use signed webhooks as delivery
signals. A durable [change feed is deliberately excluded from the first public beta](/api/v1/change-feed/).

[Review resource and security semantics](/api/v1/resources-and-semantics/) before implementing finance, lifecycle, custom-field, administration, export, automation, or webhook-observability workflows.

## Next steps

1. [Create and protect a scoped credential](/api/v1/authentication/).
2. [Run the quickstart](/api/v1/quickstart/).
3. Negotiate [capabilities, entitlements, events, and safe settings](/api/v1/platform-control-plane/).
4. Choose the [SDK](/sdk/) or [CLI](/cli/) if it fits your runtime.
5. Review [resources and semantics](/api/v1/resources-and-semantics/), [resource concurrency](/api/v1/resource-concurrency/), and [pagination and idempotency](/api/v1/pagination/) before implementing synchronization or writes.
