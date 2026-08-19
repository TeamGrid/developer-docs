---
title: CLI command reference
description: Exact syntax, arguments, options, API operations, scopes, output behavior, safety notes, examples, and exit codes for every TeamGrid CLI command.
owner: Developer Experience
reviewedAt: 2026-08-19
---

This reference is generated from the real `@teamgrid/cli@1.1.0` Commander tree and the public API capability manifest. It covers all 243 executable commands in 54 top-level groups, including 173 argument and 569 command-option definitions plus 6 global options. Its 236 canonical CLI paths map to all 237 API v1 operations.

Use [CLI commands](/cli/commands/) for workflow-oriented guidance and this reference when you need exact terminal syntax. Run `teamgrid --version` before comparing an installed CLI with this release.

## Global options

| Option | Description | Required | Choices | Default |
| --- | --- | --- | --- | --- |
| `-V, --version` | output the version number | No | — | — |
| `-o, --output <format>` | output format | No | `table`, `json`, `jsonl` | `table` |
| `--profile <name>` | credential profile | No | — | — |
| `--base-url <url>` | override the regional API v1 base URL | No | — | — |
| `--timeout <milliseconds>` | request timeout | No | — | `30000` |
| `--retries <count>` | safe-request retry count (0–5) | No | — | `2` |

Every command also accepts the implicit `-h, --help` option. Global options are inherited by subcommands and can be placed before the top-level command group.

## Input, output, and safety conventions

- `--data <json|@file|->` accepts inline JSON, a file prefixed with `@`, or standard input with `-`.
- `--output table` is intended for people. Use `json` or `jsonl` for automation.
- Commands carrying `--all` traverse opaque cursor pages, bounded by `--max-pages`.
- `--if-match` always requires the latest server-issued revision or strong ETag; never synthesize it.
- Commands carrying `--yes` ask before destructive or complete-replacement behavior. Non-interactive sessions must opt in explicitly.
- Reveal-once credentials, webhook secrets, and raw export downloads use dedicated file/stdout options so structured output cannot accidentally mix with secret or binary bytes.

See [CLI automation](/cli/automation/) for pagination and exit-code handling and [CLI maintenance and troubleshooting](/cli/maintenance-and-troubleshooting/) for upgrades, shell behavior, private CAs, debugging, and common failures.

## Command groups

| Command group | Executable commands | Description |
| --- | ---: | --- |
| [`teamgrid doctor`](/cli/reference/doctor/) | 1 | run read-only configuration, credential, routing, network, and API checks. |
| [`teamgrid auth`](/cli/reference/auth/) | 4 | manage local credential profiles. |
| [`teamgrid api-version`](/cli/reference/api-version/) | 1 | discover the TeamGrid API version. |
| [`teamgrid workspace`](/cli/reference/workspace/) | 2 | inspect the authenticated workspace. |
| [`teamgrid system`](/cli/reference/system/) | 1 | inspect API and product capabilities. |
| [`teamgrid workspace-settings`](/cli/reference/workspace-settings/) | 2 | read and update public workspace settings. |
| [`teamgrid credentials`](/cli/reference/credentials/) | 4 | manage native API v1 credentials. |
| [`teamgrid service-accounts`](/cli/reference/service-accounts/) | 10 | manage service-account principals and credentials. |
| [`teamgrid events`](/cli/reference/events/) | 1 | inspect scoped public events. |
| [`teamgrid projects`](/cli/reference/projects/) | 10 | read and mutate projects. |
| [`teamgrid project-lifecycle-operations`](/cli/reference/project-lifecycle-operations/) | 1 | inspect asynchronous project lifecycle operations. |
| [`teamgrid products`](/cli/reference/products/) | 5 | read and manage products. |
| [`teamgrid product-groups`](/cli/reference/product-groups/) | 5 | read and manage product-groups. |
| [`teamgrid project-statements`](/cli/reference/project-statements/) | 6 | read and manage project-statements. |
| [`teamgrid tasks`](/cli/reference/tasks/) | 14 | read and mutate tasks. |
| [`teamgrid task-recurrences`](/cli/reference/task-recurrences/) | 24 | define, inspect, and operate recurring tasks. |
| [`teamgrid task-recurrence-operations`](/cli/reference/task-recurrence-operations/) | 3 | inspect and cancel asynchronous recurrence operations. |
| [`teamgrid time-entries`](/cli/reference/time-entries/) | 8 | read and mutate time entries. |
| [`teamgrid call-notes`](/cli/reference/call-notes/) | 5 | read and manage call notes. |
| [`teamgrid contacts`](/cli/reference/contacts/) | 4 | read and mutate contacts. |
| [`teamgrid contact-groups`](/cli/reference/contact-groups/) | 6 | read and manage contact groups. |
| [`teamgrid users`](/cli/reference/users/) | 1 | list workspace users. |
| [`teamgrid lists`](/cli/reference/lists/) | 7 | read and manage lists. |
| [`teamgrid services`](/cli/reference/services/) | 7 | read and manage services. |
| [`teamgrid tags`](/cli/reference/tags/) | 7 | read and manage tags. |
| [`teamgrid custom-field-definitions`](/cli/reference/custom-field-definitions/) | 6 | read and manage custom-field definitions. |
| [`teamgrid custom-field-values`](/cli/reference/custom-field-values/) | 4 | read and compare-and-set custom-field values. |
| [`teamgrid project-templates`](/cli/reference/project-templates/) | 7 | read and manage reusable project templates. |
| [`teamgrid project-template-instantiations`](/cli/reference/project-template-instantiations/) | 1 | inspect credential-owned project-template instantiations. |
| [`teamgrid planned-work`](/cli/reference/planned-work/) | 3 | read and atomically replace task planned work. |
| [`teamgrid planned-work-operations`](/cli/reference/planned-work-operations/) | 1 | inspect credential-owned planned-work replacements. |
| [`teamgrid changes`](/cli/reference/changes/) | 2 | create checkpoints and read the cell-local change feed. |
| [`teamgrid audit-events`](/cli/reference/audit-events/) | 1 | list Developer Platform audit events. |
| [`teamgrid webhook-deliveries`](/cli/reference/webhook-deliveries/) | 2 | inspect credential-owned webhook delivery history. |
| [`teamgrid appointments`](/cli/reference/appointments/) | 6 | read and manage appointments. |
| [`teamgrid absences`](/cli/reference/absences/) | 6 | read and manage absences. |
| [`teamgrid availability`](/cli/reference/availability/) | 1 | inspect derived availability. |
| [`teamgrid activity`](/cli/reference/activity/) | 1 | inspect target-owned activity. |
| [`teamgrid comments`](/cli/reference/comments/) | 5 | read and manage target comments. |
| [`teamgrid documents`](/cli/reference/documents/) | 6 | read and manage documents. |
| [`teamgrid files`](/cli/reference/files/) | 6 | read and manage file metadata. |
| [`teamgrid file-upload-intents`](/cli/reference/file-upload-intents/) | 3 | create and complete direct file uploads. |
| [`teamgrid members`](/cli/reference/members/) | 4 | read and administer workspace members. |
| [`teamgrid invitations`](/cli/reference/invitations/) | 5 | read and administer workspace invitations. |
| [`teamgrid roles`](/cli/reference/roles/) | 5 | read and administer workspace roles. |
| [`teamgrid groups`](/cli/reference/groups/) | 5 | read and administer workspace groups. |
| [`teamgrid search`](/cli/reference/search/) | 1 | search permitted TeamGrid resources. |
| [`teamgrid exports`](/cli/reference/exports/) | 4 | create and download bounded exports. |
| [`teamgrid automation-actions`](/cli/reference/automation-actions/) | 1 | inspect the public automation action catalog. |
| [`teamgrid automation-definitions`](/cli/reference/automation-definitions/) | 6 | read and administer automation definitions. |
| [`teamgrid automation-definition-versions`](/cli/reference/automation-definition-versions/) | 1 | inspect immutable automation definition versions. |
| [`teamgrid automation-runs`](/cli/reference/automation-runs/) | 3 | inspect and control automation runs. |
| [`teamgrid integration-installations`](/cli/reference/integration-installations/) | 1 | inspect redacted integration installation metadata. |
| [`teamgrid webhooks`](/cli/reference/webhooks/) | 7 | read and manage webhooks. |

## Synchronization contract

The checked-in source is [`sources/cli-reference.json`](https://github.com/TeamGrid/developer-docs/blob/main/sources/cli-reference.json). The synchronization script verifies the pinned Developer Platform commit from `sources/packages.json`, rebuilds the API client and CLI locally, extracts the Commander tree, joins it to `developer-capabilities.json`, and rewrites this index plus one page per top-level group. Check mode performs the same derivation without changing files and fails on any source or generated-page drift.
