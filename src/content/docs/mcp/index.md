---
title: TeamGrid MCP server
description: Connect an AI host to TeamGrid with explicit read or write profiles, bounded results and current workspace permissions.
owner: Developer Platform
reviewedAt: 2026-09-29
---

**Unpublished candidate 1.2.2.** The public npm release remains 1.2.1 with four
read-only profiles. The [candidate status](/mcp/candidate/) lists the remaining
live qualification and release work. No hosted public endpoint is released.

The candidate delegates business operations to the official API v1 client and
exposes **208 tools: 84 reads and 124 writes**. It supports local stdio and a
regional HTTP runtime with OAuth. Each request checks current permissions.

## Choose a workflow

| Need | Profile or entry point |
| --- | --- |
| Basic inspection | `core`: 22 operational reads; the default |
| Contacts and colleagues | `collaboration`: 29 reads |
| Configuration inspection | `governance`: 28 reads |
| Existing broad read surface | The `all` profile exposes 36 curated reads |
| Personal work context | `context` |
| Task, time and comment work | `work` |
| A specific business domain | One of the eleven domain profiles in the [reference](/mcp/reference/) |
| All reviewed business tools | `full`: 208 tools, with current scopes and write gates still enforced |

`all` keeps its existing meaning. Profiles and allow/deny filters select tools;
they do not add permissions or bypass sharing, workspace locks or revision checks.
Use the smallest profile suitable for the workflow.

## Start locally

The commands in this candidate documentation target 1.2.2 after publication.
Until then, use a reviewed packed candidate for qualification or the published
1.2.1 packages with their existing read-only behavior.

```bash
npm install --global @teamgrid/cli@1.2.2 @teamgrid/mcp-server@1.2.2
teamgrid auth login --manual
```

Create a scoped Personal Token in **Settings → Team → Developer Center → Access**
before importing it. Browser-login availability is a separate regional rollout;
see [browser login](/cli/browser-login/). The stdio process uses the selected CLI
credential store and opens no browser itself.

## Results and boundaries

Reads are bounded snapshots. Follow opaque cursors for complete listings; a search
result is not a full inventory. Workspace context identifies the acting person
when applicable and the effective time zone. Service credentials do not represent
an invented human user.

Writes require the exact workspace and any declared revision or idempotency key.
Receipts distinguish completed, accepted, partial and uncertain outcomes. Inspect
an uncertain result before retrying. Multi-tool workflows are not one transaction.

Large documents use revision-bound sections. Private files and exports are available
through bounded, freshly authorized resource reads; transfer URLs remain internal.
Credential secrets, arbitrary HTTP or database access and durable synchronization
streams stay outside the model tool surface.

[Run a first read](/mcp/first-query/), [configure a host](/mcp/configuration/), browse
the [208-tool reference](/mcp/reference/) or review [security and writes](/mcp/tools-and-security/).
