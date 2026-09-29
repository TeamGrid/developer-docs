---
title: MCP release candidate
description: Implemented MCP extensions, OAuth and qualification status before public release.
owner: Developer Platform
reviewedAt: 2026-09-29
---

The 1.2.2 package candidate is **not published**. The public release remains 1.2.1
with four read-only profiles. No public hosted TeamGrid MCP endpoint is released.
This page describes implemented candidate behavior and its remaining release checks.

## Tools and results

The candidate reviews all 238 API operations and exposes **208 business tools:
84 reads and 124 writes**. Existing `core`, `collaboration`, `governance` and `all`
profiles preserve their read-only meaning. `context`, `work`, `full` and eleven
business-domain profiles provide explicit selection. A profile grants no permission.
Every call retains current workspace, role, scope, sharing and lock checks.

Discovery is paginated. Outputs use concrete validated schemas. Mutations return
small receipts and distinguish completion, accepted asynchronous work, partial
failure and uncertain results. Uncertain writes are not automatically replayed.
Core CAS writes require server enforcement and fresh revisions; configuration and
syntax alone do not qualify the live write path.

Large documents support bounded revision-bound sections. File/export lookup can
return a private resource URI; `resources/read` delivers at most 1 MiB and checks
current access again. Transfer URLs and intent credentials stay internal. The
local CLI can download files up to 50 MiB to a new local file. Uploads continue
through the existing App/CLI/SDK transfer path. A separate CLI login does not gain
ownership of an export created by a remote OAuth connection.

## OAuth and browser login

The regional provider implements OAuth authorization code with mandatory PKCE S256,
resource binding, explicit workspace consent, short access tokens, rotating refresh
tokens, replay detection and connection revocation. Public and registered confidential
clients are supported. Optional Client ID Metadata Documents require operator-approved
HTTPS origins; arbitrary dynamic registration is not offered.

Central login hands off to the chosen workspace before regional consent. Sensitive
CLI/OAuth scopes require an additional passkey confirmation bound to the account,
session, workspace, client and exact request. Initial remote consent is minimal;
extra scope challenges are derived from the requested business operation. Roles
and workspace restrictions cannot be bypassed by requesting more OAuth scopes.

The MCP access token is accepted only at its resource. The provider creates a
separate short API delegation, rechecked against current authority. Connected
applications can be inspected and disconnected without exposing token values.

## Release status

Local API, SDK/CLI/MCP, real MongoDB transaction and hosted-container checks are
available. Live browser/passkey/cross-region qualification, real client and write
scenarios, hosted routing through the governed release pipeline, independent
reviews and publication remain required. Production activation stays closed until
those checks pass. No new endpoint URL should be configured from this candidate page.

The implementation is tracked in [SDK/MCP pull request 53](https://github.com/TeamGrid/developer-platform/pull/53),
[App pull request 3028](https://github.com/TeamGrid/teamgrid/pull/3028) and
[API pull request 174](https://github.com/TeamGrid/teamgrid-api/pull/174).
