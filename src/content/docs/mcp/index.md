---
title: TeamGrid MCP server
description: Connect a supported AI host to a small, local, read-only TeamGrid tool surface backed by API v1.
---

`@teamgrid/mcp-server` is an optional local stdio adapter. It exposes nine read-only TeamGrid tools and delegates every request to the official API v1 client.

```bash
npm install --global @teamgrid/cli@next @teamgrid/mcp-server@next
teamgrid auth login
```

## Deliberate boundaries

- No remote TeamGrid MCP endpoint
- No MCP-specific credential or database
- No write, archive, or remove tools
- No session affinity or bypass around API authorization
- No replacement for deterministic service integrations

Use API v1 or the SDK for production services, the CLI for scripts and operator workflows, and MCP for human-supervised read workflows in a supported AI host.

[Configure an MCP host](/mcp/configuration/) or [review the tools and security model](/mcp/tools-and-security/).
