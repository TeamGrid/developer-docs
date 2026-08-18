---
title: "teamgrid members"
description: "4 executable @teamgrid/cli commands in the members group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-18
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `bd139c5ebb3f`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and administer workspace members.

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

- [`teamgrid members list`](#teamgrid-members-list) — List workspace members.
- [`teamgrid members get`](#teamgrid-members-get) — Get a workspace member.
- [`teamgrid members update-role`](#teamgrid-members-update-role) — Change a member role.
- [`teamgrid members remove`](#teamgrid-members-remove) — Remove a workspace member.

## teamgrid members list

List workspace members.

### Syntax

```bash
teamgrid members list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listMembers` | `GET /members` | `members:read` | [List workspace members](/api/v1/reference/operations/listmembers/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–100) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--include-pii` | include explicitly scoped member profile fields | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid members list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid members get

Get a workspace member.

### Syntax

```bash
teamgrid members get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getMember` | `GET /members/{id}` | `members:read` | [Get a workspace member](/api/v1/reference/operations/getmember/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--include-pii` | include explicitly scoped member profile fields | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid members get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid members update-role

Change a member role.

### Syntax

```bash
teamgrid members update-role [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateMemberRole` | `PATCH /members/{id}/role` | `members:write` | [Change a member role](/api/v1/reference/operations/updatememberrole/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | member role update JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest member revision or strong ETag | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid members update-role ID --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid members remove

Remove a workspace member.

### Syntax

```bash
teamgrid members remove [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `removeMember` | `DELETE /members/{id}` | `members:write` | [Remove a workspace member](/api/v1/reference/operations/removemember/) |

### Arguments

| Argument | Required | Variadic | Choices | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | Yes | No | — | — | Identifier or value named by the command syntax. |

### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--if-match <revision\|etag>` | latest member revision or strong ETag | Yes | — | — |
| `-y, --yes` | skip the destructive-operation confirmation | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Confirmation and automation

This command can change or remove data and asks for confirmation by default. In a reviewed non-interactive job, pass `--yes` or set `TEAMGRID_CLI_ASSUME_YES=1`; otherwise the command exits with code `2`. Cancelling an interactive confirmation exits with code `0`.

### Example

```bash
teamgrid members remove ID --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
