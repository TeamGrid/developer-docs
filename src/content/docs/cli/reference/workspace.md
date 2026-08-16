---
title: "teamgrid workspace"
description: "2 executable @teamgrid/cli commands in the workspace group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `9ec0a7d4e32a`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

inspect the authenticated workspace.

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

- [`teamgrid workspace`](#teamgrid-workspace) — inspect the authenticated workspace.
- [`teamgrid workspace entitlements`](#teamgrid-workspace-entitlements) — Get public workspace entitlements.

## teamgrid workspace

inspect the authenticated workspace.

### Syntax

```bash
teamgrid workspace [options] [command]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getWorkspace` | `GET /workspace` | `workspace:read` | [Get the authenticated workspace](/api/v1/reference/operations/getworkspace/) |


### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid workspace
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid workspace entitlements

Get public workspace entitlements.

### Syntax

```bash
teamgrid workspace entitlements [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getWorkspaceEntitlements` | `GET /workspace/entitlements` | `workspace:read` | [Get public workspace entitlements](/api/v1/reference/operations/getworkspaceentitlements/) |


### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid workspace entitlements
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
