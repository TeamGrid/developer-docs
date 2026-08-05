---
title: Install and authenticate
description: Install the TeamGrid CLI, sign in through the browser, and understand local credential storage and revocation.
owner: Developer Experience
reviewedAt: 2026-07-31
---

## Requirements

- Node.js 22.14 through 24
- A TeamGrid account with access to an enabled workspace
- Linux, macOS, or Windows
- macOS Keychain, Linux Secret Service, or Windows Credential Manager for persistent profiles

## Install

Install the stable release from npm. Pin the exact version in controlled environments.

```bash
npm install --global @teamgrid/cli@1.0.3
teamgrid --help
```

## Sign in through the browser

```bash
teamgrid auth login
teamgrid auth status --check
```

The CLI opens TeamGrid in the system browser. Sign in normally, select one workspace, compare the
pairing phrase shown in the browser and terminal, review the requested scopes, and approve. The
regional cell creates a personal credential named **TeamGrid CLI** and returns it through an
Authorization Code with PKCE loopback flow.

The reveal-once secret is written to the operating-system credential store. The CLI profile contains
only non-secret region, cell, credential ID, scopes, expiry, origin, and timestamps. TeamGrid never
writes the browser session, authorization code, or credential secret to that file.

Use the bounded `daily-work` preset only when the CLI needs ordinary task writes:

```bash
teamgrid auth login --preset daily-work
```

Browser login rejects sensitive administrative, finance, credential-management, and PII scopes.
Create an explicitly scoped personal credential in Developer Center and import it with `--manual`
when a reviewed local workflow genuinely needs one.

## When a browser cannot open

`--no-browser` prints the private, short-lived approval URL while the CLI continues to wait for its
loopback callback:

```bash
teamgrid auth login --no-browser
```

This is not a general device flow. The callback must still reach the machine running the CLI. For a
remote host without a safe callback path, create a personal credential in Developer Center and use:

```bash
teamgrid auth login --manual
```

To avoid shell history and process arguments, an existing credential can also be passed over
standard input:

```bash
printf '%s' "$TEAMGRID_API_TOKEN" | teamgrid auth login --token-stdin
```

## Named profiles

```bash
teamgrid --profile production auth login
teamgrid --profile production auth status --check
teamgrid --profile production projects list
teamgrid auth profiles
```

Remove a stored profile and its credential with:

```bash
teamgrid --profile production auth logout
```

This logout is local only. It removes the profile and operating-system credential-store entry but
does not revoke the server credential. Revoke **TeamGrid CLI** under **Settings → Team → Developer
Center → Access** when access must stop. An existing profile is never overwritten implicitly; use a
different profile or `--replace` only after deciding whether the prior credential must be revoked.

## Ephemeral credentials

For a short-lived process, provide `TEAMGRID_API_TOKEN` directly instead of creating a persistent
profile. CI and unattended services must use a service-account credential from a secret manager,
not a personal browser credential. Secret masking and log redaction still belong in the execution
environment.

```bash
TEAMGRID_API_TOKEN="$TEAMGRID_API_TOKEN" teamgrid workspace --output json
```

PowerShell example:

```powershell
$env:TEAMGRID_API_TOKEN = "<credential>"
teamgrid workspace --output json
Remove-Item Env:TEAMGRID_API_TOKEN
```

Never commit credentials, place them in command-line arguments, or print them for debugging.
See [authentication by environment](/resources/authentication-by-environment/) for remote shells,
containers, SDK, MCP, CI, expiry, revocation, and safe support data.
