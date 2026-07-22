---
title: CLI automation
description: Use TeamGrid CLI output modes, pagination, idempotency, and exit codes safely in scripts and CI.
---

## Prefer structured output

Use `--output json` for one response and `--output jsonl` for a stream of resources. Table output is intended for humans and may evolve for readability.

```bash
teamgrid tasks list --project-id "$PROJECT_ID" --all --output jsonl \
  | jq -r '.id'
```

`--all` follows opaque cursors and stops at 10,000 pages by default. Lower the guard with `--max-pages` when a job should have a tighter upper bound.

The first public beta has no change-feed commands. For bounded reconciliation, traverse the
resource list commands with `--all`, preserve resource IDs and revisions, and use signed webhooks as
delivery signals where supported. Do not substitute audit or webhook-delivery history for a durable
feed.

## Make retried writes idempotent

Supply a stable, operation-specific idempotency key for creates:

```bash
teamgrid tasks create \
  --data @task.json \
  --idempotency-key "sync-${RUN_ID}-${SOURCE_TASK_ID}" \
  --output json
```

GET requests, POST requests carrying an idempotency key, and compare-and-set planned-work PUTs with
an idempotency key can be retried after bounded transient failures. Other PUT, PATCH, and DELETE
requests are not retried automatically.

Custom-field-value and planned-work writes also require the revision returned by the latest GET.
For example, read a custom-field value before changing it:

```bash
revision=$(teamgrid custom-field-values get project "$PROJECT_ID" "$FIELD_ID" \
  --output json | jq -er '.attributes.revision')

if ! teamgrid custom-field-values set project "$PROJECT_ID" "$FIELD_ID" \
  --data @value.json --if-match "$revision" --output json; then
  # Re-read and reconcile here. Do not substitute the old revision.
  exit 1
fi
```

Treat `412` and exit code `6` as a concurrent-edit decision, not a generic retry. Missing
`--if-match` is rejected locally; an API `428` maps to usage exit code `2`. Planned-work replacement
overwrites the complete schedule and requires `--yes` in non-interactive execution. Project, task,
and project-template commands use the static Beta 2 contract and do not accept `--if-match`.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success or an interactively cancelled action |
| `1` | Unexpected, server, or network failure |
| `2` | Invalid local input or configuration, including a missing required precondition |
| `3` | Authentication failed (`401`) |
| `4` | Permission denied (`403`) |
| `5` | Resource not found (`404`) |
| `6` | Conflict (`409`) or stale precondition (`412`) |
| `7` | Rate limited (`429`) |

Do not parse human-readable error messages to decide control flow. Use the exit code and, when needed, call API v1 through the SDK for typed error details.

## CI checklist

- Store `TEAMGRID_API_TOKEN` in the CI secret store and mask it in logs.
- Grant only the scopes the job needs.
- Use JSON or JSONL output.
- Use stable idempotency keys for creates.
- Set explicit timeout, retries, and pagination bounds for long-running jobs.
- Add `--yes` only to reviewed archive, remove, clear, or full-replacement steps.
