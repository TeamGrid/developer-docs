---
title: "teamgrid project-templates"
description: "7 executable @teamgrid/cli commands in the project-templates group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `9ec0a7d4e32a`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and manage reusable project templates.

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

- [`teamgrid project-templates list`](#teamgrid-project-templates-list) — List project templates.
- [`teamgrid project-templates get`](#teamgrid-project-templates-get) — Get project-template metadata.
- [`teamgrid project-templates create`](#teamgrid-project-templates-create) — Capture a project as a template.
- [`teamgrid project-templates update`](#teamgrid-project-templates-update) — Update project-template metadata.
- [`teamgrid project-templates archive`](#teamgrid-project-templates-archive) — Archive a project template.
- [`teamgrid project-templates restore`](#teamgrid-project-templates-restore) — Restore an archived project template.
- [`teamgrid project-templates instantiate`](#teamgrid-project-templates-instantiate) — Instantiate a project template asynchronously.

## teamgrid project-templates list

List project templates.

### Syntax

```bash
teamgrid project-templates list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listProjectTemplates` | `GET /project-templates` | `project-templates:read` | [List project templates](/api/v1/reference/operations/listprojecttemplates/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived templates | No | — | — |
| `--created-at-from <date>` | filter by earliest creation timestamp | No | — | — |
| `--created-at-to <date>` | filter by latest creation timestamp | No | — | — |
| `--origin-project-id <id>` | filter by source project | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid project-templates list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-templates get

Get project-template metadata.

### Syntax

```bash
teamgrid project-templates get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getProjectTemplate` | `GET /project-templates/{id}` | `project-templates:read` | [Get project-template metadata](/api/v1/reference/operations/getprojecttemplate/) |

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
teamgrid project-templates get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-templates create

Capture a project as a template.

### Syntax

```bash
teamgrid project-templates create [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createProjectTemplate` | `POST /project-templates` | `project-templates:write` | [Capture a project as a template](/api/v1/reference/operations/createprojecttemplate/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | project-template create JSON | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid project-templates create --data @request.json
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-templates update

Update project-template metadata.

### Syntax

```bash
teamgrid project-templates update [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateProjectTemplate` | `PATCH /project-templates/{id}` | `project-templates:write` | [Update project-template metadata](/api/v1/reference/operations/updateprojecttemplate/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | project-template patch JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest project-template revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid project-templates update ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-templates archive

Archive a project template.

### Syntax

```bash
teamgrid project-templates archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveProjectTemplate` | `DELETE /project-templates/{id}` | `project-templates:write` | [Archive a project template](/api/v1/reference/operations/archiveprojecttemplate/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |
| `--if-match <revision\|etag>` | latest project-template revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid project-templates archive ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-templates restore

Restore an archived project template.

### Syntax

```bash
teamgrid project-templates restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreProjectTemplate` | `POST /project-templates/{id}/restore` | `project-templates:write` | [Restore an archived project template](/api/v1/reference/operations/restoreprojecttemplate/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest project-template revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid project-templates restore ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid project-templates instantiate

Instantiate a project template asynchronously.

### Syntax

```bash
teamgrid project-templates instantiate [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `instantiateProjectTemplate` | `POST /project-templates/{id}/instantiate` | `project-templates:write` | [Instantiate a project template asynchronously](/api/v1/reference/operations/instantiateprojecttemplate/) |

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
| `--data <json\|@file\|->` | project-template instantiation JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest project-template revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid project-templates instantiate ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
