---
title: "teamgrid task-recurrences"
description: "23 executable @teamgrid/cli commands in the task-recurrences group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-18
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `bd139c5ebb3f`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

define, inspect, and operate recurring tasks.

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

- [`teamgrid task-recurrences list`](#teamgrid-task-recurrences-list) — List task recurrences.
- [`teamgrid task-recurrences get`](#teamgrid-task-recurrences-get) — Get a task recurrence.
- [`teamgrid task-recurrences create`](#teamgrid-task-recurrences-create) — Create a task recurrence.
- [`teamgrid task-recurrences preview`](#teamgrid-task-recurrences-preview) — evaluate an unsaved recurrence definition without changing state.
- [`teamgrid task-recurrences update`](#teamgrid-task-recurrences-update) — Update a task recurrence.
- [`teamgrid task-recurrences archive`](#teamgrid-task-recurrences-archive) — Archive a task recurrence.
- [`teamgrid task-recurrences preview-stored`](#teamgrid-task-recurrences-preview-stored) — preview occurrences from the current saved definition.
- [`teamgrid task-recurrences restore`](#teamgrid-task-recurrences-restore) — Restore a task recurrence.
- [`teamgrid task-recurrences pause`](#teamgrid-task-recurrences-pause) — Pause a task recurrence.
- [`teamgrid task-recurrences resume`](#teamgrid-task-recurrences-resume) — Resume a task recurrence.
- [`teamgrid task-recurrences end`](#teamgrid-task-recurrences-end) — End a task recurrence.
- [`teamgrid task-recurrences owner`](#teamgrid-task-recurrences-owner) — transfer task recurrence ownership.
- [`teamgrid task-recurrences template-from-task`](#teamgrid-task-recurrences-template-from-task) — replace the recurrence task template from an existing task.
- [`teamgrid task-recurrences versions list`](#teamgrid-task-recurrences-versions-list) — List task recurrence versions.
- [`teamgrid task-recurrences versions get`](#teamgrid-task-recurrences-versions-get) — Get a task recurrence version.
- [`teamgrid task-recurrences versions restore`](#teamgrid-task-recurrences-versions-restore) — Restore a task recurrence version.
- [`teamgrid task-recurrences occurrences list`](#teamgrid-task-recurrences-occurrences-list) — List task recurrence occurrences.
- [`teamgrid task-recurrences occurrences get`](#teamgrid-task-recurrences-occurrences-get) — Get a task recurrence occurrence.
- [`teamgrid task-recurrences occurrences override`](#teamgrid-task-recurrences-occurrences-override) — Override a task recurrence occurrence.
- [`teamgrid task-recurrences occurrences clear-override`](#teamgrid-task-recurrences-occurrences-clear-override) — Clear a task recurrence occurrence override.
- [`teamgrid task-recurrences occurrences retry`](#teamgrid-task-recurrences-occurrences-retry) — Retry a failed task recurrence occurrence.
- [`teamgrid task-recurrences recheck`](#teamgrid-task-recurrences-recheck) — Recheck a task recurrence asynchronously.
- [`teamgrid task-recurrences events submit`](#teamgrid-task-recurrences-events-submit) — Submit an event to a task recurrence.

## teamgrid task-recurrences list

List task recurrences.

### Syntax

```bash
teamgrid task-recurrences list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listTaskRecurrences` | `GET /task-recurrences` | `task-recurrences:read` | [List task recurrences](/api/v1/reference/operations/listtaskrecurrences/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–100) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--project-id <id>` | filter by target project | No | — | — |
| `--status <status>` | filter lifecycle status | No | `active`, `paused`, `suspended`, `needs_attention`, `ended`, `archived` | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid task-recurrences list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences get

Get a task recurrence.

### Syntax

```bash
teamgrid task-recurrences get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getTaskRecurrence` | `GET /task-recurrences/{id}` | `task-recurrences:read` | [Get a task recurrence](/api/v1/reference/operations/gettaskrecurrence/) |

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
teamgrid task-recurrences get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences create

Create a task recurrence.

### Syntax

```bash
teamgrid task-recurrences create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createTaskRecurrence` | `POST /task-recurrences` | `task-recurrences:write` | [Create a task recurrence](/api/v1/reference/operations/createtaskrecurrence/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | task recurrence definition JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences preview

evaluate an unsaved recurrence definition without changing state.

### Syntax

```bash
teamgrid task-recurrences preview [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `previewTaskRecurrence` | `POST /task-recurrences/preview` | `task-recurrences:write` | [Preview a draft task recurrence](/api/v1/reference/operations/previewtaskrecurrence/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | task recurrence preview JSON | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences preview --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences update

Update a task recurrence.

### Syntax

```bash
teamgrid task-recurrences update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateTaskRecurrence` | `PATCH /task-recurrences/{id}` | `task-recurrences:write` | [Update a task recurrence](/api/v1/reference/operations/updatetaskrecurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | task recurrence patch JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences update ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences archive

Archive a task recurrence.

### Syntax

```bash
teamgrid task-recurrences archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveTaskRecurrence` | `DELETE /task-recurrences/{id}` | `task-recurrences:write` | [Archive a task recurrence](/api/v1/reference/operations/archivetaskrecurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid task-recurrences archive ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences preview-stored

preview occurrences from the current saved definition.

### Syntax

```bash
teamgrid task-recurrences preview-stored [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `previewStoredTaskRecurrence` | `GET /task-recurrences/{id}/preview` | `task-recurrences:read` | [Preview a stored task recurrence](/api/v1/reference/operations/previewstoredtaskrecurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--count <number>` | number of occurrences (1–100) | No | — | — |
| `--from <date>` | preview window start | No | — | — |
| `--until <date>` | preview window end | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences preview-stored ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences restore

Restore a task recurrence.

### Syntax

```bash
teamgrid task-recurrences restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreTaskRecurrence` | `POST /task-recurrences/{id}/restore` | `task-recurrences:write` | [Restore a task recurrence](/api/v1/reference/operations/restoretaskrecurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences restore ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences pause

Pause a task recurrence.

### Syntax

```bash
teamgrid task-recurrences pause [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `pauseTaskRecurrence` | `POST /task-recurrences/{id}/pause` | `task-recurrences:write` | [Pause a task recurrence](/api/v1/reference/operations/pausetaskrecurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences pause ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences resume

Resume a task recurrence.

### Syntax

```bash
teamgrid task-recurrences resume [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `resumeTaskRecurrence` | `POST /task-recurrences/{id}/resume` | `task-recurrences:write` | [Resume a task recurrence](/api/v1/reference/operations/resumetaskrecurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences resume ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences end

End a task recurrence.

### Syntax

```bash
teamgrid task-recurrences end [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `endTaskRecurrence` | `POST /task-recurrences/{id}/end` | `task-recurrences:write` | [End a task recurrence](/api/v1/reference/operations/endtaskrecurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid task-recurrences end ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences owner

transfer task recurrence ownership.

### Syntax

```bash
teamgrid task-recurrences owner [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `transferTaskRecurrenceOwner` | `POST /task-recurrences/{id}/owner` | `task-recurrences:write` | [Transfer task recurrence ownership](/api/v1/reference/operations/transfertaskrecurrenceowner/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | new owner JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences owner ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences template-from-task

replace the recurrence task template from an existing task.

### Syntax

```bash
teamgrid task-recurrences template-from-task [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `applyTaskAsTaskRecurrenceTemplate` | `POST /task-recurrences/{id}/definition-from-task` | `task-recurrences:write` | [Replace a recurrence template from a task](/api/v1/reference/operations/applytaskastaskrecurrencetemplate/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | source task and copy policy JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences template-from-task ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences versions list

List task recurrence versions.

### Syntax

```bash
teamgrid task-recurrences versions list [options] <series-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listTaskRecurrenceVersions` | `GET /task-recurrences/{id}/versions` | `task-recurrences:read` | [List task recurrence versions](/api/v1/reference/operations/listtaskrecurrenceversions/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `series-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–100) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid task-recurrences versions list SERIES_ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences versions get

Get a task recurrence version.

### Syntax

```bash
teamgrid task-recurrences versions get [options] <series-id> <version-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getTaskRecurrenceVersion` | `GET /task-recurrences/{id}/versions/{versionId}` | `task-recurrences:read` | [Get a task recurrence version](/api/v1/reference/operations/gettaskrecurrenceversion/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `series-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `version-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences versions get SERIES_ID VERSION_ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences versions restore

Restore a task recurrence version.

### Syntax

```bash
teamgrid task-recurrences versions restore [options] <series-id> <version-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreTaskRecurrenceVersion` | `POST /task-recurrences/{id}/versions/{versionId}/restore` | `task-recurrences:write` | [Restore a task recurrence version](/api/v1/reference/operations/restoretaskrecurrenceversion/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `series-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `version-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | optional restore reason JSON | No | — | — |
| `--if-match <revision\|etag>` | latest task recurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences versions restore SERIES_ID VERSION_ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences occurrences list

List task recurrence occurrences.

### Syntax

```bash
teamgrid task-recurrences occurrences list [options] <series-id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listTaskRecurrenceOccurrences` | `GET /task-recurrences/{id}/occurrences` | `task-recurrences:read` | [List task recurrence occurrences](/api/v1/reference/operations/listtaskrecurrenceoccurrences/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `series-id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–100) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid task-recurrences occurrences list SERIES_ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences occurrences get

Get a task recurrence occurrence.

### Syntax

```bash
teamgrid task-recurrences occurrences get [options] <series-id> <occurrence-key>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getTaskRecurrenceOccurrence` | `GET /task-recurrences/{id}/occurrences/{occurrenceKey}` | `task-recurrences:read` | [Get a task recurrence occurrence](/api/v1/reference/operations/gettaskrecurrenceoccurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `series-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `occurrence-key` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences occurrences get SERIES_ID OCCURRENCE_KEY
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences occurrences override

Override a task recurrence occurrence.

### Syntax

```bash
teamgrid task-recurrences occurrences override [options] <series-id> <occurrence-key>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `overrideTaskRecurrenceOccurrence` | `PUT /task-recurrences/{id}/occurrences/{occurrenceKey}/override` | `task-recurrences:write` | [Override a task recurrence occurrence](/api/v1/reference/operations/overridetaskrecurrenceoccurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `series-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `occurrence-key` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | occurrence override JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest task recurrence occurrence revision or strong ETag | No | — | — |
| `--create-if-missing` | create a ledger placeholder using placeholderToken from stored preview | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences occurrences override SERIES_ID OCCURRENCE_KEY --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences occurrences clear-override

Clear a task recurrence occurrence override.

### Syntax

```bash
teamgrid task-recurrences occurrences clear-override [options] <series-id> <occurrence-key>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `clearTaskRecurrenceOccurrenceOverride` | `DELETE /task-recurrences/{id}/occurrences/{occurrenceKey}/override` | `task-recurrences:write` | [Clear a task recurrence occurrence override](/api/v1/reference/operations/cleartaskrecurrenceoccurrenceoverride/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `series-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `occurrence-key` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task recurrence occurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences occurrences clear-override SERIES_ID OCCURRENCE_KEY --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences occurrences retry

Retry a failed task recurrence occurrence.

### Syntax

```bash
teamgrid task-recurrences occurrences retry [options] <series-id> <occurrence-key>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `retryTaskRecurrenceOccurrence` | `POST /task-recurrences/{id}/occurrences/{occurrenceKey}/retry` | `task-recurrences:write` | [Retry a failed task recurrence occurrence](/api/v1/reference/operations/retrytaskrecurrenceoccurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `series-id` | Yes | No | — | — | Identifier or value named by the command syntax. |
| `occurrence-key` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task recurrence occurrence revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences occurrences retry SERIES_ID OCCURRENCE_KEY --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences recheck

Recheck a task recurrence asynchronously.

### Syntax

```bash
teamgrid task-recurrences recheck [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `recheckTaskRecurrence` | `POST /task-recurrences/{id}/recheck` | `task-recurrences:write` | [Recheck a task recurrence asynchronously](/api/v1/reference/operations/rechecktaskrecurrence/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--wait` | wait until the asynchronous recheck finishes | No | — | — |
| `--poll-interval <milliseconds>` | poll interval while waiting | No | — | `1000` |
| `--max-wait <milliseconds>` | maximum wait time | No | — | `300000` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences recheck ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid task-recurrences events submit

Submit an event to a task recurrence.

### Syntax

```bash
teamgrid task-recurrences events submit [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `submitTaskRecurrenceEvent` | `POST /task-recurrences/{id}/events` | `task-recurrences:run` | [Submit an event to a task recurrence](/api/v1/reference/operations/submittaskrecurrenceevent/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | event envelope JSON | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid task-recurrences events submit ID --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
