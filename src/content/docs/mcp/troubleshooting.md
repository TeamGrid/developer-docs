---
title: Troubleshoot the MCP server
description: Diagnose TeamGrid MCP startup, authentication, profile, schema, authorization, pagination, and result-size failures without exposing credentials.
owner: Developer Experience
reviewedAt: 2026-10-02
---

For hosted ChatGPT, first verify the owning region, OAuth connection and selected
workspace with [ChatGPT setup](/mcp/chatgpt/). No local CLI is required. An HTTP
`401` with protected-resource metadata before sign-in is the expected OAuth
challenge for an MCP POST; it is not proof that the server is broken. Opening
`/mcp` directly in a browser sends GET and can return `405 Method Not Allowed`.
Use the MCP host connection flow; that endpoint is not an HTML sign-in page.

For **local stdio**, start with the terminal used by the same operating-system account as the MCP host:

```bash
node --version
teamgrid --version
npm list --global @teamgrid/mcp-server --depth=0
teamgrid --profile default auth status --check
```

Then start `teamgrid-mcp --profile default --tool-profile core` directly. A healthy JSON-RPC stdio
server normally waits silently for host input. Stop it with <kbd>Ctrl</kbd>+<kbd>C</kbd> after this
check; do not type prompts into its standard input.

Browser login is enabled in Production DE and US. Use `auth login --manual` as an alternative for
initial setup, or `auth login --manual --replace` when replacing an existing local profile.
See [browser-login availability](/cli/browser-login/).

## Diagnosis matrix

| Symptom or message | Likely boundary | Safe check | Resolution |
| --- | --- | --- | --- |
| The host reports that `teamgrid-mcp` was not found | Host `PATH` differs from the terminal | Locate the globally installed command in your terminal and inspect the host's environment settings | Configure the absolute executable path or make the same Node.js global binary directory available to the host, then restart it |
| The process exits with `No credential found for profile '<name>'` | The named CLI profile has no stored credential | Run `teamgrid --profile <name> auth status --check` as the same OS user | Complete `teamgrid --profile <name> auth login` in a terminal; the MCP process never opens a browser |
| The process reports that a credential expired | The stored profile metadata is past `expiresAt` | Run `teamgrid --profile <name> auth status` | Run `teamgrid --profile <name> auth login --replace`, review the workspace and scopes again, and restart the host |
| The process reports `profile_credential_mismatch` | Keychain credential and CLI profile metadata describe different credential, cell, or region | Inspect the non-secret profile status; do not print the token | Log in again with `--replace` so metadata and keychain state are written together |
| The terminal works but the desktop host cannot authenticate | The host runs as another OS user or cannot access the same keychain backend | Compare the host OS account and `--profile` value with the terminal session | Store a credential for that OS user or pass a dedicated service credential through an isolated environment; do not put it in a transcript |
| The process starts and waits with no output | This is usually normal stdio behavior | Confirm the host shows the server as connected and can list tools | Let the MCP host own standard input/output. Do not expect an interactive prompt from `teamgrid-mcp` |
| A documented tool is missing | The selected tool profile does not advertise it | Check the server `--tool-profile` argument and the tool's **Available in** profiles in the [reference](/mcp/reference/) | Select the narrowest required profile and restart the host; `core` has 22, `collaboration` 29, `governance` 28, and `all` 36 tools |
| A tool is visible but returns an API error such as `insufficient_scope` | The API rejected the request because of scope, resource grant, tenant state, rate limit, or an upstream failure | Verify the required scope on the tool reference page and run `teamgrid auth status --check` | Correct the credential or requested resource. The returned detail is redacted; never enable a broader profile merely to diagnose it |
| The host rejects arguments before calling TeamGrid | The exact MCP JSON Schema rejected the input | Compare arguments with the tool's [input schema](/mcp/reference/) | Remove unknown properties and correct required values, enum choices, lengths, or list limits |
| A list call returns `result_too_large` | Serialized structured content exceeded 256 KiB | Check `limit` and filters in the approved arguments | Request a smaller page or narrower filters. Continue with the opaque cursor only when another page is required |
| A list repeats or skips data | A cursor was altered, decoded, or reused with incompatible filters | Compare the cursor flow and filters without logging the whole result | Start the listing again, keep filters stable, and pass `meta.page.nextCursor` back unchanged |
| Results come from an unexpected workspace or region | The selected credential profile points to another tenant, region, or cell | Call only `teamgrid_workspace_get` and inspect its returned tenant metadata | Stop reading business data, choose the intended CLI profile, verify it with `teamgrid auth status --check`, and restart the host |
| Product purchase prices are absent | Intentional MCP redaction | Check the product tool description | Use a governed API, SDK, or CLI workflow with the appropriate finance overlay; the preserved read profiles remove `purchasePrice`; finance profiles require the declared finance scopes |
| A webhook signing secret is absent | Reveal-once secrets are forbidden in MCP | Check the webhook tool description | Rotate or retrieve reveal-once material only through an explicitly governed API, SDK, CLI, or TeamGrid UI workflow; never put it in an AI transcript |
| `all` still does not show writes, audit events, files, exports, or change-feed tools | Intentional product boundary | Review [tools and security](/mcp/tools-and-security/) | `all` retains 36 curated reads. In version 1.2.2, explicitly select a suitable domain profile or `full` for additional business tools; the change feed stays API/SDK/CLI-only |
| `TEAMGRID_API_TOKEN` appears ignored or points to the wrong cell | Environment credentials override the named keychain credential | Inspect only whether the variable is present, never its value | Remove unintended host environment overrides or supply the intended dedicated token together with the correct regional base URL |

## Tool errors versus startup errors

`authentication_required`, `credential_expired`, `profile_credential_mismatch`, and invalid command
arguments prevent the stdio server from starting. They are printed before the process waits for MCP
input.

After the server is connected, TeamGrid request failures use a stable MCP error envelope:

```json
{
  "error": {
    "code": "insufficient_scope",
    "detail": "<redacted TeamGrid request error>",
    "status": 403
  }
}
```

API and SDK errors preserve their valid machine-readable code. When available, the envelope also
contains `status`, a safe `requestId`, and valid `retryAfterMs` without shortening the server delay. Unknown failures use
`teamgrid_request_failed`; malformed upstream codes fall back to `teamgrid_api_error` or
`teamgrid_client_error`. MCP also sets `isError: true`.

Oversized results use `result_too_large`. Schema validation errors are produced by the MCP protocol
layer before the TeamGrid handler runs, so their display varies by host.

## Information safe to share with support

Share the MCP server version, CLI version, Node.js version, operating system, selected profile name,
selected tool profile, tool name, non-secret arguments, timestamp, and redacted error detail. The API
response metadata may contain a request ID that is safe and useful for tracing.

Never share an API token, browser authorization code, PKCE verifier, webhook signing secret,
`Authorization` header, credential-store contents, or an unreviewed tool transcript. If accidental
exposure is possible, revoke or rotate the affected credential before continuing diagnostics.

## Write and OAuth failures

| Symptom | Resolution |
| --- | --- |
| The hosted catalog still contains only the earlier reads | Refresh connection metadata in ChatGPT and start a new conversation; check the regional `/mcp` URL |
| A write is absent from local `core` or `all` | Choose an explicit write profile and review scopes; `all` means 36 preserved reads |
| `workspace_mismatch` | Confirm `teamgrid_workspace_get` and use its exact workspace ID; no change was sent |
| `resource_cas_required` | Report the server and API release to support; do not bypass the revision requirement |
| Missing revision (`428`) or stale revision (`412`) | Read the target and copy its exact quoted `meta.etag`; review a conflicting change before a new decision |
| `429` or a safe `retryAfterMs` | Honor the full delay within your deadline; inspect uncertain writes before retrying |
| `private_resource_unavailable` | Check current read scopes, creating-credential access, export completion and the 1 MiB limit; use an authorized transfer workflow for larger content |
| A host cannot open `teamgrid://` content | The host may not implement `resources/read`; tool metadata access alone cannot retrieve private bytes |

The table below covers consent and outcome recovery.

| Outcome | Next step |
| --- | --- |
| Additional scopes requested | Review the exact requested operation and consent; sensitive scopes require passkey confirmation |
| Workspace, role or sharing denial | Correct access in TeamGrid; broader OAuth scopes cannot bypass it |
| Revision conflict | Read the current resource, compare the change and decide again |
| Unknown commit after timeout | Inspect the resource or operation status before any retry |
| Accepted asynchronous job | Use the returned status tool and ID; acceptance is not completion |
| Provider unavailable (503) | Retry within your deadline; do not replace or widen a credential to diagnose an outage |
| Revoked or expired remote connection | Reconnect through the host and review the workspace and scopes again |
| OAuth authorization opens ordinary tasks instead of a consent screen | Report the App version and request time to TeamGrid; this is a failed authorization flow, not a completed connection |
| ChatGPT cannot register its OAuth client | Check approved client metadata, authentication-method negotiation and the exact callback; do not widen origins or bypass PKCE |
| The confirmation reports an invalid sign-in session (`security-session-changed` or `security-session-unavailable`) | Sign out on TeamGrid's central sign-in page, sign in again, then start a new connection request in the MCP host |
| A fresh sign-in still produces a briefly opening popup; support finds `Invalid developer confirmation` after successful preparation | This can be a TeamGrid App clock-skew defect before the passkey prompt. Report the App version and request time; retry a new request after the corrected App is available |
| The authorization request has expired | Start a new request in the MCP host; an old consent URL cannot renew the request |
| Private resource exceeds 1 MiB | Use the authorized App or CLI transfer workflow; never request a secret download URL in chat |

## Confirmation closes before a passkey prompt

A briefly opening confirmation window does not establish that the browser cannot use passkeys.
When TeamGrid reports an invalid sign-in session, the confirmation stopped before the passkey
transport was issued. A workspace handoff can retain an older central sign-in session whose
security state is no longer valid.

1. Use **Sign out and sign in again** when the consent screen offers it. Otherwise, sign out on
   TeamGrid's normal central sign-in page.
2. Sign in normally with the intended account. Confirm that this account belongs to the required
   workspace; the workspace picker shows only workspaces it can access.
3. Start a new connection request from the MCP host and review its workspace and scopes again.
4. Complete the normal passkey confirmation if requested.

The session-specific recovery message is included in the deployed Production App release. Other permission, workspace or routing errors can produce the
generic connection-failure message; do not treat that message alone as proof of a session failure.
An expired request must be restarted in the host. Refreshing an old consent URL or switching browsers
does not renew it. Keep session validation and passkey confirmation enabled throughout recovery.

A separate Staging failure on 1 October 2026 occurred after the server successfully issued the
confirmation transport. A small difference between server and browser clocks caused the App to
reject that valid response before displaying the passkey page. Signing in again or switching
browsers does not correct this App defect. The correction keeps server expiry authoritative and
bounds the browser's wait independently of its wall clock; it is included in the deployed Production App release.

Support can distinguish these failures using the preparation result without collecting cookies,
transport tokens, authorization codes or passkey assertions.
