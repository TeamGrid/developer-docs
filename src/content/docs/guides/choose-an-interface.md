---
title: Choose an interface
description: Decide whether a TeamGrid integration should use API v1, the TypeScript SDK, the CLI, or the read-only MCP server.
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

Use the [change feed](/api/v1/change-feed/) for a durable mirror. It is available through API v1,
the typed SDK, and finite CLI polling commands, but not through MCP.

MCP does not introduce a second TeamGrid API, a remote TeamGrid session, or MCP-specific credentials. Every MCP request still passes through the API v1 authentication, scope, tenant, and region checks.
