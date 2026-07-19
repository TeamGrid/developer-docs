---
title: Credentials and scopes
description: Authenticate API v1 with scoped TeamGrid service credentials and understand their tenant and region boundaries.
---

API v1 uses reveal-once service credentials with the `tg_sk_v1_` prefix. Send a credential in the `Authorization` header:

```http
Authorization: Bearer <credential>
```

## Security model

The credential prefix contains an untrusted routing hint. The target TeamGrid cell still verifies the complete credential, workspace, region, cell, audience, expiry, revocation state, workspace lock state, and required scopes.

- A credential belongs to exactly one workspace.
- Bearer requests are not redirected to another region.
- Revocation takes effect without changing other credentials.
- The secret cannot be revealed again after creation.
- Existing credentials remain visible by name and metadata so administrators can revoke them.

## Scopes

| Scope | Access |
| --- | --- |
| `workspace:read` | Workspace metadata |
| `projects:read` | Projects |
| `tasks:read`, `tasks:write` | Tasks and task metadata |
| `time-entries:read`, `time-entries:write` | Time entries |
| `contacts:read` | Contacts |
| `users:read` | Workspace users |
| `webhooks:read`, `webhooks:write` | Signed webhook registrations |
| `audit:read` | Developer Platform audit events |

`projects:write` and `contacts:write` are reserved for future API operations and are not issued during the current beta.

Choose the smallest scope set required by the integration. Use separate credentials for unrelated systems so each can be rotated and revoked independently.
