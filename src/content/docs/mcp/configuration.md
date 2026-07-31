---
title: Configure an MCP host
description: Configure the local TeamGrid stdio MCP server in Codex or another MCP-compatible host.
owner: Developer Experience
reviewedAt: 2026-07-31
---

Install the stable packages and authenticate the CLI first:

```bash
npm install --global @teamgrid/cli@1.0.2 @teamgrid/mcp-server@1.0.2
teamgrid auth login
teamgrid auth status --check
```

## Codex CLI, app, and IDE extension

Add the server from a terminal:

```bash
codex mcp add teamgrid -- teamgrid-mcp --profile default --tool-profile core
```

Equivalent configuration in `~/.codex/config.toml`:

```toml
[mcp_servers.teamgrid]
command = "teamgrid-mcp"
args = ["--profile", "default", "--tool-profile", "core"]
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
      "args": ["--profile", "default", "--tool-profile", "core"]
    }
  }
}
```

The exact settings location and configuration key depend on the host. Consult its current MCP documentation.

## Ephemeral environment

The process may receive `TEAMGRID_API_TOKEN`, `TEAMGRID_API_BASE_URL`, and
`TEAMGRID_MCP_TOOL_PROFILE`. Prefer the shared operating-system keychain profile for local desktop
use. If a host cannot isolate environment variables or redact logs reliably, do not inject a
credential into it.

The server communicates over standard input/output. It does not listen on a TCP port.
It does not open a browser. Complete `teamgrid auth login` in a terminal first. An unattended MCP
process must use a service-account credential rather than a personal browser credential.

## Verify the connection

After restarting the host:

1. Confirm that a server named `teamgrid` is connected without a startup error.
2. Ask the host to list TeamGrid tools and verify that the selected tool profile is reflected.
3. Run a bounded read such as workspace discovery before enabling any write-capable profile.
4. Confirm that the returned workspace and region match the intended credential.

If the server does not start, run `teamgrid auth status --check` in the same operating-system user
session and then run `teamgrid-mcp --profile default --tool-profile core` in a terminal. A JSON-RPC
stdio server normally waits silently for host input; an authentication or configuration error is
printed before that wait. Check that the host inherits the same `PATH` used by the terminal and that
Node.js satisfies the supported range in [versions and compatibility](/resources/compatibility/).

Do not select a broader tool profile merely to diagnose a connection problem. Tool availability is
an authorization boundary in addition to the scopes held by the credential.
