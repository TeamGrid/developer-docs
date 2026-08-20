---
title: "teamgrid custom-field-values"
description: "4 executable @teamgrid/cli commands in the custom-field-values group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-19
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `efeff4648d71`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and compare-and-set custom-field values.

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

- [`teamgrid custom-field-values get`](#teamgrid-custom-field-values-get) — Get a custom-field value.
- [`teamgrid custom-field-values get-many`](#teamgrid-custom-field-values-get-many) — Read custom-field values for one resource.
- [`teamgrid custom-field-values set`](#teamgrid-custom-field-values-set) — Set a custom-field value.
- [`teamgrid custom-field-values clear`](#teamgrid-custom-field-values-clear) — Clear a custom-field value.

## teamgrid custom-field-values get

Get a custom-field value.

### Syntax

```bash
teamgrid custom-field-values get [options] <target-type> <resource-id> <field-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getCustomFieldValue` | `GET /custom-field-values/{targetType}/{resourceId}/{fieldId}` | `custom-field-values:read` | [Get a custom-field value](/api/v1/reference/operations/getcustomfieldvalue/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `target-type` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `resource-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `field-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid custom-field-values get TARGET_TYPE RESOURCE_ID FIELD_ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid custom-field-values get-many

Read custom-field values for one resource.

### Syntax

```bash
teamgrid custom-field-values get-many [options] <target-type> <resource-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getCustomFieldValues` | `POST /custom-field-values/{targetType}/{resourceId}/batch-read` | `custom-field-values:read` | [Read custom-field values for one resource](/api/v1/reference/operations/getcustomfieldvalues/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `target-type` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `resource-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--field-id <ids...>` | one to 100 custom-field definition ids | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid custom-field-values get-many TARGET_TYPE RESOURCE_ID --field-id ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid custom-field-values set

Set a custom-field value.

### Syntax

```bash
teamgrid custom-field-values set [options] <target-type> <resource-id> <field-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `setCustomFieldValue` | `PUT /custom-field-values/{targetType}/{resourceId}/{fieldId}` | `custom-field-values:write` | [Set a custom-field value](/api/v1/reference/operations/setcustomfieldvalue/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `target-type` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `resource-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `field-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | custom-field value JSON, for example {"value":"A"} | Yes | — | — |
| `--if-match <revision\|etag>` | latest custom-field value revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid custom-field-values set TARGET_TYPE RESOURCE_ID FIELD_ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid custom-field-values clear

Clear a custom-field value.

### Syntax

```bash
teamgrid custom-field-values clear [options] <target-type> <resource-id> <field-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `clearCustomFieldValue` | `DELETE /custom-field-values/{targetType}/{resourceId}/{fieldId}` | `custom-field-values:write` | [Clear a custom-field value](/api/v1/reference/operations/clearcustomfieldvalue/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `target-type` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `resource-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `field-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest custom-field value revision or strong ETag | Yes | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid custom-field-values clear TARGET_TYPE RESOURCE_ID FIELD_ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
