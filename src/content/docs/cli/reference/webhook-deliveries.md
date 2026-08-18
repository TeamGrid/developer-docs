---
title: "teamgrid webhook-deliveries"
description: "2 executable @teamgrid/cli commands in the webhook-deliveries group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-18
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `bd139c5ebb3f`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

inspect credential-owned webhook delivery history.

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

- [`teamgrid webhook-deliveries list`](#teamgrid-webhook-deliveries-list) — List webhook delivery history.
- [`teamgrid webhook-deliveries get`](#teamgrid-webhook-deliveries-get) — Get webhook delivery metadata.

## teamgrid webhook-deliveries list

List webhook delivery history.

### Syntax

```bash
teamgrid webhook-deliveries list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listWebhookDeliveries` | `GET /webhook-deliveries` | `webhooks:read` | [List webhook delivery history](/api/v1/reference/operations/listwebhookdeliveries/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--webhook-id <id>` | filter by an owned webhook | No | — | — |
| `--event <event>` | filter by event name | No | — | — |
| `--state <state>` | filter delivery state | No | `delivering`, `failed`, `retrying`, `skipped`, `succeeded` | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid webhook-deliveries list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid webhook-deliveries get

Get webhook delivery metadata.

### Syntax

```bash
teamgrid webhook-deliveries get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getWebhookDelivery` | `GET /webhook-deliveries/{id}` | `webhooks:read` | [Get webhook delivery metadata](/api/v1/reference/operations/getwebhookdelivery/) |

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
teamgrid webhook-deliveries get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
