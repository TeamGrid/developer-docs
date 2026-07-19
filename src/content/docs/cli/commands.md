---
title: CLI commands
description: Command groups, filters, input formats, and output controls supported by the TeamGrid CLI.
---

## Global options

Global options can be placed before a command group.

| Option | Purpose |
| --- | --- |
| `--profile <name>` | Select a saved credential profile |
| `--output table\|json\|jsonl` | Choose human or machine-readable output |
| `--base-url <url>` | Override the derived regional URL for controlled staging or loopback use |
| `--timeout <milliseconds>` | Set the request timeout; default is 30 seconds |
| `--retries <0–5>` | Set bounded safe-request retries; default is 2 |

## Authentication and workspace

```text
teamgrid auth login [--token-stdin]
teamgrid auth logout
teamgrid auth profiles
teamgrid auth status [--check]
teamgrid workspace
```

## Read resources

```text
teamgrid projects list|get
teamgrid contacts list|get
teamgrid users
teamgrid lists
teamgrid services
teamgrid tags
teamgrid audit-events
```

List commands accept `--limit`, `--cursor`, `--all`, and `--max-pages`. Resource-specific filters are visible through `teamgrid <command> --help`.

Examples:

```bash
teamgrid projects list --completed false
teamgrid contacts list --type company --all --output json
teamgrid audit-events --outcome denied --output jsonl
```

## Tasks

```bash
teamgrid tasks list --project-id PROJECT_ID --completed false
teamgrid tasks get TASK_ID --output json
teamgrid tasks create --data @task.json --idempotency-key task-import-42
teamgrid tasks update TASK_ID --data '{"completed":true}'
teamgrid tasks archive TASK_ID
```

## Time entries

`time-entries` also has the alias `times`.

```bash
teamgrid time-entries list --from 2026-07-01 --to 2026-07-31 --all
teamgrid times get TIME_ENTRY_ID
teamgrid times create --data @time-entry.json --idempotency-key time-import-42
teamgrid times update TIME_ENTRY_ID --data @time-entry-patch.json
teamgrid times archive TIME_ENTRY_ID
```

## Webhooks

```bash
teamgrid webhooks list
teamgrid webhooks get WEBHOOK_ID
teamgrid webhooks create --data @webhook.json --idempotency-key webhook-42
teamgrid webhooks remove WEBHOOK_ID
```

`--data` accepts inline JSON, `@path/to/file.json`, or `-` for standard input. Archive and remove commands ask for confirmation; use `--yes` only in an intentionally non-interactive workflow.
