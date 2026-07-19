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

## Make retried writes idempotent

Supply a stable, operation-specific idempotency key for creates:

```bash
teamgrid tasks create \
  --data @task.json \
  --idempotency-key "sync-${RUN_ID}-${SOURCE_TASK_ID}" \
  --output json
```

GET requests and POST requests carrying an idempotency key can be retried after bounded transient failures. PATCH and DELETE are not retried automatically.

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
- Add `--yes` only to reviewed archive or remove steps.
