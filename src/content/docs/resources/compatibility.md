---
title: Versions and compatibility
description: Match the stable TeamGrid API contract with supported SDK, CLI, MCP, and Node.js versions.
owner: Developer Platform
reviewedAt: 2026-10-02
---

The stable Developer Platform is released as one synchronized compatibility checkpoint. Pin the
client package version in automated environments and review the changelog before updating.

| Surface | Stable version | Runtime | Contract | Support |
| --- | --- | --- | --- | --- |
| API v1 | `1.2.0` | HTTPS | OpenAPI 3.1, contract `1.2.0` | Stable |
| TypeScript SDK | `@teamgrid/api-client@1.2.2` | Node.js `22.14–24` | API v1 | Stable |
| CLI | `@teamgrid/cli@1.2.2` | Node.js `22.14–24` | API v1 | Stable |
| MCP server | `@teamgrid/mcp-server@1.2.2` | Node.js `22.14–24` | API v1, 208 supervised read/write tools | Stable |
| API v0 | Unversioned legacy contract | HTTPS | OpenAPI 3.1 snapshot | Maintenance |

## Install the synchronized clients

```bash
npm install @teamgrid/api-client@1.2.2
npm install --global @teamgrid/cli@1.2.2 @teamgrid/mcp-server@1.2.2
```

Local SDK, CLI and stdio MCP derive regional routing from the API credential.
Hosted MCP uses regional OAuth with a separate short API delegation. Both paths
preserve the owning workspace, current permissions and API scopes. For ChatGPT,
[connect the hosted endpoint](/mcp/chatgpt/) without installing the Node.js packages.

## Compatibility policy

- Patch releases may fix defects without changing the documented contract.
- Minor releases may add optional fields, operations, commands, or tools.
- Breaking changes require a new major API or package version and a migration guide.
- API v1 additions remain backwards compatible within the stable major version.
- MCP exposure is intentionally narrower than API and SDK coverage.
- API v0 remains available for existing integrations but receives no new product surface.

The downloadable [OpenAPI files and client collections](/resources/developer-tooling/) are generated
from the same verified contract used by this documentation.
