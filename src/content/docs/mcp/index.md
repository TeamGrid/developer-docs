---
title: TeamGrid MCP server
description: Connect a supported AI host to a small, local, read-only TeamGrid tool surface backed by API v1.
owner: Developer Platform
reviewedAt: 2026-08-08
---

`@teamgrid/mcp-server` is an optional local stdio adapter. It delegates every request to the
official API v1 client. The default `core` profile exposes 15 operational read tools; the `all`
profile exposes 29. Broader profiles are explicit opt-ins.

```bash
npm install --global @teamgrid/cli@1.0.5 @teamgrid/mcp-server@1.0.5
teamgrid auth login
```

## Deliberate boundaries

- No remote TeamGrid MCP endpoint
- No MCP-specific credential or database
- No change-feed tool; the qualified API/SDK/CLI feed is a high-volume synchronization primitive
- No write, archive, or remove tools
- No writes and no mechanism for a model to submit `If-Match`
- No session affinity or bypass around API authorization
- No replacement for deterministic service integrations
- No personal-data or governance tools in the default profile
- No service reads in the default profile because service objects can include billing rates
- No purchase prices in product tools, even when the credential also has finance scopes
- No project-statement or webhook-delivery-history tools in any profile
- No calendar, absence, availability, comment, document, file, administration, export, automation,
  or integration-status tools in any profile

Use API v1 or the SDK for production services, the CLI for scripts and operator workflows, and MCP for human-supervised read workflows in a supported AI host.

Task and project reads include their developer revision. The MCP server remains read-only: no tool
accepts an ETag, invokes a protected mutation, or polls project-template operation
resources.

[Run your first MCP query](/mcp/first-query/), [configure an MCP host](/mcp/configuration/), browse
the [complete 29-tool reference](/mcp/reference/), or [review the tools and security
model](/mcp/tools-and-security/). If a connection or tool call fails, use the [MCP troubleshooting
matrix](/mcp/troubleshooting/).
