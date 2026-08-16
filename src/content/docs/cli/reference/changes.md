---
title: "teamgrid changes"
description: "2 executable @teamgrid/cli commands in the changes group, generated from CLI 1.0.6."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.6` at Developer Platform commit `0c7c3a56ea99`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

create checkpoints and read the cell-local change feed.

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

- [`teamgrid changes checkpoint`](#teamgrid-changes-checkpoint) — create an empty checkpoint at the latest sequence.
- [`teamgrid changes list`](#teamgrid-changes-list) — read one change page.

## teamgrid changes checkpoint

create an empty checkpoint at the latest sequence.

### Syntax

```bash
teamgrid changes checkpoint [options]
```

### API operation and scope

This is an alternative CLI form of `teamgrid changes list` and calls the same API operation.

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listChanges` | `GET /changes` | `changes:read` | [List cell-local resource changes](/api/v1/reference/operations/listchanges/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--operation <operation>` | filter operation; repeat or comma-separate | No | — | `[]` |
| `--resource-type <type>` | filter resource type; repeat or comma-separate | No | — | `[]` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid changes checkpoint
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.

## teamgrid changes list

read one change page.

### Syntax

```bash
teamgrid changes list [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listChanges` | `GET /changes` | `changes:read` | [List cell-local resource changes](/api/v1/reference/operations/listchanges/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--operation <operation>` | filter operation; repeat or comma-separate | No | — | `[]` |
| `--resource-type <type>` | filter resource type; repeat or comma-separate | No | — | `[]` |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

JSON preserves the complete change page. JSONL emits change records followed by a checkpoint record; table mode renders changes and then the current checkpoint.

### Example

```bash
teamgrid changes list
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
