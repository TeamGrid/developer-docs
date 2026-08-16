---
title: "teamgrid webhooks"
description: "7 executable @teamgrid/cli commands in the webhooks group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `31706a2278ce`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and manage webhooks.

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

- [`teamgrid webhooks list`](#teamgrid-webhooks-list) — List webhooks.
- [`teamgrid webhooks get`](#teamgrid-webhooks-get) — Get a webhook.
- [`teamgrid webhooks create`](#teamgrid-webhooks-create) — Create a webhook.
- [`teamgrid webhooks update`](#teamgrid-webhooks-update) — Update or reactivate a webhook.
- [`teamgrid webhooks remove`](#teamgrid-webhooks-remove) — Remove a webhook.
- [`teamgrid webhooks rotate-secret`](#teamgrid-webhooks-rotate-secret) — rotate and reveal a v2 webhook signing secret exactly once.
- [`teamgrid webhooks test`](#teamgrid-webhooks-test) — queue a signed synthetic delivery through the real webhook pipeline.

## teamgrid webhooks list

List webhooks.

### Syntax

```bash
teamgrid webhooks list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listWebhooks` | `GET /webhooks` | `webhooks:read` | [List webhooks](/api/v1/reference/operations/listwebhooks/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–100) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid webhooks list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid webhooks get

Get a webhook.

### Syntax

```bash
teamgrid webhooks get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getWebhook` | `GET /webhooks/{id}` | `webhooks:read` | [Get a webhook](/api/v1/reference/operations/getwebhook/) |

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
teamgrid webhooks get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid webhooks create

Create a webhook.

### Syntax

```bash
teamgrid webhooks create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createWebhook` | `POST /webhooks` | `webhooks:write` | [Create a webhook](/api/v1/reference/operations/createwebhook/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | webhook create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--secret-file <path>` | create a new mode-0600 secret file without overwriting | No | — | — |
| `--secret-stdout` | write only the raw reveal-once secret to stdout | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Choose exactly one reveal-once destination. `--secret-file` creates a new protected file without overwriting it; `--secret-stdout` writes only the raw secret. When a file is used, the non-secret receipt follows the selected global output mode.

### Example

```bash
teamgrid webhooks create --data @request.json --secret-file ./teamgrid-secret.txt
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid webhooks update

Update or reactivate a webhook.

### Syntax

```bash
teamgrid webhooks update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateWebhook` | `PATCH /webhooks/{id}` | `webhooks:write` | [Update or reactivate a webhook](/api/v1/reference/operations/updatewebhook/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | webhook update JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest webhook revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid webhooks update ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid webhooks remove

Remove a webhook.

### Syntax

```bash
teamgrid webhooks remove [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `removeWebhook` | `DELETE /webhooks/{id}` | `webhooks:write` | [Remove a webhook](/api/v1/reference/operations/removewebhook/) |

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
teamgrid webhooks remove ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid webhooks rotate-secret

rotate and reveal a v2 webhook signing secret exactly once.

### Syntax

```bash
teamgrid webhooks rotate-secret [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `rotateWebhookSecret` | `POST /webhooks/{id}/secret-rotation` | `webhooks:write` | [Rotate a credential-owned webhook signing secret](/api/v1/reference/operations/rotatewebhooksecret/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest webhook revision or strong ETag | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--secret-file <path>` | create a new mode-0600 secret file without overwriting | No | — | — |
| `--secret-stdout` | write only the raw reveal-once secret to stdout | No | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Choose exactly one reveal-once destination. `--secret-file` creates a new protected file without overwriting it; `--secret-stdout` writes only the raw secret. When a file is used, the non-secret receipt follows the selected global output mode.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid webhooks rotate-secret ID --if-match REVISION --secret-file ./teamgrid-secret.txt
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid webhooks test

queue a signed synthetic delivery through the real webhook pipeline.

### Syntax

```bash
teamgrid webhooks test [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `testWebhookDelivery` | `POST /webhooks/{id}/test-delivery` | `webhooks:write` | [Send a signed test webhook delivery](/api/v1/reference/operations/testwebhookdelivery/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid webhooks test ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
