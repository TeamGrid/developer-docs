---
title: Choose an interface
description: Decide whether a TeamGrid integration should use API v1, the TypeScript SDK, the CLI, or the read-only MCP server.
owner: Developer Experience
reviewedAt: 2026-08-10
---

API v1 is the source of truth. The SDK, CLI, and MCP server are clients of that API rather than independent integration surfaces.

| Need | Recommended interface | Why |
| --- | --- | --- |
| A production service in any language | API v1 | Versioned HTTP contract and explicit scopes |
| A Node.js or TypeScript service | TypeScript SDK | Typed resources, retries, timeouts, and pagination |
| Shell scripts, CI, or an operator workflow | CLI | Structured output and stable exit codes |
| A durable resource mirror | API v1 or TypeScript SDK | Cell-local checkpoint-before-snapshot synchronization |
| Read-only access from a supported AI host | MCP server | Small, local, read-only tool surface |
| An existing integration that already uses v0 | API v0 | Compatibility only; plan a migration |

## Recommended architecture

Build automation against API v1 or the SDK. Use the CLI as an operator and scripting interface. Treat MCP as an optional adapter for human-supervised read workflows, not as the foundation of an integration.

For durable mirrors, create a cell-local checkpoint before the initial snapshot, then consume the
[change feed](/api/v1/change-feed/) for ordered catch-up. Signed webhooks remain useful
low-latency delivery signals, but they are not a replayable history.

MCP does not introduce a second TeamGrid API, a remote TeamGrid session, or MCP-specific credentials. Every MCP request still passes through the API v1 authentication, scope, tenant, and region checks.

Continue with the [customer learning path](/guides/learning-paths/) for the chosen interface and
complete the [production go-live checklist](/guides/production-go-live/) before enabling customer
data.
