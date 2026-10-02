---
title: MCP release status
description: Production availability, OAuth, tools and the exact release acceptance for TeamGrid MCP 1.2.2.
owner: Developer Platform
reviewedAt: 2026-10-01
---

Version **1.2.2** is the stable SDK, CLI and MCP release. Hosted MCP and CLI
browser login are enabled in Production DE and US for all eligible workspaces.
Each user still needs workspace membership, current permissions and explicit
consent for the requested scopes.

## Hosted connection

Use the endpoint for the workspace's owning region:

| Region | MCP resource |
| --- | --- |
| Germany / DE | `https://mcp-de.teamgrid.app/mcp` |
| United States / US | `https://mcp-us.teamgrid.app/mcp` |

In ChatGPT, create an MCP connection with the exact HTTPS resource and OAuth
authentication. Sign in to TeamGrid, select one workspace and review the access
request. Sensitive permissions require a personal Passkey confirmation. Disconnect
the connection in TeamGrid to revoke its token family. A local CLI/API token is
not a credential for the hosted MCP resource.

TeamGrid permits the exact ChatGPT client metadata origin and uses public-client
authentication `none` with mandatory PKCE S256 when advertised by the client.
It does not claim support for `private_key_jwt` client assertions or arbitrary
dynamic client registration. See OpenAI's [MCP authentication guidance](https://developers.openai.com/api/docs/mcp#handle-authentication).

## Tools and results

The server reviews all 238 API operations and exposes **208 business tools:
84 reads and 124 writes**. Existing `core`, `collaboration`, `governance` and `all`
profiles preserve their read-only meaning. `context`, `work`, `full` and eleven
business-domain profiles provide explicit selection. A profile grants no permission.
Every call retains current workspace, role, scope, sharing, lock and cell checks.

Discovery is paginated. Outputs use concrete validated schemas. Mutations return
small receipts and distinguish completion, accepted asynchronous work, partial
failure and uncertain results. Uncertain writes are not automatically replayed.
Core CAS writes require server enforcement and fresh revisions; both Production
regions have the required gates enforced.

Large documents support bounded revision-bound sections. Private resource reads
deliver at most 1 MiB and recheck current access. Transfer URLs and intent credentials
stay internal. Local CLI downloads support up to 50 MiB to a new local file. Uploads
continue through the App/CLI/SDK transfer path. A separate CLI login does not acquire
ownership of an export created by a remote OAuth connection.

## OAuth and browser login

The regional provider implements authorization code with PKCE S256, exact resource
binding, workspace consent, short access tokens, rotating refresh tokens, replay
detection and connection revocation. Central login hands off to the chosen workspace
before regional consent. Personal Passkey confirmation is bound to the account,
session, workspace, client and exact sensitive request.

The MCP access token is accepted only at its resource. The provider creates a
separate short API delegation, rechecked against current authority. Connected
applications can be inspected and disconnected without revealing token values.

## Release acceptance

The release owner accepted this exact deployed release on 2 October 2026 and
waived additional functional exercises. Genuine [Staging evidence](https://github.com/TeamGrid/teamgrid/actions/runs/36922712358)
records OAuth/PKCE, refresh rotation and replay denial, revocation, tool discovery,
authorized reads and writes, stale-revision rejection, read-only write denial,
cross-workspace denial and cleanup. The same immutable runtime was deployed to DE
and US. The waiver does not relabel unexecuted regional or ChatGPT client exercises
as passing tests.

Real desktop credential-storage acceptance was performed on macOS. Windows and
Linux retain source and installation compatibility; no real desktop acceptance
is claimed for those platforms. The compatibility catalog remains in `dual` mode;
that preserves prior bindings while making the current operations available.
