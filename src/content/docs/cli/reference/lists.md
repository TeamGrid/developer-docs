---
title: "teamgrid lists"
description: "7 executable @teamgrid/cli commands in the lists group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-18
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `bd139c5ebb3f`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and manage lists.

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

- [`teamgrid lists`](#teamgrid-lists) — read and manage lists.
- [`teamgrid lists list`](#teamgrid-lists-list) — List workspace lists.
- [`teamgrid lists get`](#teamgrid-lists-get) — Get a list.
- [`teamgrid lists create`](#teamgrid-lists-create) — Create a list.
- [`teamgrid lists update`](#teamgrid-lists-update) — Update a list.
- [`teamgrid lists archive`](#teamgrid-lists-archive) — Archive a list.
- [`teamgrid lists restore`](#teamgrid-lists-restore) — Restore an archived list.

## teamgrid lists

read and manage lists.

### Syntax

```bash
teamgrid lists [options] [command]
```

### API operation and scope

This is an alternative CLI form of `teamgrid lists list` and calls the same API operation.

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listLists` | `GET /lists` | `lists:read` | [List workspace lists](/api/v1/reference/operations/listlists/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived values | No | — | — |
| `--parent-id <id>` | filter by parent project or user | No | — | — |
| `--type <type>` | list type | No | `tasks`, `projects`, `personal` | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid lists
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid lists list

List workspace lists.

### Syntax

```bash
teamgrid lists list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listLists` | `GET /lists` | `lists:read` | [List workspace lists](/api/v1/reference/operations/listlists/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived values | No | — | — |
| `--parent-id <id>` | filter by parent project or user | No | — | — |
| `--type <type>` | list type | No | `tasks`, `projects`, `personal` | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid lists list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid lists get

Get a list.

### Syntax

```bash
teamgrid lists get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getList` | `GET /lists/{id}` | `lists:read` | [Get a list](/api/v1/reference/operations/getlist/) |

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
teamgrid lists get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid lists create

Create a list.

### Syntax

```bash
teamgrid lists create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createList` | `POST /lists` | `lists:write` | [Create a list](/api/v1/reference/operations/createlist/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | list create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid lists create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid lists update

Update a list.

### Syntax

```bash
teamgrid lists update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateList` | `PATCH /lists/{id}` | `lists:write` | [Update a list](/api/v1/reference/operations/updatelist/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | list patch JSON | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid lists update ID --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid lists archive

Archive a list.

### Syntax

```bash
teamgrid lists archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveList` | `DELETE /lists/{id}` | `lists:write` | [Archive a list](/api/v1/reference/operations/archivelist/) |

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
teamgrid lists archive ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid lists restore

Restore an archived list.

### Syntax

```bash
teamgrid lists restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreList` | `POST /lists/{id}/restore` | `lists:write` | [Restore an archived list](/api/v1/reference/operations/restorelist/) |

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
teamgrid lists restore ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
