---
title: Authentication by environment
description: Choose the correct TeamGrid credential and sign-in method for a desktop, remote terminal, container, SDK, MCP host, or CI job.
owner: Security
reviewedAt: 2026-07-31
---

TeamGrid deliberately separates interactive access from unattended automation. A developer working
locally should use a personal credential tied to their own membership. A deployed process should use
a service account whose lifecycle is owned by the workspace.

| Environment | Recommended authentication | Why |
| --- | --- | --- |
| Local desktop CLI | `teamgrid auth login` | Opens TeamGrid in the browser and stores a scoped personal credential in the operating-system credential store |
| Remote terminal | A personal credential imported with `--manual`, or `--no-browser` only when the loopback callback can reach the CLI host | The browser flow still finishes on the CLI host's IPv4 loopback address |
| Interactive development container | A short-lived personal credential injected through `TEAMGRID_API_TOKEN` | Containers often have no usable desktop credential store; do not bake the value into an image or layer |
| Local SDK script | Personal credential from the process environment | The SDK accepts an explicit token and never starts a browser flow |
| Local MCP host | An existing CLI profile | The MCP server reads the same operating-system credential store and never opens a browser itself |
| CI, server, or scheduled job | Service-account credential from a secret manager | It remains independent of one employee's login and can be rotated without changing a personal account |

## Local desktop

Install the CLI, then start the default browser flow:

```bash
teamgrid auth login
teamgrid auth status --check
```

Sign in with the normal TeamGrid login, select one workspace, compare the pairing phrase in the
browser and terminal, review the requested scopes, and approve. The owning regional cell creates a
credential named **TeamGrid CLI**. Developer Center shows its creation time, last use, expiry,
scopes, region, status, platform, and CLI version without revealing the secret.

The CLI stores the secret in macOS Keychain, Linux Secret Service, or Windows Credential Manager.
Its profile file contains location and lifecycle metadata only.

## Remote terminals

`teamgrid auth login --no-browser` prints the short-lived approval URL instead of invoking the
system browser. It still waits for the exact callback on the CLI process's IPv4 loopback address.
Use it only when that callback is available on the same host or through a deliberately configured,
private forwarding path. Do not paste the URL into logs or send it to another person.

When loopback delivery is unavailable, create a narrowly scoped personal credential in
**Settings → Team → Developer Center → Access** and import it interactively:

```bash
teamgrid auth login --manual
```

For a non-interactive but still user-owned setup, deliver the reveal-once value over standard input:

```bash
printf '%s' "$TEAMGRID_API_TOKEN" | teamgrid auth login --token-stdin
```

Device authorization is not part of this release.

## Containers

Do not install a desktop keyring only to make an ephemeral container look like a workstation.
Inject a short-lived credential at runtime and remove it with the container:

```bash
TEAMGRID_API_TOKEN="$TEAMGRID_API_TOKEN" teamgrid workspace --output json
```

Use a personal credential only for an interactive developer-owned container. A shared, scheduled,
or production container must use a service account. Never put a TeamGrid credential in an image,
Dockerfile, Compose file, build argument, repository variable, or diagnostic archive.

## SDK

The TypeScript SDK accepts a credential explicitly and derives the regional endpoint from it:

```ts
const client = new TeamGridClient({
  token: process.env.TEAMGRID_API_TOKEN!,
})
```

It does not open a browser or reuse a CLI profile. Use a personal credential for a local script and
a service-account credential for a deployed process.

## MCP

Authenticate the CLI before starting a local MCP host:

```bash
teamgrid auth login
teamgrid auth status --check
teamgrid-mcp --profile default --tool-profile core
```

The MCP server reads the selected CLI profile and operating-system credential store. It never
starts an interactive login and exposes no credential-management tools. For an unattended MCP
process, inject a service-account credential through the process environment only if the host can
isolate secrets and redact logs reliably.

## CI and unattended services

Create a dedicated service account in Developer Center, grant only the required scopes and resource
access, and store its reveal-once credential in the CI platform's secret manager. Inject it as
`TEAMGRID_API_TOKEN` at runtime. Do not run `teamgrid auth login`, create a personal credential, or
persist a CLI profile in CI.

Rotate a service credential by adding the replacement, updating the secret manager, verifying the
new generation, and then revoking the predecessor after the intended grace period.

## Logout, expiry, and revocation

`teamgrid auth logout` removes only the local profile and its operating-system credential-store
entry. It does not contact TeamGrid and does not revoke the server-side credential. This makes local
cleanup reliable while offline, but the credential remains usable wherever else it was copied.

To stop access, revoke the exact credential in **Developer Center → Access**. Expired or revoked
credentials cannot be renewed in place; run browser login again or issue a replacement service
credential. Disabling or removing a TeamGrid member immediately affects their personal credentials.

## Safe support data

Run `teamgrid auth status --check` and record only:

- the command's non-secret status and error code;
- profile name, region, cell, credential ID, authentication source, scopes, and expiry;
- CLI, Node.js, and operating-system versions;
- the API response status, structured error code, `meta.requestId`, and timestamp.

Never send the bearer credential, browser approval URL, authorization code, PKCE verifier, pairing
request, operating-system keychain export, environment dump, profile directory archive, request or
response body containing customer data, or an unredacted terminal transcript. Reproduce with a
bounded `teamgrid workspace --output json` request before collecting broader logs.
