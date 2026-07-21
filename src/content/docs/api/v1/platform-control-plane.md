---
title: Platform discovery and settings
description: Negotiate TeamGrid capabilities, workspace entitlements, event channels, and safe revisioned workspace defaults.
---

The API exposes a small control plane so an integration can discover what its credential can use
without reading billing internals, raw feature flags, roles, provider configuration, or secrets.
Every result is calculated in the workspace's owning cell and reflects the current credential,
scopes, product entitlement, and workspace lock state.

| Resource | Endpoint | Scope | Purpose |
| --- | --- | --- | --- |
| System capabilities | `GET /v1/system/capabilities` | `workspace:read` | Compare product entitlement with this credential's accessible domains |
| Workspace entitlements | `GET /v1/workspace/entitlements` | `workspace:read` | Read stable, secret-free product availability identifiers |
| Workspace settings | `GET /v1/workspace/settings` | `workspace-settings:read` | Read six safe workspace defaults and their `wst1` revision |
| Event catalog | `GET /v1/events/catalog` | `events:read` | List only webhook and change-feed events this credential can consume |

## Capabilities and entitlements

A system capability has two independent booleans:

- `entitled` says the workspace's current product configuration permits the capability.
- `accessible` says the capability is entitled **and** the credential has a relevant domain scope.

Workspace entitlements are a plan-level, secret-free projection. Identifiers are stable public
contract names, not internal plan names. Do not cache either response as permanent authorization:
TeamGrid re-evaluates scopes, entitlement, credential state, and workspace state on every domain
request.

SDK and CLI equivalents are `client.system.getCapabilities()`,
`client.workspace.getEntitlements()`, `teamgrid system capabilities`, and
`teamgrid workspace entitlements`.

## Safe workspace settings

The settings resource contains only:

- `name`;
- `currency`;
- `defaultLanguage`;
- `defaultPlannedTime`;
- `defaultProductivity`; and
- `defaultShowInScheduling`.

Read the resource and retain its strong `ETag`. Patch a non-empty subset with that ETag and a stable
idempotency key:

```bash
curl --request PATCH \
  --url https://api.de.teamgrid.app/v1/workspace/settings \
  --header 'Authorization: Bearer <credential>' \
  --header 'Content-Type: application/json' \
  --header 'If-Match: "wst1-<64 hex characters>"' \
  --header 'Idempotency-Key: workspace-defaults-2026-07' \
  --data '{"defaultLanguage":"en","defaultShowInScheduling":true}'
```

The owning cell compares the complete safe snapshot atomically. A stale revision returns `412`; a
missing precondition returns `428`. The operation record is cell-local and makes a retry recoverable
even when the settings mutation committed before audit persistence completed. Replaying the same
key and request returns the completed result; reusing the key for different settings conflicts.

The credential issuer must still be an active workspace member with permission to manage general
settings when the write executes. This extra administrative recheck applies to the settings write,
not to ordinary workspace-wide service-credential reads.

Use `client.workspaceSettings.get()` and `client.workspaceSettings.update(...)`, or
`teamgrid workspace-settings get|update`. These operations are forbidden through MCP.

## Authorization-filtered event catalog

The event catalog is not a global list. Webhook definitions appear only when the credential holds
their required resource scope. Change-feed definitions additionally require `changes:read` and the
matching resource read scope. Each item reports its channel and required scopes; change-feed items
also report the resource type and `created`, `updated`, or `deleted` operation.

Use the catalog to configure an integration UI, then follow the [change-feed recovery
contract](/api/v1/change-feed/) or [signed webhook verification flow](/api/v1/webhooks/). The SDK and
CLI equivalents are `client.events.getCatalog()` and `teamgrid events catalog`. Event catalog access
does not grant access to any event or resource by itself.
