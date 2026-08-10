---
title: "teamgrid credentials"
description: "4 executable @teamgrid/cli commands in the credentials group, generated from CLI 1.0.6."
owner: Developer Experience
reviewedAt: 2026-08-10
---

> Generated from `@teamgrid/cli@1.0.6` at Developer Platform commit `c813667fdaf9`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

manage native API v1 credentials.

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

- [`teamgrid credentials personal list`](#teamgrid-credentials-personal-list) — List personal access tokens owned by the current user.
- [`teamgrid credentials personal create`](#teamgrid-credentials-personal-create) — Create a personal access token.
- [`teamgrid credentials personal rotate`](#teamgrid-credentials-personal-rotate) — rotate and reveal a personal access token exactly once.
- [`teamgrid credentials personal revoke`](#teamgrid-credentials-personal-revoke) — Revoke a personal access token.

## teamgrid credentials personal list

List personal access tokens owned by the current user.

### Syntax

```bash
teamgrid credentials personal list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listPersonalAccessTokens` | `GET /me/personal-access-tokens` | `credentials:read` | [List personal access tokens owned by the current user](/api/v1/reference/operations/listpersonalaccesstokens/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid credentials personal list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid credentials personal create

Create a personal access token.

### Syntax

```bash
teamgrid credentials personal create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createPersonalAccessToken` | `POST /me/personal-access-tokens` | `credentials:write` | [Create a personal access token](/api/v1/reference/operations/createpersonalaccesstoken/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | personal access token create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--secret-file <path>` | create a new mode-0600 credential file without overwriting | No | — | — |
| `--secret-stdout` | write only the raw reveal-once credential to stdout | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Choose exactly one reveal-once destination. `--secret-file` creates a new protected file without overwriting it; `--secret-stdout` writes only the raw secret. When a file is used, the non-secret receipt follows the selected global output mode.

### Example

```bash
teamgrid credentials personal create --data @request.json --secret-file ./teamgrid-secret.txt
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid credentials personal rotate

rotate and reveal a personal access token exactly once.

### Syntax

```bash
teamgrid credentials personal rotate [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `rotatePersonalAccessToken` | `POST /me/personal-access-tokens/{id}/rotation` | `credentials:write` | [Rotate a personal access token](/api/v1/reference/operations/rotatepersonalaccesstoken/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | optional rotation JSON | No | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--secret-file <path>` | create a new mode-0600 credential file without overwriting | No | — | — |
| `--secret-stdout` | write only the raw reveal-once credential to stdout | No | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Choose exactly one reveal-once destination. `--secret-file` creates a new protected file without overwriting it; `--secret-stdout` writes only the raw secret. When a file is used, the non-secret receipt follows the selected global output mode.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid credentials personal rotate ID --secret-file ./teamgrid-secret.txt
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid credentials personal revoke

Revoke a personal access token.

### Syntax

```bash
teamgrid credentials personal revoke [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `revokePersonalAccessToken` | `DELETE /me/personal-access-tokens/{id}` | `credentials:write` | [Revoke a personal access token](/api/v1/reference/operations/revokepersonalaccesstoken/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid credentials personal revoke ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
