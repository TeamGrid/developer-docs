---
title: "teamgrid time-entries"
description: "8 executable @teamgrid/cli commands in the time-entries group, generated from CLI 1.0.6."
owner: Developer Experience
reviewedAt: 2026-08-10
---

> Generated from `@teamgrid/cli@1.0.6` at Developer Platform commit `e6f6b47fa223`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and mutate time entries.
Command aliases: `teamgrid times`.


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

- [`teamgrid time-entries list`](#teamgrid-time-entries-list) — List time entries.
- [`teamgrid time-entries get`](#teamgrid-time-entries-get) — Get a time entry.
- [`teamgrid time-entries billing get`](#teamgrid-time-entries-billing-get) — Get time-entry billing state.
- [`teamgrid time-entries billing update`](#teamgrid-time-entries-billing-update) — Update time-entry billing state.
- [`teamgrid time-entries create`](#teamgrid-time-entries-create) — Create a time entry.
- [`teamgrid time-entries update`](#teamgrid-time-entries-update) — Update a time entry.
- [`teamgrid time-entries archive`](#teamgrid-time-entries-archive) — Archive a time entry.
- [`teamgrid time-entries restore`](#teamgrid-time-entries-restore) — Restore an archived time entry.

## teamgrid time-entries list

List time entries.

### Syntax

```bash
teamgrid time-entries list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listTimeEntries` | `GET /time-entries` | `time-entries:read` | [List time entries](/api/v1/reference/operations/listtimeentries/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived time entries | No | — | — |
| `--billable <boolean>` | filter by billable status | No | — | — |
| `--billed <boolean>` | filter by billed status | No | — | — |
| `--created-by-id <id>` | filter by creator | No | — | — |
| `--from <date>` | filter start date | No | — | — |
| `--service-id <id>` | filter by service | No | — | — |
| `--to <date>` | filter end date | No | — | — |
| `--task-id <id>` | filter by task | No | — | — |
| `--user-id <id>` | filter by user | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid time-entries list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid time-entries get

Get a time entry.

### Syntax

```bash
teamgrid time-entries get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getTimeEntry` | `GET /time-entries/{id}` | `time-entries:read` | [Get a time entry](/api/v1/reference/operations/gettimeentry/) |

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
teamgrid time-entries get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid time-entries billing get

Get time-entry billing state.

### Syntax

```bash
teamgrid time-entries billing get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getTimeEntryBilling` | `GET /time-entries/{id}/billing` | `time-entries:billing` | [Get time-entry billing state](/api/v1/reference/operations/gettimeentrybilling/) |

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
teamgrid time-entries billing get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid time-entries billing update

Update time-entry billing state.

### Syntax

```bash
teamgrid time-entries billing update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateTimeEntryBilling` | `PUT /time-entries/{id}/billing` | `time-entries:billing` | [Update time-entry billing state](/api/v1/reference/operations/updatetimeentrybilling/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--billed` | mark the time entry as billed and locked | No | — | — |
| `--unbilled` | mark the time entry as unbilled and editable | No | — | — |
| `--if-match <revision>` | billing revision returned by the latest read | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid time-entries billing update ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid time-entries create

Create a time entry.

### Syntax

```bash
teamgrid time-entries create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createTimeEntry` | `POST /time-entries` | `time-entries:write` | [Create a time entry](/api/v1/reference/operations/createtimeentry/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | time-entry create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid time-entries create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid time-entries update

Update a time entry.

### Syntax

```bash
teamgrid time-entries update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateTimeEntry` | `PATCH /time-entries/{id}` | `time-entries:write` | [Update a time entry](/api/v1/reference/operations/updatetimeentry/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | time-entry patch JSON | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid time-entries update ID --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid time-entries archive

Archive a time entry.

### Syntax

```bash
teamgrid time-entries archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveTimeEntry` | `DELETE /time-entries/{id}` | `time-entries:write` | [Archive a time entry](/api/v1/reference/operations/archivetimeentry/) |

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
teamgrid time-entries archive ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid time-entries restore

Restore an archived time entry.

### Syntax

```bash
teamgrid time-entries restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreTimeEntry` | `POST /time-entries/{id}/restore` | `time-entries:write` | [Restore an archived time entry](/api/v1/reference/operations/restoretimeentry/) |

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
teamgrid time-entries restore ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
