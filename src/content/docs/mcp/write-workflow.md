---
title: Make and verify a safe MCP write
description: Rename a task with explicit workspace selection, exact ETag preconditions, user approval and verified mutation outcomes.
owner: Developer Experience
reviewedAt: 2026-10-02
---

This walkthrough renames **one task you have deliberately selected**. It applies
to hosted OAuth and local stdio in stable release 1.2.2. Use a disposable task when
learning. No request below has been executed merely by reading this guide.

## Access required

- `workspace:read` to confirm the acting workspace;
- `tasks:read` to inspect and verify the task;
- `tasks:write` to submit the rename;
- the current TeamGrid permissions and sharing access for that task.

For ChatGPT, [connect the regional hosted server](/mcp/chatgpt/) and approve only
the applicable scopes. The hosted catalog is `full`. For local stdio, narrow `work`
to the three tools needed here:

```bash
teamgrid-mcp --tool-profile work \
  --allow-tool teamgrid_workspace_get,teamgrid_task_get,teamgrid_task_update \
  --explain-scopes

teamgrid --profile mcp-write auth login \
  --scope workspace:read --scope tasks:read --scope tasks:write

teamgrid-mcp --profile mcp-write --tool-profile work \
  --allow-tool teamgrid_workspace_get,teamgrid_task_get,teamgrid_task_update --check
```

Register that same profile and tool filter in your host:

```json
{
  "mcpServers": {
    "teamgrid": {
      "command": "teamgrid-mcp",
      "args": [
        "--profile", "mcp-write", "--tool-profile", "work",
        "--allow-tool", "teamgrid_workspace_get,teamgrid_task_get,teamgrid_task_update"
      ]
    }
  }
}
```

Restart the local host. `--check` exits after diagnostics; do not include it in the
host's server command. Profile and scope selection are separate controls.

## 1. Resolve and confirm the target

Ask the host to call `teamgrid_workspace_get` with `{}` and then
`teamgrid_task_get` with the known task ID:

```json
{ "id": "TASK_ID_FROM_TEAMGRID" }
```

If you do not know the ID, add an authorized bounded task listing or search first
and confirm the exact match. Never guess an ID or choose one merely because a name
matches. Search results can lag; read the chosen task by ID before writing.

Record `data.id` from the workspace read, the task's `data.id`, its current name
and **`meta.etag` from the task read**. Task ETags are quoted strong validators:

```text
"tsk1-<64 lowercase hexadecimal characters>"
```

Copy the entire ETag, including its quotes. Do not pass just `developerRevision`,
invent an ETag or substitute a newer revision after a conflict. This placeholder
illustrates the format and is not a valid revision.

## 2. Review one explicit change

A useful instruction to the host is:

> In the confirmed workspace, rename task TASK_ID from its current name to
> “Reviewed launch plan”. Read it first, show me the workspace ID, task ID, old
> name, new name and exact ETag. Wait for my approval. Change only the name,
> then inspect the outcome and read the task again.

The proposed `teamgrid_task_update` arguments have this shape:

```json
{
  "workspaceId": "WORKSPACE_ID_FROM_WORKSPACE_READ",
  "id": "TASK_ID_FROM_TASK_READ",
  "expectedRevision": "\"tsk1-<64 lowercase hexadecimal characters from meta.etag>\"",
  "data": { "name": "Reviewed launch plan" }
}
```

Replace every placeholder with the reviewed result. `data` contains only the
intended changed field. Omitted fields remain unchanged; array or relationship
replacement operations require special care. See the
[exact task-update contract](/mcp/reference/teamgrid_task_update/).

## 3. Interpret the result

Successful MCP calls return `structuredContent` and equivalent JSON text. Tool
failures set `isError: true`. Inspect the envelope rather than relying on the
assistant's wording:

| `meta.outcome` | Meaning | Next step |
| --- | --- | --- |
| `completed` | The action's completion was confirmed | Read the target and compare the intended change |
| `accepted` | Asynchronous work is pending | Use `meta.resume.tool` and `meta.resume.arguments` when supplied; check until a terminal state within your deadline |
| `partial` | Only some bulk items succeeded | Inspect every item; preserve completed work and decide separately about failures |
| `failed` | The operation reports failure | Inspect the error and, for asynchronous or bulk work, its per-item effects |
| `unknown` | Completion could not be established | Inspect the target or status resource before considering a replay |

A task rename normally completes synchronously. Other tools, such as project
lifecycle operations and exports, can return pending work. Independent tools are
not one transaction. A failed or cancelled job can still require inspection of
reported effects; do not assume every preceding action was rolled back.

## 4. Verify and handle conflicts

Call `teamgrid_task_get` for the same ID. Confirm the new name and new `meta.etag`.
If the value differs, report the observed state rather than claiming success.

For a stale revision (`412` or `revision_conflict`), read again and review the
competing change. Obtain a new decision before submitting a new mutation. A missing
required revision (`428`) must be corrected with a read. There is no force-write
fallback in this workflow.

After a timeout or disconnected response, the server may already have committed
the write. Read first. The rename tool does not accept an idempotency key; do not
invent one or repeat a write against the old ETag.

## Other write contracts

Creates that declare `idempotencyKey` reuse the same key and **identical payload**
for the same intent; a new intent gets a new key. Bulk operations can require one
revision per item. Some catalog and time operations declare unconditional writes
and do not support a revision precondition. Their tool page states that limitation;
a read before writing cannot create server-side conflict protection.

Archives, deletes, member removal, invitations, automation changes and webhook
tests have different recovery and external effects. Review the individual tool's
annotations, contract and API mapping. Do not infer reversibility from its name.
If restoring the example task's old name, use another fresh read and guarded write.

Continue with [tools and security](/mcp/tools-and-security/) or
[write and OAuth troubleshooting](/mcp/troubleshooting/#write-and-oauth-failures).
