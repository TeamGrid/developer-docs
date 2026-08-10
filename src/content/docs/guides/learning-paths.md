---
title: Choose your learning path
description: Follow a customer-focused path from first authentication to a production-ready API, SDK, CLI, or MCP workflow.
owner: Developer Experience
reviewedAt: 2026-08-10
---

Every TeamGrid interface uses the same API v1 resources, regional routing, scopes, and security
boundaries. Choose the path that matches where the work runs, then complete the shared production
checklist before enabling customer data.

## HTTP API integration

Choose this path for a production service written in any language.

1. Complete [Start building with TeamGrid](/guides/get-started/).
2. Read the [API v1 quickstart](/api/v1/quickstart/) and make a bounded `GET /workspace` request.
3. Choose a least-privilege credential with the [scope recipes](/guides/scope-recipes/).
4. Use the [API reference](/api/v1/reference/) for exact parameters, schemas, responses, and
   operation-specific scopes.
5. Implement pagination, bounded retries, idempotency, and concurrency before adding writes.
6. Complete the [production go-live checklist](/guides/production-go-live/).

Use the [language examples](/guides/http-language-examples/) when starting outside Node.js.

## TypeScript SDK integration

Choose this path for a Node.js or TypeScript service.

1. Install the exact supported package version from the [SDK quickstart](/sdk/quickstart/).
2. Create a client with a personal credential for local development or a service-account
   credential for every deployed process.
3. Complete the [end-to-end task workflow](/guides/end-to-end-task-workflow/) using the SDK.
4. Use the [SDK reference](/sdk/reference/) for method signatures, scopes, API mappings, options,
   and errors.
5. Add pagination bounds, cancellation, transport logging, and explicit concurrency recovery.
6. Test credential rotation and complete the production checklist.

The SDK is a server-side Node.js client. Never bundle a TeamGrid credential into browser code.

## CLI operator or automation workflow

Choose this path for local operations, shell automation, or CI.

1. Install and authenticate through [browser login](/cli/browser-login/) on a local desktop.
2. Confirm the selected workspace with `teamgrid auth status --check` and `teamgrid workspace`.
3. Use the [CLI reference](/cli/reference/) for exact syntax, arguments, options, output, and exit
   codes.
4. Use JSON for bounded scripts and JSONL with explicit checkpoints for paginated pipelines.
5. Replace personal credentials with a service-account credential before moving the workflow to
   CI or a shared server.
6. Follow the [CLI automation guide](/cli/automation/) and production checklist.

Interactive browser authentication must not run in CI.

## MCP-assisted read workflow

Choose this path for human-supervised reads in a trusted MCP host.

1. Authenticate the CLI locally and configure the server with the `core` tool profile.
2. Complete the [first MCP query](/mcp/first-query/).
3. Review every enabled tool in the [MCP tool reference](/mcp/reference/).
4. Create a dedicated credential whose scopes match only the enabled tools.
5. Review the host's transcript, extension, retention, and data-handling behavior.
6. Expand beyond `core` only after documenting why the additional data is required.

MCP is deliberately read-only and is not a foundation for deterministic background integrations.

## Shared completion criteria

Whichever interface you choose, the integration is ready only when it:

- reaches the intended workspace and region;
- proves that a forbidden operation remains forbidden;
- keeps credentials and reveal-once secrets out of source, logs, prompts, and artifacts;
- applies bounded timeouts, retries, pagination, and payload limits;
- handles `401`, `403`, `409`, `412`, `428`, and `429` deliberately;
- records TeamGrid request IDs without recording customer payloads or credentials;
- has tested credential rotation and revocation procedures;
- has an owner, scope inventory, monitoring path, and rollback plan.
