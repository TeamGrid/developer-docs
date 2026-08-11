---
title: "teamgrid availability"
description: "1 executable @teamgrid/cli commands in the availability group, generated from CLI 1.0.6."
owner: Developer Experience
reviewedAt: 2026-08-10
---

> Generated from `@teamgrid/cli@1.0.6` at Developer Platform commit `e6f6b47fa223`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

inspect derived availability.

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

- [`teamgrid availability list`](#teamgrid-availability-list) — List user availability.

## teamgrid availability list

List user availability.

### Syntax

```bash
teamgrid availability list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listAvailability` | `GET /availability` | `availability:read` | [List user availability](/api/v1/reference/operations/listavailability/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--start <date-time>` | inclusive availability interval start | Yes | — | — |
| `--end <date-time>` | exclusive availability interval end | Yes | — | — |
| `--time-zone <iana-zone>` | IANA time zone for returned intervals | Yes | — | — |
| `--user-id <id,...>` | select up to 50 user IDs (repeat or comma-separate) | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid availability list --start DATE_TIME --end DATE_TIME --time-zone IANA_ZONE
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
