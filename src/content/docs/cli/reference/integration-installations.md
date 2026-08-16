---
title: "teamgrid integration-installations"
description: "1 executable @teamgrid/cli commands in the integration-installations group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `31706a2278ce`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

inspect redacted integration installation metadata.

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

- [`teamgrid integration-installations list`](#teamgrid-integration-installations-list) — List integration installation status.

## teamgrid integration-installations list

List integration installation status.

### Syntax

```bash
teamgrid integration-installations list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listIntegrationInstallations` | `GET /integration-installations` | `integrations:read` | [List integration installation status](/api/v1/reference/operations/listintegrationinstallations/) |


### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid integration-installations list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
