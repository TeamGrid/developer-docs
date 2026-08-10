---
title: Troubleshoot the MCP server
description: Diagnose TeamGrid MCP startup, authentication, profile, schema, authorization, pagination, and result-size failures without exposing credentials.
owner: Developer Experience
reviewedAt: 2026-08-10
---

Start with the terminal used by the same operating-system account as the MCP host:

```bash
node --version
teamgrid --version
npm list --global @teamgrid/mcp-server --depth=0
teamgrid --profile default auth status --check
```

Then start `teamgrid-mcp --profile default --tool-profile core` directly. A healthy JSON-RPC stdio
server normally waits silently for host input. Stop it with <kbd>Ctrl</kbd>+<kbd>C</kbd> after this
check; do not type prompts into its standard input.

## Diagnosis matrix

| Symptom or message | Likely boundary | Safe check | Resolution |
| --- | --- | --- | --- |
| The host reports that `teamgrid-mcp` was not found | Host `PATH` differs from the terminal | Locate the globally installed command in your terminal and inspect the host's environment settings | Configure the absolute executable path or make the same Node.js global binary directory available to the host, then restart it |
| The process exits with `No credential found for profile '<name>'` | The named CLI profile has no stored credential | Run `teamgrid --profile <name> auth status --check` as the same OS user | Complete `teamgrid --profile <name> auth login` in a terminal; the MCP process never opens a browser |
| The process reports that a credential expired | The stored profile metadata is past `expiresAt` | Run `teamgrid --profile <name> auth status` | Run `teamgrid --profile <name> auth login --replace`, review the workspace and scopes again, and restart the host |
| The process reports `profile_credential_mismatch` | Keychain credential and CLI profile metadata describe different credential, cell, or region | Inspect the non-secret profile status; do not print the token | Log in again with `--replace` so metadata and keychain state are written together |
| The terminal works but the desktop host cannot authenticate | The host runs as another OS user or cannot access the same keychain backend | Compare the host OS account and `--profile` value with the terminal session | Store a credential for that OS user or pass a dedicated service credential through an isolated environment; do not put it in a transcript |
| The process starts and waits with no output | This is usually normal stdio behavior | Confirm the host shows the server as connected and can list tools | Let the MCP host own standard input/output. Do not expect an interactive prompt from `teamgrid-mcp` |
| A documented tool is missing | The selected tool profile does not advertise it | Check the server `--tool-profile` argument and the tool's **Available in** profiles in the [reference](/mcp/reference/) | Select the narrowest required profile and restart the host; `core` has 15, `collaboration` 22, `governance` 21, and `all` 29 tools |
| A tool is visible but returns `teamgrid_request_failed` | The API rejected the request because of scope, resource grant, tenant state, rate limit, or an upstream failure | Verify the required scope on the tool reference page and run `teamgrid auth status --check` | Correct the credential or requested resource. The returned detail is redacted; never enable a broader profile merely to diagnose it |
| The host rejects arguments before calling TeamGrid | The exact MCP JSON Schema rejected the input | Compare arguments with the tool's [input schema](/mcp/reference/) | Remove unknown properties and correct required values, enum choices, lengths, or list limits |
| A list call returns `result_too_large` | Serialized structured content exceeded 256 KiB | Check `limit` and filters in the approved arguments | Request a smaller page or narrower filters. Continue with the opaque cursor only when another page is required |
| A list repeats or skips data | A cursor was altered, decoded, or reused with incompatible filters | Compare the cursor flow and filters without logging the whole result | Start the listing again, keep filters stable, and pass `meta.page.nextCursor` back unchanged |
| Results come from an unexpected workspace or region | The selected credential profile points to another tenant, region, or cell | Call only `teamgrid_workspace_get` and inspect its returned tenant metadata | Stop reading business data, choose the intended CLI profile, verify it with `teamgrid auth status --check`, and restart the host |
| Product purchase prices are absent | Intentional MCP redaction | Check the product tool description | Use a governed API, SDK, or CLI workflow with the appropriate finance overlay; MCP product tools always remove `purchasePrice` |
| A webhook signing secret is absent | Reveal-once secrets are forbidden in MCP | Check the webhook tool description | Rotate or retrieve reveal-once material only through an explicitly governed API, SDK, CLI, or TeamGrid UI workflow; never put it in an AI transcript |
| `all` still does not show writes, audit events, files, exports, or change-feed tools | Intentional product boundary | Review [tools and security](/mcp/tools-and-security/) | Use API v1, the SDK, or CLI. `all` is the explicit union of 29 curated reads, not unrestricted API access |
| `TEAMGRID_API_TOKEN` appears ignored or points to the wrong cell | Environment credentials override the named keychain credential | Inspect only whether the variable is present, never its value | Remove unintended host environment overrides or supply the intended dedicated token together with the correct regional base URL |

## Tool errors versus startup errors

`authentication_required`, `credential_expired`, `profile_credential_mismatch`, and invalid command
arguments prevent the stdio server from starting. They are printed before the process waits for MCP
input.

After the server is connected, TeamGrid request failures use a stable MCP error envelope:

```json
{
  "error": {
    "code": "teamgrid_request_failed",
    "detail": "<redacted TeamGrid request error>"
  }
}
```

Oversized results use `result_too_large`. Schema validation errors are produced by the MCP protocol
layer before the TeamGrid handler runs, so their display varies by host.

## Information safe to share with support

Share the MCP server version, CLI version, Node.js version, operating system, selected profile name,
selected tool profile, tool name, non-secret arguments, timestamp, and redacted error detail. The API
response metadata may contain a request ID that is safe and useful for tracing.

Never share an API token, browser authorization code, PKCE verifier, webhook signing secret,
`Authorization` header, credential-store contents, or an unreviewed tool transcript. If accidental
exposure is possible, revoke or rotate the affected credential before continuing diagnostics.
