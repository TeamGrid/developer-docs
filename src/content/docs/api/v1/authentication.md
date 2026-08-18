---
title: Credentials and scopes
description: Authenticate API v1 with scoped TeamGrid service credentials and understand their tenant and region boundaries.
owner: Security
reviewedAt: 2026-08-18
---

API v1 accepts three reveal-once bearer credential formats:

| Credential | Prefix | Use it for |
| --- | --- | --- |
| Personal access token | `tg_pat_v2_` | A developer's local tools, scripts, or other user-owned workflows |
| Service-account credential | `tg_sa_v2_` | A deployed integration that must not depend on one person's account |
| Legacy API v1 credential | `tg_sk_v1_` | Existing integrations while they migrate to a native principal |

Send any of these credentials in the `Authorization` header:

```http
Authorization: Bearer <credential>
```

The prefix is only a routing hint. Personal tokens, service accounts, and legacy credentials have
different ownership, expiry, rotation, revocation, and resource-grant rules. Existing credentials
are never converted automatically. Delegated OAuth is not part of the current public contract.

## Choose a credential

Use a personal access token when a named TeamGrid member owns and supervises the workflow. Its
effective authority is the intersection of its scopes and that member's current workspace
permissions. Disabling the member or removing a permission narrows access immediately.

Use a service account for production services, shared automations, and integrations that must
continue when an employee changes roles or leaves the workspace. A workspace administrator owns
its lifecycle and can restrict it with scopes and resource grants independently of a human role.

Create credentials in **Settings → Team → Developer → Access**. The secret is shown once. Store it
directly in an operating-system keychain or secret manager; TeamGrid stores only a verifier.

For a local CLI, `teamgrid auth login` is the preferred personal-credential flow. It opens the
normal TeamGrid login, asks the user to choose a workspace and approve bounded scopes, and stores
the new credential in the operating-system credential store. The Developer Center labels it
**TeamGrid CLI** and shows its non-secret client and lifecycle metadata. The SDK never opens a
browser, and CI or unattended services must use service accounts.

Creating a personal token requires the `settings.api.personalCredentials` permission. Managing
service accounts requires `settings.api.serviceAccounts.manage`. An administrator with both
permissions can create a personal token first and then use the Developer Center, CLI, SDK, or API
to configure service accounts.

## Security model

The credential prefix contains an untrusted routing hint. The target TeamGrid cell still verifies the complete credential, workspace, region, cell, audience, expiry, revocation state, workspace lock state, and required scopes.

- A credential belongs to exactly one workspace.
- Bearer requests are not redirected to another region.
- Revocation takes effect without changing other credentials.
- The secret cannot be revealed again after creation.
- Personal-credential owners can identify and revoke their own credentials by non-secret metadata.
- Authorized administrators can view and manage service-account metadata without revealing secrets.
- Personal and service-account principals must be active at request time.
- The API and App cell must negotiate the exact code-owned 236-operation action-policy registry,
  including all 234 credential-authenticated operations,
  before the service is ready.

Every valid credential can inspect only its own safe metadata through `GET /v1/auth/context`. This
operation requires no additional scope and returns the exact credential ID, kind, status, scopes,
expiry, region, and cell; it never returns a verifier, secret fragment, owner PII, or unrelated
credential. `DELETE /v1/auth/context` permanently revokes exactly the authenticating credential.
Both responses use `Cache-Control: private, no-store`.

`teamgrid auth status --check` uses this endpoint to verify the server-side identity. Plain
`teamgrid auth logout` remains an offline-capable local cleanup. Use
`teamgrid auth logout --revoke` to revoke the selected credential first and remove its local
profile only after TeamGrid confirms revocation. The CLI refuses that mode while
`TEAMGRID_API_TOKEN` is set because an environment token would make the target ambiguous. Expired
or revoked credentials are replaced, not restored.

## API v0 legacy tokens

API v0 workspace tokens are separate legacy credentials and are accepted only by the v0 contract.
They are not personal credentials, service accounts, browser-login results, or valid API v1 bearer
credentials. Existing v0 integrations can continue during migration, but new automation should use
API v1 with a personal credential for local work or a service account for unattended workloads.

See [authentication by environment](/resources/authentication-by-environment/) for the exact local
desktop, remote terminal, container, MCP, SDK, and CI choices.

## Scopes

| Scope | Access |
| --- | --- |
| `workspace:read` | Workspace metadata, system capabilities, and workspace entitlements |
| `workspace-settings:read`, `workspace-settings:write` | Read or compare-and-set the six-field safe workspace-settings projection; sensitive administration scopes |
| `projects:read`, `projects:write` | Project reads and field mutations |
| `projects:lifecycle` | Complete, reopen, archive, restore, and inspect asynchronous project lifecycle operations |
| `projects:sharing` | Read and atomically replace project access-control entries; sensitive scope for human principals |
| `tasks:read`, `tasks:write` | Tasks and task metadata |
| `task-recurrences:read`, `task-recurrences:write`, `task-recurrences:run` | Read/manage recurring-task series and submit or recheck their bounded execution inputs; generated-task access also requires the matching task scope |
| `time-entries:read`, `time-entries:write` | Time entries |
| `time-entries:billing` | Read and compare-and-set billable state and billing rate; sensitive finance scope |
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
| `credentials:read`, `credentials:write` | List, create, rotate, and revoke personal-access credentials |
| `service-accounts:read`, `service-accounts:write` | Manage native service-account principals and their reveal-once credentials |
| `resource-grants:read`, `resource-grants:write` | Read or atomically replace a service account's bounded resource grants |
| `changes:read` | Read the durable, cursor-based change feed for authorized resource types |
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
