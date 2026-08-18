---
title: "teamgrid task-recurrence-operations"
description: "3 executable @teamgrid/cli commands in the task-recurrence-operations group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-18
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `bd139c5ebb3f`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

inspect and cancel asynchronous recurrence operations.

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

- [`teamgrid task-recurrence-operations get`](#teamgrid-task-recurrence-operations-get) — Get a task recurrence operation.
- [`teamgrid task-recurrence-operations wait`](#teamgrid-task-recurrence-operations-wait) — Performs a local TeamGrid CLI operation.
- [`teamgrid task-recurrence-operations cancel`](#teamgrid-task-recurrence-operations-cancel) — Cancel a task recurrence operation.

## teamgrid task-recurrence-operations get

Get a task recurrence operation.

### Syntax

```bash
teamgrid task-recurrence-operations get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getTaskRecurrenceOperation` | `GET /task-recurrence-operations/{id}` | `task-recurrences:read` | [Get a task recurrence operation](/api/v1/reference/operations/gettaskrecurrenceoperation/) |

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
teamgrid task-recurrence-operations get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrence-operations wait

Performs a local TeamGrid CLI operation.

### Syntax

```bash
teamgrid task-recurrence-operations wait [options] <id>
```

### API operation and scope

The public capability manifest does not assign a dedicated API operation to this local CLI command.

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--poll-interval <milliseconds>` | poll interval while waiting | No | — | `1000` |
| `--max-wait <milliseconds>` | maximum wait time | No | — | `300000` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrence-operations wait ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrence-operations cancel

Cancel a task recurrence operation.

### Syntax

```bash
teamgrid task-recurrence-operations cancel [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `cancelTaskRecurrenceOperation` | `POST /task-recurrence-operations/{id}/cancel` | `task-recurrences:write` | [Cancel a task recurrence operation](/api/v1/reference/operations/canceltaskrecurrenceoperation/) |

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
teamgrid task-recurrence-operations cancel ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
