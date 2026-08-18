---
title: Run your first MCP query
description: Connect a least-privilege TeamGrid profile, verify the workspace boundary, and complete a bounded read in an MCP host.
owner: Developer Experience
reviewedAt: 2026-08-10
---

This walkthrough ends with a verified, read-only TeamGrid result in your MCP host. It starts with
the `core` tool profile so the host cannot see contact, call-note, service, webhook, or federated
search tools.

## 1. Install the matching packages

Use the same stable release for the CLI and MCP server:

```bash
npm install --global @teamgrid/cli@1.1.0 @teamgrid/mcp-server@1.1.0
teamgrid --version
npm list --global @teamgrid/mcp-server --depth=0
```

Node.js must satisfy the range in [versions and compatibility](/resources/compatibility/). If the
commands are not found, resolve that in the terminal before configuring the host.

## 2. Create a dedicated CLI profile

Authenticate in a terminal, not inside the MCP process:

```bash
teamgrid --profile mcp-local auth login --scope workspace:read --scope projects:read
teamgrid --profile mcp-local auth status --check
```

Browser login asks you to confirm the workspace and requested scopes. If interactive browser login
is unavailable, follow the [CLI authentication alternatives](/cli/browser-login/) and store the
credential under the same profile name. Do not paste a token into an AI conversation or host
configuration.

For an unattended MCP process, use a dedicated service-account credential. A personal browser
credential represents the person who approved it and is intended for supervised local use.

## 3. Register the local server

For Codex CLI, the desktop app, and the IDE extension:

```bash
codex mcp add teamgrid -- teamgrid-mcp --profile mcp-local --tool-profile core
```

Other hosts can use the equivalent stdio configuration from [configure an MCP
host](/mcp/configuration/). Restart an already-running host after changing its configuration.

## 4. Verify the tenant before reading business data

Ask the host:

> Use `teamgrid_workspace_get` once. Show me the workspace name, region, and cell returned by
> TeamGrid. Do not call another tool.

Before approving the call, verify that the proposed tool is exactly `teamgrid_workspace_get` and
has an empty input object. After the result returns, confirm that the workspace and region are the
ones you intended to authorize.

This check matters because the MCP server follows the region and cell encoded in the credential. It
does not search across cells, redirect to another workspace, or bypass resource grants.

## 5. Run one bounded project read

Ask:

> Use `teamgrid_projects_list` to list at most five non-archived projects. Do not follow a next
> cursor. Summarize only the returned TeamGrid data.

The expected arguments are:

```json
{
  "archived": false,
  "limit": 5
}
```

The result is the API v1 response envelope. When another page exists,
`meta.page.nextCursor` contains an opaque cursor. Stop after the first page for this walkthrough;
never ask a model to construct or decode a cursor.

## 6. Confirm the effective boundary

Ask the host to list the TeamGrid tools it can see. With `--tool-profile core`, it should advertise
15 read-only tools. It must not advertise contact, call-note, service, webhook, or
`teamgrid_search` tools. The credential in this walkthrough only has `workspace:read` and
`projects:read`, so other advertised core tools will still fail authorization if called.

The two controls are independent:

1. The tool profile determines what the MCP server advertises.
2. Credential scopes and resource grants determine what TeamGrid will return.

Do not broaden both controls for convenience. Add the smallest missing scope, or choose
`collaboration` or `governance`, only after reviewing the relevant data classification in the
[MCP tool reference](/mcp/reference/).

## 7. End or revoke access

Disable or remove the server from the host when the workflow is finished. To remove the local
credential without revoking it on TeamGrid:

```bash
teamgrid --profile mcp-local auth logout
```

Use the CLI's revoke option or the TeamGrid developer settings to terminate the server-side
credential. Closing the host alone does not revoke an API credential.

If any step behaves differently, use the [MCP troubleshooting matrix](/mcp/troubleshooting/) before
selecting a broader tool profile.
