---
title: Install and authenticate
description: Install the stable TeamGrid CLI and store an API v1 credential in the operating-system credential store.
owner: Developer Experience
reviewedAt: 2026-07-30
---

## Requirements

- Node.js 22.14 through 24
- A TeamGrid API v1 credential created in **Settings → Team → Developer → Access**
- Linux, macOS, or Windows
- macOS Keychain or Linux Secret Service for persistent profiles

Stable 1.0 supports the CLI on Windows with a process-scoped
`TEAMGRID_API_TOKEN`. Persistent Windows profiles are deliberately unavailable
until TeamGrid can qualify a native operating-system credential-store
integration; the CLI never falls back to plaintext token storage.

## Install

Install the stable release from npm. Pin the exact version in controlled environments.

```bash
npm install --global @teamgrid/cli@1.0.1
teamgrid --help
```

## Create the default profile

```bash
teamgrid auth login
teamgrid auth status --check
```

The credential prompt is masked. The secret is written to the operating-system credential store; the CLI profile file contains only non-secret location metadata.

To avoid shell history and process arguments in a non-interactive setup, pass the credential over standard input:

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

## Ephemeral credentials

For a short-lived CI process, provide `TEAMGRID_API_TOKEN` directly to the process instead of creating a persistent profile. Secret masking and log redaction still belong in the CI system.

```bash
TEAMGRID_API_TOKEN="$TEAMGRID_API_TOKEN" teamgrid workspace --output json
```

This is also the supported authentication mode on Windows. PowerShell example:

```powershell
$env:TEAMGRID_API_TOKEN = "<credential>"
teamgrid workspace --output json
Remove-Item Env:TEAMGRID_API_TOKEN
```

Never commit credentials, place them in command-line arguments, or print them for debugging.
