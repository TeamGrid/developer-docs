---
title: "teamgrid appointments"
description: "6 executable @teamgrid/cli commands in the appointments group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-19
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `efeff4648d71`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and manage appointments.

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

- [`teamgrid appointments list`](#teamgrid-appointments-list) — List appointments in a bounded interval.
- [`teamgrid appointments create`](#teamgrid-appointments-create) — Create a TeamGrid-managed appointment.
- [`teamgrid appointments get`](#teamgrid-appointments-get) — Get an appointment.
- [`teamgrid appointments update`](#teamgrid-appointments-update) — Update a TeamGrid-managed appointment.
- [`teamgrid appointments archive`](#teamgrid-appointments-archive) — Archive a TeamGrid-managed appointment.
- [`teamgrid appointments restore`](#teamgrid-appointments-restore) — Restore a TeamGrid-managed appointment.

## teamgrid appointments list

List appointments in a bounded interval.

### Syntax

```bash
teamgrid appointments list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listAppointments` | `GET /appointments` | `appointments:read` | [List appointments in a bounded interval](/api/v1/reference/operations/listappointments/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–100) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--start <date-time>` | inclusive interval start | Yes | — | — |
| `--end <date-time>` | exclusive interval end | Yes | — | — |
| `--archived <boolean>` | return archived calendar entries | No | — | — |
| `--user-id <id,...>` | filter up to 50 user IDs (repeat or comma-separate) | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid appointments list --start DATE_TIME --end DATE_TIME
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid appointments create

Create a TeamGrid-managed appointment.

### Syntax

```bash
teamgrid appointments create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createAppointment` | `POST /appointments` | `appointments:write` | [Create a TeamGrid-managed appointment](/api/v1/reference/operations/createappointment/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | appointment create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid appointments create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid appointments get

Get an appointment.

### Syntax

```bash
teamgrid appointments get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getAppointment` | `GET /appointments/{id}` | `appointments:read` | [Get an appointment](/api/v1/reference/operations/getappointment/) |

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
teamgrid appointments get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid appointments update

Update a TeamGrid-managed appointment.

### Syntax

```bash
teamgrid appointments update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateAppointment` | `PATCH /appointments/{id}` | `appointments:write` | [Update a TeamGrid-managed appointment](/api/v1/reference/operations/updateappointment/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | appointment update JSON | Yes | — | — |
| `--if-match <etag>` | latest strong appointment ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid appointments update ID --data @request.json --if-match ETAG
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid appointments archive

Archive a TeamGrid-managed appointment.

### Syntax

```bash
teamgrid appointments archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveAppointment` | `DELETE /appointments/{id}` | `appointments:write` | [Archive a TeamGrid-managed appointment](/api/v1/reference/operations/archiveappointment/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <etag>` | latest strong appointment ETag | Yes | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid appointments archive ID --if-match ETAG
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid appointments restore

Restore a TeamGrid-managed appointment.

### Syntax

```bash
teamgrid appointments restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreAppointment` | `POST /appointments/{id}/restore` | `appointments:write` | [Restore a TeamGrid-managed appointment](/api/v1/reference/operations/restoreappointment/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <etag>` | latest strong appointment ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid appointments restore ID --if-match ETAG
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
