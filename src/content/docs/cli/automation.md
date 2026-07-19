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

For `changes list`, one page is the default and there is no implicit wait loop. In JSONL mode each
change is wrapped as `{"kind":"change","data":...}` and every page ends with a separate
`{"kind":"checkpoint","cursor":"...","caughtUp":true|false}` record. Commit the checkpoint only
after the earlier change records are durable and continue until `caughtUp` is true. Use `changes
checkpoint` before the initial full snapshot; see the
[race-free synchronization recipe](/api/v1/change-feed/).

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
Treat `412` as a concurrent-edit decision, not a generic retry. Planned-work replacement overwrites
the complete schedule and requires `--yes` in non-interactive execution.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success or an interactively cancelled action |
| `1` | Unexpected, server, or network failure |
| `2` | Invalid local input or configuration |
| `3` | Authentication failed (`401`) |
| `4` | Permission denied (`403`) |
| `5` | Resource not found (`404`) |
| `6` | Conflict (`409`) |
| `7` | Rate limited (`429`) |

Do not parse human-readable error messages to decide control flow. Use the exit code and, when needed, call API v1 through the SDK for typed error details.

## CI checklist

- Store `TEAMGRID_API_TOKEN` in the CI secret store and mask it in logs.
- Grant only the scopes the job needs.
- Use JSON or JSONL output.
- Use stable idempotency keys for creates.
- Set explicit timeout, retries, and pagination bounds for long-running jobs.
- Add `--yes` only to reviewed archive, remove, clear, or full-replacement steps.
