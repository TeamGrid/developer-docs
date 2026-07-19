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
| `projects:read`, `projects:write` | Project reads and field mutations |
| `projects:lifecycle` | Complete, reopen, archive, restore, and inspect asynchronous project lifecycle operations |
| `tasks:read`, `tasks:write` | Tasks and task metadata |
| `time-entries:read`, `time-entries:write` | Time entries |
| `contacts:read`, `contacts:write` | Contacts |
| `call-notes:read`, `call-notes:write` | Plain-text call notes and their archive lifecycle |
| `contact-groups:read`, `contact-groups:write` | Hierarchical contact groups |
| `users:read` | Workspace users |
| `lists:read`, `lists:write` | Project and task lists |
| `services:read`, `services:write` | Services and their billing configuration |
| `tags:read`, `tags:write` | Tags |
| `custom-field-definitions:read`, `custom-field-definitions:write` | Custom-field schemas, configuration, and lifecycle; not values on resources |
| `products:read`, `products:write` | Product catalog excluding acquisition cost |
| `products:finance:read`, `products:finance:write` | Reveal or mutate product `purchasePrice`; grant only in addition to the matching product scope |
| `product-groups:read`, `product-groups:write` | Hierarchical product groups |
| `project-statements:read`, `project-statements:write` | Non-budget project statements excluding acquisition cost |
| `project-statements:finance:read`, `project-statements:finance:write` | Read budget statements or reveal/mutate statement `purchasePrice`; grant only in addition to the matching statement scope |
| `webhooks:read`, `webhooks:write` | Signed webhook registrations; read also covers delivery history owned by this exact service credential |
| `audit:read` | Developer Platform audit events |

Choose the smallest scope set required by the integration. Finance scopes are overlays: they do not
grant base resource access by themselves. Without `products:finance:read`, `purchasePrice` is omitted
from product responses. Without `project-statements:finance:read`, budget statements are excluded and
`purchasePrice` is omitted. Writes that supply `purchasePrice` require the corresponding finance write
scope.

A `services:read` credential can read service billing rates. Call notes, contacts, users, audit
events, finance resources, and webhook delivery metadata can also contain sensitive information. Use
separate credentials for unrelated systems so each can be rotated and revoked independently.
