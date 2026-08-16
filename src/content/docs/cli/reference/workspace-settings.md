---
title: "teamgrid workspace-settings"
description: "2 executable @teamgrid/cli commands in the workspace-settings group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `9ec0a7d4e32a`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

read and update public workspace settings.

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

- [`teamgrid workspace-settings get`](#teamgrid-workspace-settings-get) — Get public workspace settings.
- [`teamgrid workspace-settings update`](#teamgrid-workspace-settings-update) — Update public workspace settings.

## teamgrid workspace-settings get

Get public workspace settings.

### Syntax

```bash
teamgrid workspace-settings get [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getWorkspaceSettings` | `GET /workspace/settings` | `workspace-settings:read` | [Get public workspace settings](/api/v1/reference/operations/getworkspacesettings/) |


### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid workspace-settings get
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid workspace-settings update

Update public workspace settings.

### Syntax

```bash
teamgrid workspace-settings update [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `updateWorkspaceSettings` | `PATCH /workspace/settings` | `workspace-settings:write` | [Update public workspace settings](/api/v1/reference/operations/updateworkspacesettings/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--data <json\|@file\|->` | workspace settings patch JSON | Yes | — | — |
| `--if-match <revision\|etag>` | latest workspace settings revision or strong ETag | Yes | — | — |
| `--idempotency-key <key>` | stable retry key | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid workspace-settings update --data @request.json --if-match REVISION
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
