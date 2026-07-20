---
title: Credentials and scopes
description: Authenticate API v1 with scoped TeamGrid service credentials and understand their tenant and region boundaries.
---

API v1 uses reveal-once service credentials with the `tg_sk_v1_` prefix. Send a credential in the `Authorization` header:

```http
Authorization: Bearer <credential>
```

The current `tg_sk_v1_` credential is the controlled-beta credential format and remains bound to
the existing workspace authorization path. It is not a native autonomous service account. Native
personal-access credentials, service accounts, and delegated OAuth use separate principal models
and stay unavailable until their cell-local rollout gates are qualified. Existing credentials are
not converted automatically.

## Security model

The credential prefix contains an untrusted routing hint. The target TeamGrid cell still verifies the complete credential, workspace, region, cell, audience, expiry, revocation state, workspace lock state, and required scopes.

- A credential belongs to exactly one workspace.
- Bearer requests are not redirected to another region.
- Revocation takes effect without changing other credentials.
- The secret cannot be revealed again after creation.
- Existing credentials remain visible by name and metadata so administrators can revoke them.
- The API and App cell must negotiate the exact code-owned 182-operation action-policy registry
  before the service is ready.

## Scopes

| Scope | Access |
| --- | --- |
| `workspace:read` | Workspace metadata, system capabilities, and workspace entitlements |
| `workspace-settings:read`, `workspace-settings:write` | Read or compare-and-set the six-field safe workspace-settings projection; sensitive administration scopes |
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
| `custom-field-values:read`, `custom-field-values:write` | Values on supported resources; also requires the corresponding target-resource read/write scope |
| `project-templates:read`, `project-templates:write` | Template metadata and lifecycle; instantiation additionally requires `projects:write` |
| `planned-work:read`, `planned-work:write` | Sensitive workload windows and atomic task-schedule replacement |
| `appointments:read`, `appointments:write` | Appointments inside the credential's normal acting-user boundary |
| `appointments:delegated:read`, `appointments:delegated:write` | Read or write another member's appointments; sensitive overlay with sharing and product-permission checks |
| `absences:read`, `absences:write` | Absences inside the credential's normal acting-user boundary |
| `absences:delegated:read` | Read another member's absences; sensitive delegated overlay |
| `absences:admin:write` | Create or change another member's absences; sensitive administrative overlay |
| `availability:read` | Derived availability inside the normal acting-user boundary |
| `availability:delegated:read` | Derived availability for another member; sensitive overlay with sharing and product-permission checks |
| `activity:read` | Target activity; also requires the matching contact, project, or task read scope |
| `comments:read`, `comments:write` | Target comments; also requires the matching contact, project, or task read scope |
| `documents:read`, `documents:write` | Bounded document content and lifecycle |
| `files:read`, `files:write` | File metadata, lifecycle, and short-lived private transfer intents |
| `products:read`, `products:write` | Product catalog excluding acquisition cost |
| `products:finance:read`, `products:finance:write` | Reveal or mutate product `purchasePrice`; grant only in addition to the matching product scope |
| `product-groups:read`, `product-groups:write` | Hierarchical product groups |
| `project-statements:read`, `project-statements:write` | Non-budget project statements excluding acquisition cost |
| `project-statements:finance:read`, `project-statements:finance:write` | Read budget statements or reveal/mutate statement `purchasePrice`; grant only in addition to the matching statement scope |
| `members:read`, `members:write` | Workspace membership and role assignment; sensitive administration scopes |
| `members:pii:read` | Reveal member or invitation PII when paired with the relevant base read scope |
| `invitations:read`, `invitations:write` | Pending invitation lifecycle; sensitive administration scopes |
| `roles:read`, `roles:write` | Workspace role and permission configuration; sensitive administration scopes |
| `groups:read`, `groups:write` | Workspace groups and membership; sensitive administration scopes |
| `search:read` | Federated search; also requires every requested resource-domain read scope |
| `exports:read`, `exports:write` | Bounded export jobs and header-capability downloads; sensitive scopes with resource-domain checks |
| `automations:read`, `automations:write` | Automation action metadata, definitions, versions, and runs; writes also require scopes implied by the flow |
| `automations:run` | Abort a running automation; sensitive execution-control scope |
| `integrations:read` | Installation status without provider secrets; sensitive scope |
| `changes:read` | Cell-local, metadata-only change events for resumable synchronization |
| `events:read` | Read the authorization-filtered event and channel catalog |
| `webhooks:read`, `webhooks:write` | Signed webhook registrations; read also covers delivery history owned by this exact service credential |
| `audit:read` | Developer Platform audit events |

Choose the smallest scope set required by the integration. Finance scopes are overlays: they do not
grant base resource access by themselves. Without `products:finance:read`, `purchasePrice` is omitted
from product responses. Without `project-statements:finance:read`, budget statements are excluded and
`purchasePrice` is omitted. Writes that supply `purchasePrice` require the corresponding finance write
scope.

A `services:read` credential can read service billing rates. Calendar and absence data, comments,
documents, files, workspace settings, member PII, administration, exports, automation metadata, integration status, call
notes, contacts, users, audit events, finance resources, and webhook delivery metadata can also
contain sensitive information. Use separate credentials for unrelated systems so each can be
rotated and revoked independently.
