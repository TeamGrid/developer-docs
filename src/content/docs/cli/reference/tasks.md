---
title: "teamgrid tasks"
description: "14 executable @teamgrid/cli commands in the tasks group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-19
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `884fa0807e6c`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and mutate tasks.

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

- [`teamgrid tasks list`](#teamgrid-tasks-list) — List tasks.
- [`teamgrid tasks get`](#teamgrid-tasks-get) — Get a task.
- [`teamgrid tasks create`](#teamgrid-tasks-create) — Create a task.
- [`teamgrid tasks update`](#teamgrid-tasks-update) — Update a task.
- [`teamgrid tasks bulk-update`](#teamgrid-tasks-bulk-update) — update up to 35 tasks with per-item revisions; successful items remain committed.
- [`teamgrid tasks duplicate`](#teamgrid-tasks-duplicate) — duplicate a task and optionally its checklist and custom-field values.
- [`teamgrid tasks move`](#teamgrid-tasks-move) — move or reorder a task in an assignee, personal, or project list.
- [`teamgrid tasks subtasks replace`](#teamgrid-tasks-subtasks-replace) — atomically replace the ordered task checklist.
- [`teamgrid tasks archive`](#teamgrid-tasks-archive) — Archive a task.
- [`teamgrid tasks complete`](#teamgrid-tasks-complete) — Complete a task.
- [`teamgrid tasks restore`](#teamgrid-tasks-restore) — Restore an archived task.
- [`teamgrid tasks reopen`](#teamgrid-tasks-reopen) — Reopen a completed task.
- [`teamgrid tasks timer start`](#teamgrid-tasks-timer-start) — Start task time tracking.
- [`teamgrid tasks timer stop`](#teamgrid-tasks-timer-stop) — Stop task time tracking.

## teamgrid tasks list

List tasks.

### Syntax

```bash
teamgrid tasks list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listTasks` | `GET /tasks` | `tasks:read` | [List tasks](/api/v1/reference/operations/listtasks/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived tasks | No | — | — |
| `--completed <boolean>` | filter completion | No | — | — |
| `--project-id <id>` | filter by project | No | — | — |
| `--assignee-id <id>` | filter by assignee | No | — | — |
| `--contact-id <id>` | filter by contact | No | — | — |
| `--group-id <id>` | filter by group | No | — | — |
| `--list-id <id>` | filter by task list | No | — | — |
| `--personal-list-id <id>` | filter by personal list | No | — | — |
| `--service-id <id>` | filter by service | No | — | — |
| `--subscriber-id <id>` | filter by subscriber | No | — | — |
| `--tag-id <id>` | filter by tag | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid tasks list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks get

Get a task.

### Syntax

```bash
teamgrid tasks get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getTask` | `GET /tasks/{id}` | `tasks:read` | [Get a task](/api/v1/reference/operations/gettask/) |

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
teamgrid tasks get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks create

Create a task.

### Syntax

```bash
teamgrid tasks create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createTask` | `POST /tasks` | `tasks:write` | [Create a task](/api/v1/reference/operations/createtask/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | task create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks update

Update a task.

### Syntax

```bash
teamgrid tasks update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateTask` | `PATCH /tasks/{id}` | `tasks:write` | [Update a task](/api/v1/reference/operations/updatetask/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | task patch JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest task revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks update ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks bulk-update

update up to 35 tasks with per-item revisions; successful items remain committed.

### Syntax

```bash
teamgrid tasks bulk-update [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `bulkUpdateTasks` | `POST /tasks/bulk-update` | `tasks:write` | [Update multiple tasks safely](/api/v1/reference/operations/bulkupdatetasks/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | JSON with ordered items containing id, revision, and data | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks bulk-update --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks duplicate

duplicate a task and optionally its checklist and custom-field values.

### Syntax

```bash
teamgrid tasks duplicate [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `duplicateTask` | `POST /tasks/{id}/duplicate` | `tasks:read` | [Duplicate a task](/api/v1/reference/operations/duplicatetask/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | task duplication JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest source task revision or strong ETag | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks duplicate ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks move

move or reorder a task in an assignee, personal, or project list.

### Syntax

```bash
teamgrid tasks move [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `moveTask` | `POST /tasks/{id}/move` | `tasks:write` | [Move or reorder a task](/api/v1/reference/operations/movetask/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | task placement JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest task revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks move ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks subtasks replace

atomically replace the ordered task checklist.

### Syntax

```bash
teamgrid tasks subtasks replace [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `replaceTaskSubtasks` | `PUT /tasks/{id}/subtasks` | `tasks:write` | [Replace a task checklist](/api/v1/reference/operations/replacetasksubtasks/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | checklist replacement JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest task revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks subtasks replace ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks archive

Archive a task.

### Syntax

```bash
teamgrid tasks archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveTask` | `DELETE /tasks/{id}` | `tasks:write` | [Archive a task](/api/v1/reference/operations/archivetask/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |
| `--if-match <revision\|etag>` | latest task revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid tasks archive ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks complete

Complete a task.

### Syntax

```bash
teamgrid tasks complete [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `completeTask` | `POST /tasks/{id}/complete` | `tasks:write` | [Complete a task](/api/v1/reference/operations/completetask/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks complete ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks restore

Restore an archived task.

### Syntax

```bash
teamgrid tasks restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreTask` | `POST /tasks/{id}/restore` | `tasks:write` | [Restore an archived task](/api/v1/reference/operations/restoretask/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks restore ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks reopen

Reopen a completed task.

### Syntax

```bash
teamgrid tasks reopen [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `reopenTask` | `POST /tasks/{id}/reopen` | `tasks:write` | [Reopen a completed task](/api/v1/reference/operations/reopentask/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest task revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks reopen ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks timer start

Start task time tracking.

### Syntax

```bash
teamgrid tasks timer start [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `startTaskTimer` | `POST /tasks/{id}/timer/start` | `tasks:write` | [Start task time tracking](/api/v1/reference/operations/starttasktimer/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--user-id <id>` | workspace user whose timer should start | Yes | — | — |
| `--at <date>` | start timestamp; defaults to the API receive time | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks timer start ID --user-id ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid tasks timer stop

Stop task time tracking.

### Syntax

```bash
teamgrid tasks timer stop [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `stopTaskTimer` | `POST /tasks/{id}/timer/stop` | `tasks:write` | [Stop task time tracking](/api/v1/reference/operations/stoptasktimer/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--user-id <id>` | workspace user whose timer should stop | Yes | — | — |
| `--at <date>` | stop timestamp; defaults to the API receive time | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid tasks timer stop ID --user-id ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
