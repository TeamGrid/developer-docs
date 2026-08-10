---
title: "teamgrid project-statements"
description: "6 executable @teamgrid/cli commands in the project-statements group, generated from CLI 1.0.5."
owner: Developer Experience
reviewedAt: 2026-08-08
---

> Generated from `@teamgrid/cli@1.0.5` at Developer Platform commit `731a66228703`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and manage project-statements.

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

- [`teamgrid project-statements list`](#teamgrid-project-statements-list) — List project statements.
- [`teamgrid project-statements get`](#teamgrid-project-statements-get) — Get a project statement.
- [`teamgrid project-statements create`](#teamgrid-project-statements-create) — Create a project statement.
- [`teamgrid project-statements update`](#teamgrid-project-statements-update) — Update a project statement.
- [`teamgrid project-statements archive`](#teamgrid-project-statements-archive) — Archive a project statement.
- [`teamgrid project-statements restore`](#teamgrid-project-statements-restore) — Restore a project statement.

## teamgrid project-statements list

List project statements.

### Syntax

```bash
teamgrid project-statements list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listProjectStatements` | `GET /project-statements` | `project-statements:read` | [List project statements](/api/v1/reference/operations/listprojectstatements/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived project-statements | No | — | — |
| `--created-at-from <date>` | filter by earliest creation timestamp | No | — | — |
| `--created-at-to <date>` | filter by latest creation timestamp | No | — | — |
| `--created-by <id>` | filter by creator | No | — | — |
| `--date-from <date>` | filter by earliest statement date | No | — | — |
| `--date-to <date>` | filter by latest statement date | No | — | — |
| `--product-id <id>` | filter by product | No | — | — |
| `--project-id <id>` | filter by project | No | — | — |
| `--type <type>` | filter statement type | No | `budget`, `bundle`, `manual`, `product` | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid project-statements list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-statements get

Get a project statement.

### Syntax

```bash
teamgrid project-statements get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getProjectStatement` | `GET /project-statements/{id}` | `project-statements:read` | [Get a project statement](/api/v1/reference/operations/getprojectstatement/) |

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
teamgrid project-statements get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-statements create

Create a project statement.

### Syntax

```bash
teamgrid project-statements create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createProjectStatement` | `POST /project-statements` | `project-statements:write` | [Create a project statement](/api/v1/reference/operations/createprojectstatement/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | project statement create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid project-statements create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-statements update

Update a project statement.

### Syntax

```bash
teamgrid project-statements update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateProjectStatement` | `PATCH /project-statements/{id}` | `project-statements:write` | [Update a project statement](/api/v1/reference/operations/updateprojectstatement/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | project statement patch JSON | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid project-statements update ID --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-statements archive

Archive a project statement.

### Syntax

```bash
teamgrid project-statements archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveProjectStatement` | `DELETE /project-statements/{id}` | `project-statements:write` | [Archive a project statement](/api/v1/reference/operations/archiveprojectstatement/) |

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
teamgrid project-statements archive ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-statements restore

Restore a project statement.

### Syntax

```bash
teamgrid project-statements restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreProjectStatement` | `POST /project-statements/{id}/restore` | `project-statements:write` | [Restore a project statement](/api/v1/reference/operations/restoreprojectstatement/) |

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
teamgrid project-statements restore ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
