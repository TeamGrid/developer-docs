---
title: Workspace administration
description: Manage members, invitations, roles, and groups with explicit PII overlays and strong revisions.
---

The administration resources are intended for tightly controlled workspace-management services.
They do not expose a generic permission bypass.

| Resource | Operations | Base scopes |
| --- | --- | --- |
| Members | List, get, change role, remove | `members:read`, `members:write` |
| Invitations | List, get, create, resend, cancel | `invitations:read`, `invitations:write` |
| Roles | List, get, create, update, delete | `roles:read`, `roles:write` |
| Groups | List, get, create, update, delete | `groups:read`, `groups:write` |

## PII is a separate grant

Member and invitation responses omit names, email addresses, positions, and contact identifiers by
default. A caller needs the relevant base read scope **and** `members:pii:read` to request those
fields. The PII overlay does not grant member or invitation access on its own.

Use separate credentials for administration and operational data access. Administration scopes are
marked sensitive in the canonical scope contract and all administration operations are forbidden in
every MCP profile.

## Safe mutations

Invitation, role, and group creates accept `Idempotency-Key`; invitation resend also uses a stable
idempotency key. Member-role changes and role or group updates require the latest strong `adm1`
revision in `If-Match`. A `412` means the authorization state changed and must be reviewed before a
retry.

Removing a member or deleting a role or group is an explicit destructive operation. The API still
applies workspace permissions and invariants such as valid role references; possession of a scope is
not a substitute for those checks.
