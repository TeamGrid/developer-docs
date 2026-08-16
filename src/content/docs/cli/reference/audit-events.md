---
title: "teamgrid audit-events"
description: "1 executable @teamgrid/cli commands in the audit-events group, generated from CLI 1.0.7."
owner: Developer Experience
reviewedAt: 2026-08-16
---

> Generated from `@teamgrid/cli@1.0.7` at Developer Platform commit `9ec0a7d4e32a`. Run `node scripts/sync-cli-reference.mjs --check` to detect drift; do not edit this page manually.

list Developer Platform audit events.

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

- [`teamgrid audit-events`](#teamgrid-audit-events) — list Developer Platform audit events.

## teamgrid audit-events

list Developer Platform audit events.

### Syntax

```bash
teamgrid audit-events [options]
```

### API operation and scope

| Operation | HTTP | Scope | API reference |
| --- | --- | --- | --- |
| `listAuditEvents` | `GET /audit-events` | `audit:read` | [List developer audit events](/api/v1/reference/operations/listauditevents/) |


### Command options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `--all` | read every page | No | — | — |
| `--cursor <cursor>` | resume from an opaque cursor | No | — | — |
| `--limit <number>` | resources per page (1–200) | No | — | — |
| `--max-pages <number>` | safety limit for --all (1–10000) | No | — | `10000` |
| `--actor-id <id>` | filter by actor | No | — | — |
| `--actor-type <type>` | filter actor type | No | `user`, `serviceCredential`, `system` | — |
| `--created-at-from <timestamp>` | include events at or after this time | No | — | — |
| `--created-at-to <timestamp>` | include events at or before this time | No | — | — |
| `--credential-id <id>` | filter by credential | No | — | — |
| `--event-type <type>` | filter by event type | No | — | — |
| `--outcome <outcome>` | filter outcome | No | `success`, `denied`, `failure` | — |
| `--request-id <id>` | filter by request id | No | — | — |
| `--source <source>` | filter event source | No | `teamgrid-app`, `api-v1`, `system` | — |
| `--target-id <id>` | filter by target id | No | — | — |
| `--target-type <type>` | filter by target type | No | — | — |

The [global options](#global-options) and implicit `-h, --help` option also apply.

### Output

Without `--all`, table output renders the page data and JSON preserves the complete page envelope. With `--all`, table and JSON aggregate all traversed resources while JSONL streams one resource per line.

### Example

```bash
teamgrid audit-events
```

### Exit codes

The command uses the [stable CLI exit codes](/cli/automation/#exit-codes) (`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `130`). See the linked table for the meaning and automation behavior of each code.
