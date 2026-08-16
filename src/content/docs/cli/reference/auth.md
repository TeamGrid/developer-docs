---
title: "teamgrid auth"
description: "4 executable @teamgrid/cli commands in the auth group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `31706a2278ce`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

manage local credential profiles.

## Global options

Global options can be placed before the command group.

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `-V, --version` | output the version number | No | — | — |
| `-o, --output <format>` | output format | No | `table`, `json`, `jsonl` | `table` |
| `--profile <name>` | credential profile | No | — | — |
| `--base-url <url>` | override the regional API v1 base URL | No | — | — |
| `--timeout <milliseconds>` | request timeout | No | — | `30000` |
| `--retries <count>` | safe-request retry count (0–5) | No | — | `2` |

## Commands

- [`teamgrid auth login`](#teamgrid-auth-login) — sign in with your browser and store the credential in the OS keychain.
- [`teamgrid auth logout`](#teamgrid-auth-logout) — remove a profile credential locally and optionally revoke it in TeamGrid.
- [`teamgrid auth profiles`](#teamgrid-auth-profiles) — list non-secret profile metadata.
- [`teamgrid auth status`](#teamgrid-auth-status) — show the active credential location and optionally verify its server context.

## teamgrid auth login

sign in with your browser and store the credential in the OS keychain.

### Syntax

```bash
teamgrid auth login [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `exchangeCliAuthorizationCode` | `POST /auth/cli/token` | Anonymous protocol | [Exchange a TeamGrid CLI authorization code](/api/v1/reference/operations/exchangecliauthorizationcode/) |
| `compensateCliAuthorizationStorage` | `POST /auth/cli/storage-compensation` | Anonymous protocol | [Compensate a failed TeamGrid CLI credential-store write](/api/v1/reference/operations/compensatecliauthorizationstorage/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--manual` | paste a reveal-once API v1 credential | No | — | — |
| `--no-browser` | print the authorization URL instead of opening a browser | No | — | — |
| `--replace` | replace an existing local profile without revoking its prior credential | No | — | — |
| `--preset <preset>` | browser-login permission preset | No | `read-only`, `daily-work` | `read-only` |
| `--scope <scope>` | request an exact scope; repeat or comma-separate | No | — | `[]` |
| `--token-stdin` | read the credential from standard input | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid auth login
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid auth logout

remove a profile credential locally and optionally revoke it in TeamGrid.

### Syntax

```bash
teamgrid auth logout [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `revokeCurrentCredential` | `DELETE /auth/context` | Anonymous protocol | [Revoke the current credential](/api/v1/reference/operations/revokecurrentcredential/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--revoke` | revoke the current credential before removing the local profile | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid auth logout
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid auth profiles

list non-secret profile metadata.

### Syntax

```bash
teamgrid auth profiles [options]
```

### API operation and scope

The public capability manifest does not assign a dedicated API operation to this local CLI command.


### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid auth profiles
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid auth status

show the active credential location and optionally verify its server context.

### Syntax

```bash
teamgrid auth status [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getCurrentCredentialContext` | `GET /auth/context` | Anonymous protocol | [Inspect the current credential](/api/v1/reference/operations/getcurrentcredentialcontext/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--check` | retrieve the authenticated credential context from TeamGrid | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid auth status
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
