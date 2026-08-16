---
title: "teamgrid projects"
description: "10 executable @teamgrid/cli commands in the projects group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `31706a2278ce`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and mutate projects.

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

- [`teamgrid projects list`](#teamgrid-projects-list) — List projects.
- [`teamgrid projects get`](#teamgrid-projects-get) — Get a project.
- [`teamgrid projects create`](#teamgrid-projects-create) — Create a project.
- [`teamgrid projects update`](#teamgrid-projects-update) — Update a project.
- [`teamgrid projects sharing get`](#teamgrid-projects-sharing-get) — Get project sharing.
- [`teamgrid projects sharing replace`](#teamgrid-projects-sharing-replace) — Replace project sharing.
- [`teamgrid projects complete`](#teamgrid-projects-complete) — Complete a project asynchronously.
- [`teamgrid projects reopen`](#teamgrid-projects-reopen) — Reopen a project asynchronously.
- [`teamgrid projects restore`](#teamgrid-projects-restore) — Restore a project asynchronously.
- [`teamgrid projects archive`](#teamgrid-projects-archive) — Archive a project asynchronously.

## teamgrid projects list

List projects.

### Syntax

```bash
teamgrid projects list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listProjects` | `GET /projects` | `projects:read` | [List projects](/api/v1/reference/operations/listprojects/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived projects | No | — | — |
| `--completed <boolean>` | filter completion | No | — | — |
| `--contact-id <id>` | filter by primary contact | No | — | — |
| `--created-by-id <id>` | filter by creator | No | — | — |
| `--individual-id <id>` | filter by individual project id | No | — | — |
| `--list-id <id>` | filter by project list | No | — | — |
| `--manager-id <id>` | filter by manager | No | — | — |
| `--subscriber-id <id>` | filter by subscriber | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid projects list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects get

Get a project.

### Syntax

```bash
teamgrid projects get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getProject` | `GET /projects/{id}` | `projects:read` | [Get a project](/api/v1/reference/operations/getproject/) |

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
teamgrid projects get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects create

Create a project.

### Syntax

```bash
teamgrid projects create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createProject` | `POST /projects` | `projects:write` | [Create a project](/api/v1/reference/operations/createproject/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | project create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid projects create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects update

Update a project.

### Syntax

```bash
teamgrid projects update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateProject` | `PATCH /projects/{id}` | `projects:write` | [Update a project](/api/v1/reference/operations/updateproject/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | project patch JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest project revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid projects update ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects sharing get

Get project sharing.

### Syntax

```bash
teamgrid projects sharing get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getProjectSharing` | `GET /projects/{id}/sharing` | `projects:sharing` | [Get project sharing](/api/v1/reference/operations/getprojectsharing/) |

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
teamgrid projects sharing get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects sharing replace

Replace project sharing.

### Syntax

```bash
teamgrid projects sharing replace [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `replaceProjectSharing` | `PUT /projects/{id}/sharing` | `projects:sharing` | [Replace project sharing](/api/v1/reference/operations/replaceprojectsharing/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | complete project sharing entry set JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest project revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid projects sharing replace ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects complete

Complete a project asynchronously.

### Syntax

```bash
teamgrid projects complete [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `completeProject` | `POST /projects/{id}/complete` | `projects:lifecycle` | [Complete a project asynchronously](/api/v1/reference/operations/completeproject/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--wait` | wait until the asynchronous operation finishes | No | — | — |
| `--poll-interval <milliseconds>` | poll interval while waiting | No | — | `1000` |
| `--max-wait <milliseconds>` | maximum wait time | No | — | `300000` |
| `--if-match <revision\|etag>` | latest project revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid projects complete ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects reopen

Reopen a project asynchronously.

### Syntax

```bash
teamgrid projects reopen [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `reopenProject` | `POST /projects/{id}/reopen` | `projects:lifecycle` | [Reopen a project asynchronously](/api/v1/reference/operations/reopenproject/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--wait` | wait until the asynchronous operation finishes | No | — | — |
| `--poll-interval <milliseconds>` | poll interval while waiting | No | — | `1000` |
| `--max-wait <milliseconds>` | maximum wait time | No | — | `300000` |
| `--if-match <revision\|etag>` | latest project revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid projects reopen ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects restore

Restore a project asynchronously.

### Syntax

```bash
teamgrid projects restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreProject` | `POST /projects/{id}/restore` | `projects:lifecycle` | [Restore a project asynchronously](/api/v1/reference/operations/restoreproject/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--wait` | wait until the asynchronous operation finishes | No | — | — |
| `--poll-interval <milliseconds>` | poll interval while waiting | No | — | `1000` |
| `--max-wait <milliseconds>` | maximum wait time | No | — | `300000` |
| `--if-match <revision\|etag>` | latest project revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid projects restore ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid projects archive

Archive a project asynchronously.

### Syntax

```bash
teamgrid projects archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveProject` | `POST /projects/{id}/archive` | `projects:lifecycle` | [Archive a project asynchronously](/api/v1/reference/operations/archiveproject/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |
| `--wait` | wait until the asynchronous operation finishes | No | — | — |
| `--poll-interval <milliseconds>` | poll interval while waiting | No | — | `1000` |
| `--max-wait <milliseconds>` | maximum wait time | No | — | `300000` |
| `--if-match <revision\|etag>` | latest project revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid projects archive ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
