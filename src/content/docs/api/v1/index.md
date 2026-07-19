---
title: API v1 overview
description: Use TeamGrid API v1 for scoped, cell-aware reads, writes, audit access, and signed webhooks.
---

API v1 is the recommended contract for new TeamGrid integrations. It uses regional ingress, scoped reveal-once credentials, cursor pagination, idempotent creates, consistent errors, and signed webhook deliveries. The current controlled-beta contract contains 52 paths and 90 operations. This is interface coverage, not a claim that every TeamGrid product capability is already public.

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

API v1 currently provides workspace, product, product-group, project, project-statement, task, time-entry, call-note, contact, contact-group, user, list, service, tag, custom-field-definition, audit-event, webhook, and webhook-delivery resources.

Most mutable resources use explicit domain operations instead of a generic database mutation endpoint. Project completion, reopen, archive, and restore are asynchronous lifecycle operations with a separately readable operation resource. Task and time-entry transitions remain synchronous domain commands. Product acquisition cost and project-statement finance data require additional finance scopes. Webhook delivery history is readable only for deliveries owned by the authenticated service credential.

[Review resource and security semantics](/api/v1/resources-and-semantics/) before implementing finance, lifecycle, custom-field, or webhook-observability workflows.

## Next steps

1. [Create and protect a scoped credential](/api/v1/authentication/).
2. [Run the quickstart](/api/v1/quickstart/).
3. Choose the [SDK](/sdk/) or [CLI](/cli/) if it fits your runtime.
4. Review [resources and semantics](/api/v1/resources-and-semantics/) and [pagination and idempotency](/api/v1/pagination/) before implementing synchronization or writes.
