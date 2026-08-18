---
title: "teamgrid service-accounts"
description: "10 executable @teamgrid/cli commands in the service-accounts group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-18
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `bd139c5ebb3f`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

manage service-account principals and credentials.

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

- [`teamgrid service-accounts list`](#teamgrid-service-accounts-list) — List service accounts.
- [`teamgrid service-accounts get`](#teamgrid-service-accounts-get) — Get a service account.
- [`teamgrid service-accounts create`](#teamgrid-service-accounts-create) — Create a service account and its initial credential.
- [`teamgrid service-accounts update`](#teamgrid-service-accounts-update) — Enable or disable a service account.
- [`teamgrid service-accounts revoke`](#teamgrid-service-accounts-revoke) — Permanently revoke a service account.
- [`teamgrid service-accounts grants get`](#teamgrid-service-accounts-grants-get) — Get the complete service account resource grant set.
- [`teamgrid service-accounts grants replace`](#teamgrid-service-accounts-grants-replace) — Replace the complete service account resource grant set.
- [`teamgrid service-accounts credentials create`](#teamgrid-service-accounts-credentials-create) — Create an independent service account credential.
- [`teamgrid service-accounts credentials rotate`](#teamgrid-service-accounts-credentials-rotate) — rotate and reveal a service-account credential exactly once.
- [`teamgrid service-accounts credentials revoke`](#teamgrid-service-accounts-credentials-revoke) — Revoke a service account credential.

## teamgrid service-accounts list

List service accounts.

### Syntax

```bash
teamgrid service-accounts list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listServiceAccounts` | `GET /service-accounts` | `service-accounts:read` | [List service accounts](/api/v1/reference/operations/listserviceaccounts/) |


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
teamgrid service-accounts list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts get

Get a service account.

### Syntax

```bash
teamgrid service-accounts get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getServiceAccount` | `GET /service-accounts/{id}` | `service-accounts:read` | [Get a service account](/api/v1/reference/operations/getserviceaccount/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid service-accounts get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts create

Create a service account and its initial credential.

### Syntax

```bash
teamgrid service-accounts create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createServiceAccount` | `POST /service-accounts` | `service-accounts:write` | [Create a service account and its initial credential](/api/v1/reference/operations/createserviceaccount/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | service account create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--secret-file <path>` | create a new mode-0600 credential file without overwriting | No | — | — |
| `--secret-stdout` | write only the raw reveal-once credential to stdout | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Choose exactly one reveal-once destination. `--secret-file` creates a new protected file without overwriting it; `--secret-stdout` writes only the raw secret. When a file is used, the non-secret receipt follows the selected global output mode.

### Example

```bash
teamgrid service-accounts create --data @request.json --secret-file ./teamgrid-secret.txt
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts update

Enable or disable a service account.

### Syntax

```bash
teamgrid service-accounts update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateServiceAccount` | `PATCH /service-accounts/{id}` | `service-accounts:write` | [Enable or disable a service account](/api/v1/reference/operations/updateserviceaccount/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | service account status update JSON | Yes | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid service-accounts update ID --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts revoke

Permanently revoke a service account.

### Syntax

```bash
teamgrid service-accounts revoke [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `revokeServiceAccount` | `DELETE /service-accounts/{id}` | `service-accounts:write` | [Permanently revoke a service account](/api/v1/reference/operations/revokeserviceaccount/) |

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
teamgrid service-accounts revoke ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts grants get

Get the complete service account resource grant set.

### Syntax

```bash
teamgrid service-accounts grants get [options] <serviceAccountId>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getServiceAccountResourceGrants` | `GET /service-accounts/{id}/resource-grants` | `resource-grants:read` | [Get the complete service account resource grant set](/api/v1/reference/operations/getserviceaccountresourcegrants/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `serviceAccountId` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid service-accounts grants get SERVICE_ACCOUNT_ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts grants replace

Replace the complete service account resource grant set.

### Syntax

```bash
teamgrid service-accounts grants replace [options] <serviceAccountId>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `replaceServiceAccountResourceGrants` | `PUT /service-accounts/{id}/resource-grants` | `resource-grants:write` | [Replace the complete service account resource grant set](/api/v1/reference/operations/replaceserviceaccountresourcegrants/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `serviceAccountId` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | complete resource-grant set JSON | Yes | — | — |
| `--if-match <etag>` | latest strong resource-grant policy ETag | Yes | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid service-accounts grants replace SERVICE_ACCOUNT_ID --data @request.json --if-match ETAG
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts credentials create

Create an independent service account credential.

### Syntax

```bash
teamgrid service-accounts credentials create [options] <serviceAccountId>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createServiceAccountCredential` | `POST /service-accounts/{id}/credentials` | `credentials:write` | [Create an independent service account credential](/api/v1/reference/operations/createserviceaccountcredential/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `serviceAccountId` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | service credential create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--secret-file <path>` | create a new mode-0600 credential file without overwriting | No | — | — |
| `--secret-stdout` | write only the raw reveal-once credential to stdout | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Choose exactly one reveal-once destination. `--secret-file` creates a new protected file without overwriting it; `--secret-stdout` writes only the raw secret. When a file is used, the non-secret receipt follows the selected global output mode.

### Example

```bash
teamgrid service-accounts credentials create SERVICE_ACCOUNT_ID --data @request.json --secret-file ./teamgrid-secret.txt
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts credentials rotate

rotate and reveal a service-account credential exactly once.

### Syntax

```bash
teamgrid service-accounts credentials rotate [options] <serviceAccountId> <credentialId>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `rotateServiceAccountCredential` | `POST /service-accounts/{id}/credentials/{credentialId}/rotation` | `credentials:write` | [Rotate a service account credential](/api/v1/reference/operations/rotateserviceaccountcredential/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `serviceAccountId` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `credentialId` | Yes | No | — | — | Identifier or value named by the command syntax. |

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
teamgrid service-accounts credentials rotate SERVICE_ACCOUNT_ID CREDENTIAL_ID --secret-file ./teamgrid-secret.txt
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid service-accounts credentials revoke

Revoke a service account credential.

### Syntax

```bash
teamgrid service-accounts credentials revoke [options] <serviceAccountId> <credentialId>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `revokeServiceAccountCredential` | `DELETE /service-accounts/{id}/credentials/{credentialId}` | `credentials:write` | [Revoke a service account credential](/api/v1/reference/operations/revokeserviceaccountcredential/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `serviceAccountId` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `credentialId` | Yes | No | — | — | Identifier or value named by the command syntax. |

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
teamgrid service-accounts credentials revoke SERVICE_ACCOUNT_ID CREDENTIAL_ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
