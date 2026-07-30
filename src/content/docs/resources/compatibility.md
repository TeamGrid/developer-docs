---
title: Versions and compatibility
description: Match the stable TeamGrid API contract with supported SDK, CLI, MCP, and Node.js versions.
owner: Developer Platform
reviewedAt: 2026-07-29
---

The stable Developer Platform is released as one synchronized compatibility checkpoint. Pin the
client package version in automated environments and review the changelog before updating.

| Surface | Stable version | Runtime | Contract | Support |
| --- | --- | --- | --- | --- |
| API v1 | `1.0.0` | HTTPS | OpenAPI `1.0.0` | Stable |
| TypeScript SDK | `@teamgrid/api-client@1.0.1` | Node.js `22.14–24` | API v1 | Stable |
| CLI | `@teamgrid/cli@1.0.1` | Node.js `22.14–24` | API v1 | Stable |
| MCP server | `@teamgrid/mcp-server@1.0.1` | Node.js `22.14–24` | API v1, curated reads | Stable |
| API v0 | Unversioned legacy contract | HTTPS | OpenAPI 3.1 snapshot | Maintenance |

## Install the synchronized clients

```bash
npm install @teamgrid/api-client@1.0.1
npm install --global @teamgrid/cli@1.0.1 @teamgrid/mcp-server@1.0.1
```

SDK, CLI, and MCP use the same credential-derived regional routing. They do not create independent
authorization models or bypass API scopes.

## Compatibility policy

- Patch releases may fix defects without changing the documented contract.
- Minor releases may add optional fields, operations, commands, or tools.
- Breaking changes require a new major API or package version and a migration guide.
- API v1 additions remain backwards compatible within the stable major version.
- MCP exposure is intentionally narrower than API and SDK coverage.
- API v0 remains available for existing integrations but receives no new product surface.

The downloadable [OpenAPI files and client collections](/resources/developer-tooling/) are generated
from the same verified contract used by this documentation.
