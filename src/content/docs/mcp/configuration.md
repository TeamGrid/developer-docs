---
title: Configure an MCP host
description: Configure the local TeamGrid stdio MCP server in Codex or another MCP-compatible host.
---

Install the current prereleases and authenticate the CLI first:

```bash
npm install --global @teamgrid/cli@next @teamgrid/mcp-server@next
teamgrid auth login
teamgrid auth status --check
```

## Codex CLI, app, and IDE extension

Add the server from a terminal:

```bash
codex mcp add teamgrid -- teamgrid-mcp --profile default
```

Equivalent configuration in `~/.codex/config.toml`:

```toml
[mcp_servers.teamgrid]
command = "teamgrid-mcp"
args = ["--profile", "default"]
startup_timeout_sec = 10
tool_timeout_sec = 60
```

Codex surfaces share this configuration. Restart an already-running host after adding the server, then verify that the TeamGrid tools are available.

## Generic MCP host

Hosts that use JSON configuration commonly accept this stdio shape:

```json
{
  "mcpServers": {
    "teamgrid": {
      "command": "teamgrid-mcp",
      "args": ["--profile", "default"]
    }
  }
}
```

The exact settings location and configuration key depend on the host. Consult its current MCP documentation.

## Ephemeral environment

The process may receive `TEAMGRID_API_TOKEN` and `TEAMGRID_API_BASE_URL`. Prefer the shared operating-system keychain profile for local desktop use. If a host cannot isolate environment variables or redact logs reliably, do not inject a credential into it.

The server communicates over standard input/output. It does not listen on a TCP port.
