---
title: "teamgrid activity"
description: "1 executable @teamgrid/cli commands in the activity group, generated from CLI 1.0.6."
owner: Developer Experience
reviewedAt: 2026-08-10
---

> Generated from `@teamgrid/cli@1.0.6` at Developer Platform commit `c813667fdaf9`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

inspect target-owned activity.

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

- [`teamgrid activity list`](#teamgrid-activity-list) — List target activity.

## teamgrid activity list

List target activity.

### Syntax

```bash
teamgrid activity list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listActivity` | `GET /activity` | `activity:read` | [List target activity](/api/v1/reference/operations/listactivity/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–100) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--target-type <type>` | target resource type | Yes | `contact`, `project`, `task` | — |
| `--target-id <id>` | target resource ID | Yes | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid activity list --target-type TYPE --target-id ID
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
