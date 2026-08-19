---
title: "teamgrid api-version"
description: "1 executable @teamgrid/cli commands in the api-version group, generated from CLI 1.1.0."
owner: Developer Experience
reviewedAt: 2026-08-19
---

> Generated from `@teamgrid/cli@1.1.0` at Developer Platform commit `884fa0807e6c`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

discover the TeamGrid API version.

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

- [`teamgrid api-version`](#teamgrid-api-version) — discover the TeamGrid API version.

## teamgrid api-version

discover the TeamGrid API version.

### Syntax

```bash
teamgrid api-version [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `getApiVersion` | `GET /` | Anonymous protocol | [Discover API v1](/api/v1/reference/operations/getapiversion/) |


### Command options

This command defines no additional options.

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

The command uses the global output mode: human-readable `table` by default, or machine-readable `json`/`jsonl`.

### Example

```bash
teamgrid api-version
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
