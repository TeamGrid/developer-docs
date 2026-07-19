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
teamgrid api-version
teamgrid workspace
teamgrid system capabilities
teamgrid workspace entitlements
```

## Platform discovery and settings

```text
teamgrid system capabilities
teamgrid workspace entitlements
teamgrid workspace-settings get
teamgrid workspace-settings update --data <json|@file|->
  --if-match REVISION --idempotency-key KEY
teamgrid events catalog
```

Read workspace settings first and pass the returned `wst1` revision or strong ETag to update. A
`412` means another administrator changed the safe settings snapshot; re-read it before deciding
whether to retry. The settings projection contains only six documented fields and never provider,
billing, storage, role, or integration configuration. Capability, entitlement, and event responses
are current negotiation results, not permanent authorization grants.

## Projects and lifecycle operations

```text
teamgrid projects list|get|create|update
teamgrid projects complete|reopen|archive|restore PROJECT_ID [--wait]
teamgrid project-lifecycle-operations get OPERATION_ID
```

List commands accept `--limit`, `--cursor`, `--all`, and `--max-pages`. Resource-specific filters are visible through `teamgrid <command> --help`.

Examples:

```bash
teamgrid projects list --completed false
teamgrid projects create --data @project.json --idempotency-key project-import-42
teamgrid projects get PROJECT_ID --output json
teamgrid projects update PROJECT_ID --data '{"color":"#3772ff"}' \
  --if-match PROJECT_REVISION
teamgrid projects complete PROJECT_ID --if-match PROJECT_REVISION \
  --idempotency-key close-42 --wait
```

Project lifecycle commands create durable asynchronous operations. Without `--wait`, the command
returns the operation immediately. With `--wait`, it polls until a terminal state, bounded by
`--max-wait` and `--poll-interval`. Lifecycle access uses the separate `projects:lifecycle` scope.
Update and all four lifecycle commands require `--if-match` with the latest `developerRevision` or
the exact quoted `prj1` ETag. Lifecycle starts also bind the idempotency key to that source revision.

## Commerce and project statements

```text
teamgrid products list|get|create|update|archive
teamgrid product-groups list|get|create|update|archive
teamgrid project-statements list|get|create|update|archive|restore
```

Product list filters include `--archived`, `--disabled`, and `--product-group-id`. Product-group
list filters include `--archived` and `--parent-id`. Products and product groups do not expose a
restore command in the current contract.

Project-statement list filters are:

```text
--archived BOOLEAN
--created-at-from DATE
--created-at-to DATE
--created-by ID
--date-from DATE
--date-to DATE
--product-id ID
--project-id ID
--type budget|bundle|manual|product
```

Examples:

```bash
teamgrid products list --disabled false --product-group-id GROUP_ID --all --output json
teamgrid products create --data @product.json --idempotency-key product-import-42
teamgrid product-groups update GROUP_ID --data '{"parentId":"PARENT_GROUP_ID"}'
teamgrid project-statements list --project-id PROJECT_ID --date-from 2026-07-01T00:00:00Z
teamgrid project-statements restore STATEMENT_ID
```

Product `purchasePrice` and project-statement budget or acquisition-cost data require the additional
finance scopes documented under [credentials and scopes](/api/v1/authentication/). CLI JSON output
omits finance-gated values when the credential lacks the matching finance read scope.

## Lists, services, and tags

Each metadata group supports list, get, create, update, archive, and restore. The bare group remains
an alias for its `list` command.

```text
teamgrid lists [list] [--type tasks|projects|personal] [--parent-id ID] [--archived BOOLEAN]
teamgrid lists get|archive|restore LIST_ID
teamgrid lists create --data <json|@file|-> [--idempotency-key KEY]
teamgrid lists update LIST_ID --data <json|@file|->

teamgrid services [list] [--archived BOOLEAN]
teamgrid services get|archive|restore SERVICE_ID
teamgrid services create --data <json|@file|-> [--idempotency-key KEY]
teamgrid services update SERVICE_ID --data <json|@file|->

teamgrid tags [list] [--archived BOOLEAN]
teamgrid tags get|archive|restore TAG_ID
teamgrid tags create --data <json|@file|-> [--idempotency-key KEY]
teamgrid tags update TAG_ID --data <json|@file|->
```

Examples:

```bash
teamgrid lists create --data '{"name":"Delivery","type":"tasks","parentId":"PROJECT_ID"}' --idempotency-key list-42
teamgrid services update SERVICE_ID --data '{"billable":true,"billingRate":145}'
teamgrid tags create --data '{"name":"Priority","color":"#3772ff"}' --idempotency-key tag-42
teamgrid tags archive TAG_ID --yes
teamgrid tags restore TAG_ID
```

List creation supports `tasks` and `projects`; `personal` is a read filter for existing personal
lists and is not an accepted public create type. Service responses can contain billing rates, so
service credentials and machine-readable output should be handled as commercially sensitive data.

## Tasks

```bash
teamgrid tasks list --project-id PROJECT_ID --completed false
teamgrid tasks get TASK_ID --output json
teamgrid tasks create --data @task.json --idempotency-key task-import-42
teamgrid tasks update TASK_ID --data '{"name":"Updated task name"}' --if-match TASK_REVISION
teamgrid tasks archive TASK_ID --if-match TASK_REVISION
teamgrid tasks restore TASK_ID --if-match TASK_REVISION
teamgrid tasks complete TASK_ID --if-match TASK_REVISION
teamgrid tasks reopen TASK_ID --if-match TASK_REVISION
teamgrid tasks timer start TASK_ID --user-id USER_ID
teamgrid tasks timer stop TASK_ID --user-id USER_ID
```

Use the explicit `complete` and `reopen` commands for task state transitions. Timer commands accept an optional `--at <date>` ISO timestamp. When omitted, the API receive time is used. Starting a timer can stop the same user's previous timer and update task tracking state, so the credential must grant both `tasks:write` and `time-entries:write`.

The five protected task mutations require the latest raw `developerRevision` or exact quoted `tsk1`
ETag. Each successful resource-returning command prints the new revision in JSON output; archive
prints the post-archive ETag because the API response itself is empty.

## Time entries

`time-entries` also has the alias `times`.

```bash
teamgrid time-entries list --from 2026-07-01 --to 2026-07-31 --all
teamgrid times get TIME_ENTRY_ID
teamgrid times create --data @time-entry.json --idempotency-key time-import-42
teamgrid times update TIME_ENTRY_ID --data @time-entry-patch.json
teamgrid times archive TIME_ENTRY_ID
teamgrid times restore TIME_ENTRY_ID
```

## Contacts, call notes, and contact groups

```text
teamgrid contacts list|get|create|update
teamgrid call-notes list|get|create|archive|restore
teamgrid contact-groups list|get|create|update|archive|restore
teamgrid users
```

Contact lists accept `--type person|company` and `--archived`. Call-note and contact-group lists
accept `--archived`. Call-note creation accepts plain-text `content`; the API does not expose
TeamGrid's internal rich-text representation. Contact-group parent changes are validated against
cycles and hierarchy limits.

```bash
teamgrid contacts list --type company --all --output json
teamgrid contacts create --data @contact.json --idempotency-key contact-import-42
teamgrid call-notes create --data @call-note.json --idempotency-key call-note-42
teamgrid contact-groups update GROUP_ID --data '{"parentId":"PARENT_GROUP_ID"}'
```

## Custom-field definitions

```text
teamgrid custom-field-definitions list|get|create|update|archive|restore
```

List filters include `--archived`, `--default-enabled`, `--field-type`, and `--target-type`.
Canonical field types are `contact`, `date`, `dropdown`, `number`, `project`, `switcher`, `tag`,
`text`, `textarea`, and `user`. Target types are `contact`, `project`, `projectJournalEntry`, and
`task`.

## Custom-field values

```text
teamgrid custom-field-values get TARGET_TYPE RESOURCE_ID FIELD_ID
teamgrid custom-field-values set TARGET_TYPE RESOURCE_ID FIELD_ID
  --data <json|@file|-> --if-match REVISION
teamgrid custom-field-values clear TARGET_TYPE RESOURCE_ID FIELD_ID
  --if-match REVISION --yes
```

Read first, then pass the latest `data.attributes.revision` to `--if-match`. A `412` means another
writer changed the value; re-read and decide explicitly instead of blindly retrying. Clear is a
destructive compare-and-set operation and therefore requires confirmation.

## Project templates

```text
teamgrid project-templates list|get|create
teamgrid project-templates update|archive|restore PROJECT_TEMPLATE_ID --if-match REVISION
teamgrid project-templates instantiate TEMPLATE_ID --data <json|@file|->
  --if-match REVISION [--idempotency-key KEY] [--wait]
teamgrid project-template-instantiations get OPERATION_ID
```

Template list filters include `--archived`, `--created-at-from`, `--created-at-to`, and
`--origin-project-id`. Create and instantiate should use stable idempotency keys. `--wait` polls the
credential-owned instantiation until it succeeds or fails, bounded by `--max-wait` and
`--poll-interval`. Update, archive, restore, and instantiate require the latest raw
`developerRevision` or exact quoted `tpl1` ETag. Instantiation binds that source revision and its
payload to the idempotency key.

## Planned work

```text
teamgrid planned-work list --start DATE --end DATE
  [--project-id ID] [--task-id ID] [--user-id ID]
teamgrid planned-work get TASK_ID
teamgrid planned-work replace TASK_ID --data <json|@file|->
  --if-match REVISION [--idempotency-key KEY] --yes [--wait]
teamgrid planned-work-operations get OPERATION_ID
```

Replacement overwrites the complete task schedule. Read the latest task schedule, pass its revision
to `--if-match`, use a stable idempotency key, and use `--yes` for non-interactive execution. A
successful `202` only accepts the operation; use `--wait` or poll the operation group before relying
on the replacement.

## Calendar, absence, and availability

```text
teamgrid appointments list|get|create|update|archive|restore
teamgrid absences list|get|create|update|archive|restore
teamgrid availability list
```

List operations require bounded `--start` and `--end` values; availability also requires an IANA
time zone. Acting for another member requires the delegated or administrative overlay scope and the
underlying TeamGrid sharing and product permission. Updates use `--if-match`; creates accept an
idempotency key.

## Comments, activity, documents, and files

```text
teamgrid comments list|get|create|archive|restore
teamgrid activity list
teamgrid documents list|get|create|update|archive|restore
teamgrid files list|get|rename|archive|restore|download-intent
teamgrid file-upload-intents create|finalize|cancel
```

Comments and activity require a contact, project, or task target plus its matching domain scope.
Document updates are compare-and-set operations. File upload and download intents are short-lived
private capabilities; do not log them or pass them in URLs.

## Workspace administration

```text
teamgrid members list|get|update-role|remove
teamgrid invitations list|get|create|resend|cancel
teamgrid roles list|get|create|update|remove
teamgrid groups list|get|create|update|remove
```

Use dedicated administration credentials. Member and invitation PII requires the separate
`members:pii:read` overlay. Mutations that change existing authorization state require the latest
strong revision through `--if-match`; destructive commands require confirmation.

## Search and exports

```text
teamgrid search query --data <json|@file|->
teamgrid exports create --data <json|@file|-> [--idempotency-key KEY]
teamgrid exports get EXPORT_ID
teamgrid exports download-intent EXPORT_ID
teamgrid exports download EXPORT_ID (--file PATH | --stdout)
  [--intent-token-stdin] [--max-bytes NUMBER]
```

By default, `exports download` creates the short-lived intent internally. To separate the two steps,
pipe the token through standard input with `--intent-token-stdin`; it is never accepted on the
command line or in a URL. `--file` creates a mode-`0600` file exclusively and never overwrites an
existing path. `--stdout` refuses to write binary data to a terminal. Both paths enforce a maximum
of 50 MiB.

## Automations and integrations

```text
teamgrid automation-actions list
teamgrid automation-definitions list|get|create|update|archive|restore
teamgrid automation-definition-versions list DEFINITION_ID
teamgrid automation-runs list|get|abort
teamgrid integration-installations list
```

Automation definition updates use their latest `aut1` revision; aborting a run uses its latest
`aur1` revision. The integration command returns redacted installation status, not provider tokens
or configuration secrets.

## Audit events

```text
teamgrid audit-events [--credential-id ID] [--event-type TYPE]
                      [--outcome success|denied|failure]
```

Audit output can contain security-sensitive operational metadata. Limit access and retention in
downstream systems.

## Change feed

```text
teamgrid changes checkpoint [--operation VALUE] [--resource-type VALUE]
teamgrid changes list [--cursor CHECKPOINT] [--limit N] [--all] [--max-pages N]
```

Take a checkpoint before the full resource snapshot, then pass it to `changes list`. Both filter
options can be repeated or comma-separated; for example,
`--operation created,updated --operation deleted --resource-type project,task`. The effective
filters must remain unchanged when reusing the returned cursor.

Without `--all`, `changes list` makes exactly one request and exits; it is safe to invoke from an
external scheduler or bounded polling loop. `--all` requests catch-up pages only when explicitly
selected and stops at `--max-pages` (10,000 by default). JSON preserves the complete response
envelope. JSONL emits `kind: "change"` records and then a `kind: "checkpoint"` record after every
successfully received page. Each checkpoint includes `caughtUp`. Persist it only after applying the
preceding events, and continue catch-up until `caughtUp` is `true`; an empty event list alone is not
the completion contract.

```bash
teamgrid changes checkpoint --resource-type project,task --output json
teamgrid changes list \
  --cursor "$CHECKPOINT" \
  --resource-type project,task \
  --output jsonl
```

The CLI does not hide `410` reset-required or `503` temporarily-unavailable responses. Follow the
[change-feed recovery contract](/api/v1/change-feed/).

## Webhooks and delivery history

```bash
teamgrid webhooks list
teamgrid webhooks get WEBHOOK_ID
teamgrid webhooks create --data @webhook.json --idempotency-key webhook-42
  (--secret-file PATH | --secret-stdout)
teamgrid webhooks remove WEBHOOK_ID
teamgrid webhooks rotate-secret WEBHOOK_ID --if-match REVISION
  [--idempotency-key KEY] (--secret-file PATH | --secret-stdout) [--yes]
teamgrid webhook-deliveries list --webhook-id WEBHOOK_ID --state failed --event task_updated
teamgrid webhook-deliveries get DELIVERY_ID
```

Webhook create and `rotate-secret` require exactly one explicit secret destination. Rotation also
asks for confirmation. `--secret-file` is recommended: it creates a new mode-`0600` file atomically
and never overwrites an existing path; normal output contains only a secret-free receipt.
`--secret-stdout` emits only the raw secret plus a newline and no metadata, for an explicitly
controlled pipe into a secret manager; it refuses to write to an interactive terminal.
The secret is never accepted in an argument or URL and is never sent through table, JSON, stderr, or
debug output. Reuse the same idempotency key and precondition to recover the same rotation after a
lost response.

Delivery history requires `webhooks:read` and returns only records owned by the authenticated
credential. List filters include `--webhook-id`, `--event`, and
`--state delivering|failed|retrying|skipped|succeeded`. URLs, payloads, headers, bodies, and secrets
are never returned.

`--data` accepts inline JSON, `@path/to/file.json`, or `-` for standard input. Archive, remove, and
secret-rotation commands ask for confirmation; use `--yes` only in an intentionally non-interactive
workflow.
