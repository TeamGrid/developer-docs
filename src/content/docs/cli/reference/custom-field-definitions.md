---
title: "teamgrid custom-field-definitions"
description: "6 executable @teamgrid/cli commands in the custom-field-definitions group, generated from CLI 1.0.6."
owner: Developer Experience
reviewedAt: 2026-08-10
---

> Generated from `@teamgrid/cli@1.0.6` at Developer Platform commit `e6f6b47fa223`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and manage custom-field definitions.

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

- [`teamgrid custom-field-definitions list`](#teamgrid-custom-field-definitions-list) — List custom-field definitions.
- [`teamgrid custom-field-definitions get`](#teamgrid-custom-field-definitions-get) — Get a custom-field definition.
- [`teamgrid custom-field-definitions create`](#teamgrid-custom-field-definitions-create) — Create a custom-field definition.
- [`teamgrid custom-field-definitions update`](#teamgrid-custom-field-definitions-update) — Update a custom-field definition.
- [`teamgrid custom-field-definitions archive`](#teamgrid-custom-field-definitions-archive) — Archive a custom-field definition.
- [`teamgrid custom-field-definitions restore`](#teamgrid-custom-field-definitions-restore) — Restore an archived custom-field definition.

## teamgrid custom-field-definitions list

List custom-field definitions.

### Syntax

```bash
teamgrid custom-field-definitions list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listCustomFieldDefinitions` | `GET /custom-field-definitions` | `custom-field-definitions:read` | [List custom-field definitions](/api/v1/reference/operations/listcustomfielddefinitions/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived definitions | No | — | — |
| `--default-enabled <boolean>` | filter default-enabled definitions | No | — | — |
| `--field-type <type>` | filter canonical field type | No | `contact`, `date`, `dropdown`, `number`, `project`, `switcher`, `tag`, `text`, `textarea`, `user` | — |
| `--target-type <type>` | filter target resource | No | `contact`, `project`, `projectJournalEntry`, `task` | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid custom-field-definitions list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid custom-field-definitions get

Get a custom-field definition.

### Syntax

```bash
teamgrid custom-field-definitions get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getCustomFieldDefinition` | `GET /custom-field-definitions/{id}` | `custom-field-definitions:read` | [Get a custom-field definition](/api/v1/reference/operations/getcustomfielddefinition/) |

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
teamgrid custom-field-definitions get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid custom-field-definitions create

Create a custom-field definition.

### Syntax

```bash
teamgrid custom-field-definitions create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createCustomFieldDefinition` | `POST /custom-field-definitions` | `custom-field-definitions:write` | [Create a custom-field definition](/api/v1/reference/operations/createcustomfielddefinition/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | custom-field definition create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid custom-field-definitions create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid custom-field-definitions update

Update a custom-field definition.

### Syntax

```bash
teamgrid custom-field-definitions update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateCustomFieldDefinition` | `PATCH /custom-field-definitions/{id}` | `custom-field-definitions:write` | [Update a custom-field definition](/api/v1/reference/operations/updatecustomfielddefinition/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | custom-field definition patch JSON | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid custom-field-definitions update ID --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid custom-field-definitions archive

Archive a custom-field definition.

### Syntax

```bash
teamgrid custom-field-definitions archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveCustomFieldDefinition` | `DELETE /custom-field-definitions/{id}` | `custom-field-definitions:write` | [Archive a custom-field definition](/api/v1/reference/operations/archivecustomfielddefinition/) |

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
teamgrid custom-field-definitions archive ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid custom-field-definitions restore

Restore an archived custom-field definition.

### Syntax

```bash
teamgrid custom-field-definitions restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreCustomFieldDefinition` | `POST /custom-field-definitions/{id}/restore` | `custom-field-definitions:write` | [Restore an archived custom-field definition](/api/v1/reference/operations/restorecustomfielddefinition/) |

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
teamgrid custom-field-definitions restore ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
