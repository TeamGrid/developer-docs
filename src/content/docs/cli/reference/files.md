---
title: "teamgrid files"
description: "6 executable @teamgrid/cli commands in the files group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-18
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `bd139c5ebb3f`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and manage file metadata.

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

- [`teamgrid files list`](#teamgrid-files-list) — List public-space file metadata.
- [`teamgrid files get`](#teamgrid-files-get) — Get file metadata.
- [`teamgrid files rename`](#teamgrid-files-rename) — Rename a file.
- [`teamgrid files archive`](#teamgrid-files-archive) — Archive a file.
- [`teamgrid files restore`](#teamgrid-files-restore) — Restore a file.
- [`teamgrid files download-intent`](#teamgrid-files-download-intent) — Create a file download intent.

## teamgrid files list

List public-space file metadata.

### Syntax

```bash
teamgrid files list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listFiles` | `GET /files` | `files:read` | [List public-space file metadata](/api/v1/reference/operations/listfiles/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–100) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--archived <boolean>` | return archived files | No | — | — |
| `--entity-type <type>` | filter by owning entity type | No | `comment`, `contact`, `customField`, `outcome`, `project`, `streamItem`, `task`, `team` | — |
| `--entity-id <id>` | filter by owning entity ID | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid files list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid files get

Get file metadata.

### Syntax

```bash
teamgrid files get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getFile` | `GET /files/{id}` | `files:read` | [Get file metadata](/api/v1/reference/operations/getfile/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--archived <boolean>` | allow an archived file | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid files get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid files rename

Rename a file.

### Syntax

```bash
teamgrid files rename [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `renameFile` | `PATCH /files/{id}` | `files:write` | [Rename a file](/api/v1/reference/operations/renamefile/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | file rename JSON | Yes | — | — |
| `--if-match <etag>` | latest strong file ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid files rename ID --data @request.json --if-match ETAG
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid files archive

Archive a file.

### Syntax

```bash
teamgrid files archive [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `archiveFile` | `DELETE /files/{id}` | `files:write` | [Archive a file](/api/v1/reference/operations/archivefile/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <etag>` | latest strong file ETag | Yes | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid files archive ID --if-match ETAG
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid files restore

Restore a file.

### Syntax

```bash
teamgrid files restore [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `restoreFile` | `POST /files/{id}/restore` | `files:write` | [Restore a file](/api/v1/reference/operations/restorefile/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <etag>` | latest strong file ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid files restore ID --if-match ETAG
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid files download-intent

Create a file download intent.

### Syntax

```bash
teamgrid files download-intent [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `createFileDownloadIntent` | `POST /files/{id}/download-intent` | `files:read` | [Create a file download intent](/api/v1/reference/operations/createfiledownloadintent/) |

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
teamgrid files download-intent ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
