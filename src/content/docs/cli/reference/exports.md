---
title: "teamgrid exports"
description: "4 executable @teamgrid/cli commands in the exports group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-19
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `884fa0807e6c`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

create and download bounded exports.

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

- [`teamgrid exports create`](#teamgrid-exports-create) — Create an asynchronous export.
- [`teamgrid exports get`](#teamgrid-exports-get) — Get export job status.
- [`teamgrid exports download-intent`](#teamgrid-exports-download-intent) — Create an export download intent.
- [`teamgrid exports download`](#teamgrid-exports-download) — Download a completed export through TeamGrid.

## teamgrid exports create

Create an asynchronous export.

### Syntax

```bash
teamgrid exports create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createExport` | `POST /exports` | `exports:write` | [Create an asynchronous export](/api/v1/reference/operations/createexport/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | export specification JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid exports create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid exports get

Get export job status.

### Syntax

```bash
teamgrid exports get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getExport` | `GET /exports/{id}` | `exports:read` | [Get export job status](/api/v1/reference/operations/getexport/) |

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
teamgrid exports get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid exports download-intent

Create an export download intent.

### Syntax

```bash
teamgrid exports download-intent [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createExportDownloadIntent` | `POST /exports/{id}/download-intent` | `exports:read` | [Create an export download intent](/api/v1/reference/operations/createexportdownloadintent/) |

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
teamgrid exports download-intent ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid exports download

Download a completed export through TeamGrid.

### Syntax

```bash
teamgrid exports download [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `downloadExport` | `GET /exports/{id}/download` | `exports:read` | [Download a completed export through TeamGrid](/api/v1/reference/operations/downloadexport/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--file <path>` | create a new output file without overwriting | No | — | — |
| `--stdout` | write raw export bytes to standard output | No | — | — |
| `--intent-token-stdin` | read a short-lived download intent token from stdin | No | — | — |
| `--max-bytes <number>` | download safety limit (1–52428800) | No | — | `52428800` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Choose exactly one destination. `--file` creates a new file without overwriting it; `--stdout` writes raw export bytes and must not be combined with table or JSON processing. File-mode completion metadata follows the selected global output mode.

### Example

```bash
teamgrid exports download ID --file ./teamgrid-export.bin
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
