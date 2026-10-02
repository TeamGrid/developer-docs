---
title: Connect TeamGrid to ChatGPT
description: Connect the regional TeamGrid MCP endpoint with OAuth, select a workspace, verify access and enable supervised writes in ChatGPT.
owner: Developer Experience
reviewedAt: 2026-10-02
---

Use this guide for the **hosted MCP server, stable release 1.2.2**. You do not need
to install Node.js, the CLI or a local MCP process for this connection.

## Before you connect

You need a TeamGrid account with membership in the intended workspace. Your
TeamGrid role must permit the operations you request. Sensitive scopes require a
Passkey registered on that account; confirm it personally when prompted.

Your ChatGPT account and workspace policy must permit custom MCP connections.
Developer mode availability and menu labels are controlled by OpenAI. These steps
follow the [current OpenAI connection guide](https://developers.openai.com/plugins/deploy/connect-chatgpt),
reviewed on 2 October 2026. If the option is unavailable, ask your ChatGPT workspace
administrator to check its policy.

## 1. Choose the regional endpoint

| Owning TeamGrid region | MCP server URL |
| --- | --- |
| Germany / DE | `https://mcp-de.teamgrid.app/mcp` |
| United States / US | `https://mcp-us.teamgrid.app/mcp` |

Choose the region that owns the workspace, not the country where you are working.
The [regional routing guide](/api/v1/regions/) explains how to identify it. Include
the `/mcp` path. A workspace website, API v1 URL or browser consent URL is not an
MCP endpoint. One authorized connection belongs to **one workspace**.

## 2. Add the connection

1. In ChatGPT, open **Settings → Security and login → Developer mode**.
2. Open **ChatGPT Plugins**, select the plus button and add a custom MCP connection.
3. Name it clearly, for example **TeamGrid · Acme · DE**, and enter the URL above.
4. Select OAuth authentication and complete the connection flow. TeamGrid uses
   client metadata discovery and public-client PKCE; there is no TeamGrid client
   secret or API token to paste into this setup.
5. Sign in on TeamGrid, choose the intended workspace and inspect the requested
   permissions before choosing **Allow access / Zugriff erlauben**.

The hosted server advertises the `full` catalog. It can request additional scopes
for a later operation through incremental consent. Tool visibility alone does not
mean you have permission to execute that tool. CLI flags such as `--tool-profile`
do not configure this hosted connection.

## 3. Complete TeamGrid consent

Check the client name, workspace and scopes on every consent screen. If sensitive
permissions are requested, a confirmation window opens for your personal Passkey.
After successful confirmation it closes and the connection flow continues. A
request containing only ordinary read scopes can complete without that popup.

Do not dismiss a generic connection failure as a browser or cookie problem. If
the request expires, restart the connection from ChatGPT. Refreshing an expired
consent URL cannot create a new request. The [OAuth troubleshooting matrix](/mcp/troubleshooting/#write-and-oauth-failures)
covers sign-in sessions, permissions, expired requests and popup failures.

## 4. Verify the workspace with a read

Start a new conversation with the TeamGrid connection enabled and ask:

> Call `teamgrid_workspace_get` once with `{}`. Show the workspace name and ID,
> region and cell. Do not read another resource or make a change.

Compare the result with the workspace you selected. Then try a bounded read:

> List at most five non-archived projects with `teamgrid_projects_list`. Do not
> request another page. Use only the returned TeamGrid data.

The second request needs `projects:read` in addition to workspace access. Review
any additional consent. For the exact arguments, use the
[project-list reference](/mcp/reference/teamgrid_projects_list/).

## 5. Use write tools deliberately

Writes are available in Production DE and US. They require current scopes and
TeamGrid permissions, a confirmed `workspaceId`, and the operation's declared
revision or idempotency key. Follow the [complete task-write walkthrough](/mcp/write-workflow/)
before changing an important resource.

Ask ChatGPT to read the target, show the proposed change and wait for your approval.
Review the actual target and arguments in the host confirmation. Afterwards,
inspect `meta.outcome` and verify the resource. Acceptance of a job is not completion.
Tool safety annotations guide the host; they do not replace TeamGrid authorization.

## Update, disconnect and reconnect

If ChatGPT has cached an earlier tool catalog, open its connection settings and
select **Refresh**, then start a new conversation. If authentication is invalid,
reconnect and review TeamGrid consent again.

Removing a connection from ChatGPT stops its use in that host. To revoke its
server-side token family, open the owning TeamGrid workspace's
**Settings → Team → Developer Center → Access**, find the connected application
and disconnect it. Closing a conversation or browser tab does not revoke access.
Other workspace connections have their own grants.

## What this connection supports

TeamGrid provides supervised business tools and private resources. It does not
advertise standard `search`/`fetch` tools for ChatGPT company knowledge, embedded
ChatGPT widgets or a published plugin-directory listing. `teamgrid_search` is a
bounded TeamGrid business search. See [protocol support and limits](/mcp/resources-and-protocol/).

For another OAuth client, TeamGrid must approve that client's exact metadata and
redirect requirements. The supported registration method is documented under
[remote OAuth configuration](/mcp/configuration/#remote-oauth-runtime).
