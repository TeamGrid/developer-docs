---
title: API v1 overview
description: Use TeamGrid API v1 for scoped, cell-aware reads, writes, audit access, and signed webhooks.
---

API v1 is the recommended contract for new TeamGrid integrations. It uses regional ingress, scoped reveal-once credentials, cursor pagination, idempotent creates, consistent errors, and signed webhook deliveries.

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

API v1 currently provides workspace, project, task, time-entry, contact, user, list, service, tag, audit-event, and webhook resources. Writes are intentionally limited to tasks, time entries, and signed webhooks.

## Next steps

1. [Create and protect a scoped credential](/api/v1/authentication/).
2. [Run the quickstart](/api/v1/quickstart/).
3. Choose the [SDK](/sdk/) or [CLI](/cli/) if it fits your runtime.
4. Review [pagination and idempotency](/api/v1/pagination/) before implementing synchronization or writes.
