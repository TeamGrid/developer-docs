---
title: Change feed status
description: Understand why the change feed is excluded from the first public API v1 beta contract.
---

The change feed is not part of the `1.0.0-beta.2` public contract. `changes:read` cannot be issued,
and `GET /v1/changes` is not a supported beta operation. It is therefore absent from OpenAPI, the
TypeScript SDK, the CLI, and the cross-interface capability ledger. MCP does not expose it either.

This boundary is deliberate. A durable synchronization feed must preserve an unambiguous
workspace and resource identity across rapid updates, ownership changes, deletes, restarts,
retention compaction, and cell failover. The current capture implementation has not completed that
preimage and recovery qualification, so TeamGrid does not advertise a weaker contract as ready.

## Supported beta alternatives

Use the normal cursor-paginated resource endpoints for bounded imports and reconciliation. Persist
the resource IDs and revisions returned by those endpoints, and repeat a traversal from the
beginning when your filter set or reconciliation boundary changes.

Use [signed webhooks](/api/v1/webhooks/) for supported event-driven workflows. A webhook is a
delivery signal rather than a complete history: verify its signature, process it idempotently, and
read the current resource through its independently scoped API endpoint when the workflow needs
authoritative state.

Do not approximate a change feed through audit events, webhook-delivery history, search results, or
aggressive polling. Those resources have different authorization, retention, and ordering
semantics. Keep polling bounded and respect the documented rate-limit headers.

## Future qualification

A later contract checkpoint may add a change feed after TeamGrid has qualified immutable event
ownership, insert/update/delete semantics, resume and reset behavior, retention, multi-cell
boundaries, and complete recovery tests. That release will use a new contract and package version;
clients should not reserve or request `changes:read` in advance.
