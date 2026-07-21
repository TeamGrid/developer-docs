---
title: Install and authenticate
description: Install the TeamGrid CLI prerelease and store an API v1 credential in the operating-system credential store.
---

## Requirements

- Node.js 22.13 through 24
- A TeamGrid API v1 credential created in **Settings → Developer**
- macOS Keychain or Linux Secret Service for persistent profiles

## Install

The Developer Platform packages are currently prereleases. Install from `next` and pin the resolved version in controlled environments.

```bash
npm install --global @teamgrid/cli@1.0.0-beta.2
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

Never commit credentials, place them in command-line arguments, or print them for debugging.
