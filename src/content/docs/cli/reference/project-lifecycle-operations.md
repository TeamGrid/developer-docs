---
title: "teamgrid project-lifecycle-operations"
description: "1 executable @teamgrid/cli commands in the project-lifecycle-operations group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `31706a2278ce`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

inspect asynchronous project lifecycle operations.

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

- [`teamgrid project-lifecycle-operations get`](#teamgrid-project-lifecycle-operations-get) — Get a project lifecycle operation.

## teamgrid project-lifecycle-operations get

Get a project lifecycle operation.

### Syntax

```bash
teamgrid project-lifecycle-operations get [options] <id>
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getProjectLifecycleOperation` | `GET /project-lifecycle-operations/{id}` | `projects:lifecycle` | [Get a project lifecycle operation](/api/v1/reference/operations/getprojectlifecycleoperation/) |

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
teamgrid project-lifecycle-operations get ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
