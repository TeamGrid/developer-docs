---
title: "teamgrid planned-work"
description: "3 executable @teamgrid/cli commands in the planned-work group, generated from CLI 1.0.5."
owner: Developer Experience
reviewedAt: 2026-08-08
---

> Generated from `@teamgrid/cli@1.0.5` at Developer Platform commit `731a66228703`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and atomically replace task planned work.

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

- [`teamgrid planned-work list`](#teamgrid-planned-work-list) — List planned work in a bounded window.
- [`teamgrid planned-work get`](#teamgrid-planned-work-get) — Get a task planned-work schedule.
- [`teamgrid planned-work replace`](#teamgrid-planned-work-replace) — Replace task planned work asynchronously.

## teamgrid planned-work list

List planned work in a bounded window.

### Syntax

```bash
teamgrid planned-work list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listPlannedWork` | `GET /planned-work` | `planned-work:read` | [List planned work in a bounded window](/api/v1/reference/operations/listplannedwork/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--start <date>` | inclusive planned-work window start | Yes | — | — |
| `--end <date>` | inclusive planned-work window end | Yes | — | — |
| `--project-id <id>` | filter by project | No | — | — |
| `--task-id <id>` | filter by task | No | — | — |
| `--user-id <id>` | filter by user | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid planned-work list --start DATE --end DATE
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid planned-work get

Get a task planned-work schedule.

### Syntax

```bash
teamgrid planned-work get [options] <task-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getTaskPlannedWork` | `GET /tasks/{id}/planned-work` | `planned-work:read` | [Get a task planned-work schedule](/api/v1/reference/operations/gettaskplannedwork/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `task-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid planned-work get TASK_ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid planned-work replace

Replace task planned work asynchronously.

### Syntax

```bash
teamgrid planned-work replace [options] <task-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `replaceTaskPlannedWork` | `PUT /tasks/{id}/planned-work` | `planned-work:write` | [Replace task planned work asynchronously](/api/v1/reference/operations/replacetaskplannedwork/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `task-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--wait` | wait until the asynchronous operation finishes | No | — | — |
| `--poll-interval <milliseconds>` | poll interval while waiting | No | — | `1000` |
| `--max-wait <milliseconds>` | maximum wait time | No | — | `300000` |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |
| `--data <json\|@file\|->` | complete planned-work replacement JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest planned-work revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid planned-work replace TASK_ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
