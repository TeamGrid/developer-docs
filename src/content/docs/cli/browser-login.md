---
title: CLI browser login
description: Sign in to the TeamGrid CLI through the browser, choose a workspace and scopes, and manage the resulting local credential safely.
owner: Developer Experience
reviewedAt: 2026-08-08
---

Browser login is the default interactive authentication flow for the TeamGrid CLI when it is
enabled in the selected workspace's regional cell. It creates a scoped personal credential and
stores the reveal-once secret in the operating-system credential store. Passwords and TeamGrid
browser sessions never enter the CLI. If the cell has temporarily disabled new browser
authorizations, the flow fails closed; existing API credentials, `--manual`, SDK, CLI commands, and
MCP traffic remain independent of that rollout gate.

## Start the login

```bash
teamgrid auth login
```

The CLI performs this sequence:

1. It creates a short-lived authorization request and an exact IPv4 loopback callback.
2. It opens TeamGrid in the system browser.
3. You sign in with the normal TeamGrid login if no browser session exists.
4. You select one eligible workspace.
5. You compare the pairing phrase shown in the browser and terminal.
6. You review the requested scopes and approve or deny the request.
7. The owning regional cell issues an authorization code bound to the CLI's PKCE verifier.
8. The CLI exchanges the code once and stores the resulting personal credential.

After approval, verify both the local profile and the server credential:

```bash
teamgrid auth status --check
teamgrid workspace --output json
```

The workspace ID, name, region, and cell must match the workspace you selected in the browser.

## Scope presets

The default `read-only` preset is appropriate for inspection and reporting:

```bash
teamgrid auth login --preset read-only
```

Use `daily-work` only when ordinary task and time-entry writes are required:

```bash
teamgrid auth login --preset daily-work
```

Request additional non-sensitive scopes explicitly when a reviewed local workflow needs them:

```bash
teamgrid auth login --scope projects:read --scope tasks:read
```

Browser login rejects sensitive administration, finance, credential-management, and PII scopes.
Create a narrowly scoped Personal Token in **Settings → Team → Developer Center → Access**
and import it with `--manual` for those cases. This restriction prevents a normal browser session
from silently becoming a highly privileged developer credential.

## When the browser does not open

Print the private approval URL instead of launching the browser:

```bash
teamgrid auth login --no-browser
```

`--no-browser` is not a device-code flow. The callback must still reach the exact loopback address
on the machine running the CLI. Do not share the approval URL or place it in chat, tickets, shell
history, logs, or screen recordings.

For a remote host without a safe loopback path, create a Personal Token in Developer Center and use:

```bash
teamgrid auth login --manual
```

An existing token can be delivered without placing it in process arguments:

```bash
printf '%s' "$TEAMGRID_API_TOKEN" | teamgrid auth login --token-stdin
```

Device authorization is not part of this release.

## Credential storage

Persistent profiles use the native credential store:

| Operating system | Secret storage |
| --- | --- |
| macOS | Keychain |
| Linux | Secret Service through the desktop keyring |
| Windows | Windows Credential Manager |

The profile file contains only non-secret metadata: profile name, credential ID, region, cell,
scopes, expiry, authentication source, optional controlled base URL, and timestamps. It never
contains the bearer credential, password, browser session, authorization code, or PKCE verifier.

`TEAMGRID_API_TOKEN` overrides a saved profile for the current process. Use that mode for ephemeral
containers and controlled local scripts. CI, servers, and scheduled jobs must use a Service Account
credential from their secret manager rather than a personal browser credential.

## Named profiles and replacement

Use named profiles for separate workspaces or environments:

```bash
teamgrid --profile customer-a auth login
teamgrid --profile customer-a auth status --check
teamgrid --profile customer-a projects list
teamgrid auth profiles
```

The CLI never overwrites an existing profile implicitly. Choose another name or replace it only
after deciding whether the previous server credential must also be revoked:

```bash
teamgrid --profile customer-a auth login --replace
```

## Logout, expiry, and revocation

```bash
teamgrid --profile customer-a auth logout
# Or revoke the exact server credential first, then remove it locally:
teamgrid --profile customer-a auth logout --revoke
```

Plain logout is local only. With `--revoke`, the CLI calls TeamGrid with the selected keychain
credential and removes local state only after permanent revocation succeeds. If the request fails,
the profile stays intact for a safe retry. Unset `TEAMGRID_API_TOKEN` before using `--revoke`; the
environment override would make the target credential ambiguous. Developer Center remains the
fallback for revoking credentials that are no longer available locally. Expired or revoked
credentials cannot be renewed in place; sign in again or create a replacement. Removing or
disabling the TeamGrid member immediately affects their personal credentials.

## Troubleshooting

| Symptom | Safe action |
| --- | --- |
| Browser does not open | Retry with `--no-browser`; keep the approval URL private |
| Browser waits or terminal times out | Confirm the callback can reach the CLI host's IPv4 loopback address, then start a new login |
| Pairing phrases differ | Deny the request and start again; never approve mismatched phrases |
| Workspace is missing | Confirm membership, Developer entitlement, workspace status, and regional availability |
| Requested scope is rejected | Use a smaller preset or create a reviewed Personal Token for sensitive scopes |
| Profile already exists | Use another profile or deliberately retry with `--replace` |
| Credential store is unavailable | Restore the native store; the CLI never falls back to plaintext storage |
| `auth status --check` returns unauthorized | Revoke stale credentials if necessary and run browser login again |
| Wrong workspace or region is returned | Stop using the profile, revoke the credential, and authenticate against the intended workspace |

For support, record only the CLI version, Node.js and operating-system versions, profile name,
non-secret credential ID, region, cell, scopes, expiry, structured error code, request ID, and
timestamp. Never send the credential, approval URL, authorization code, PKCE verifier, keychain
export, environment dump, or an unredacted terminal transcript.
