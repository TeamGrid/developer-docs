---
title: TeamGrid MCP server
description: Connect a supported AI host to a small, local, read-only TeamGrid tool surface backed by API v1.
---

`@teamgrid/mcp-server` is an optional local stdio adapter. It delegates every request to the
official API v1 client. The default `core` profile exposes 15 operational read tools; the `all`
profile exposes 30. Broader profiles are explicit opt-ins.

```bash
npm install --global @teamgrid/cli@next @teamgrid/mcp-server@next
teamgrid auth login
```

## Deliberate boundaries

- No remote TeamGrid MCP endpoint
- No MCP-specific credential or database
- No high-volume change-feed tool, including in the `all` profile
- No write, archive, or remove tools
- No session affinity or bypass around API authorization
- No replacement for deterministic service integrations
- No personal-data or governance tools in the default profile
- No service reads in the default profile because service objects can include billing rates
- No purchase prices in product tools, even when the credential also has finance scopes
- No project-statement or webhook-delivery-history tools in any profile
- No calendar, absence, availability, comment, document, file, administration, export, automation,
  or integration-status tools in any profile

Use API v1 or the SDK for production services, the CLI for scripts and operator workflows, and MCP for human-supervised read workflows in a supported AI host.

[Configure an MCP host](/mcp/configuration/) or [review the tools and security model](/mcp/tools-and-security/).
