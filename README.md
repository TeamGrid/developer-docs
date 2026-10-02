# TeamGrid Developer Documentation

Source for [developer.teamgridapp.com](https://developer.teamgridapp.com), covering API v1, legacy API v0, the TypeScript SDK, CLI, and MCP server.

Version 1.2.2 is publicly available for the API client, CLI and MCP server under
the `latest` npm dist-tag. Hosted MCP, public OAuth, authorized writes and CLI
browser login are activated across Production workspaces in DE and US, with
normal permissions and consent preserved.
[`sources/release-status.json`](sources/release-status.json) controls publication;
[`MCP implementation status`](docs/mcp-implementation-status.md) records completed
checks, the exact-release owner acceptance and separately waived exercises.
Package registry publication and guarded regional runtime receipts establish
those delivery states; a successful documentation build alone does not.

## Local development

Use Node.js 22.14 through 24.

```bash
npm ci
npm run dev
```

Run every source, type, contract, build, and output check:

```bash
npm run verify
```

For a complete publication audit after deploying the same build:

```bash
npm run audit:publication -- https://developer.teamgridapp.com --report=/tmp/teamgrid-docs-publication.json
```

This checks every public HTML page against the built content, all 208 downloadable
MCP input/output contracts and the discovery/download assets. It performs only
public reads. `npm run test:site` also validates internal anchors, linked assets and
source edit links. `npm run test:external-links` checks outbound links; access-limited
responses (`401`, `403`, `429`) are treated as reachable, not as proof of page content.

## Sources of truth

- The checked-in `public/openapi/v1.json` contract drives the API v1 reference.
- The checked-in `public/openapi/v0.json` contract describes the frozen v0 runtime.
- `sources/contracts.json` records contract provenance and SHA-256 digests.
- `sources/sdk-reference.json`, `sources/cli-reference.json`, and
  `sources/mcp-reference.json` pin the exact public client surfaces to the recorded
  `TeamGrid/developer-platform` commit.
- `public/mcp/contracts/*.json` publishes each runtime-extracted MCP input/output
  schema, profile variants, cumulative scopes, concurrency and annotations.
- Historical v0 prose was migrated from ReadMe and retains source attribution in frontmatter.

`scripts/sync-contracts.mjs` and `scripts/import-readme-v0.mjs` are maintainer tools. They require the canonical local source repositories and are not part of a normal CI build. Synchronize contracts with `npm run sync:contracts -- /path/to/teamgrid-api <full-contract-source-sha> <full-runtime-sha>`; the command reads immutable Git objects rather than the API working tree. If the runtime SHA is omitted, it defaults to the contract source SHA for single-commit releases.

After building the pinned sibling `developer-platform/developer-platform` workspace, run
`npm run sync:packages` and `npm run sync:references` to refresh the SDK, CLI, and MCP snapshots.
Normal documentation CI runs `npm run check:client-references` without requiring sibling
repositories; the scheduled drift workflow additionally reconstructs the references from source.
For published documentation, that workflow resolves the shared `latest` version
and exact `gitHead` from all three public npm packages before checking out the
official-client source. A README-only successor or delivery recovery tag does
not change the published package's source identity. Candidate documentation
continues to compare the current repository source.

## Deployment model

The site is a static Astro build deployed to the `teamgrid-developer-docs` Cloudflare Pages project. Pull requests build and validate the complete site. A protected `main` push deploys that exact commit after the verification job succeeds, using the least-privilege credentials stored in the GitHub `production` environment.

The production domain is [developer.teamgridapp.com](https://developer.teamgridapp.com). It was cut over to Cloudflare Pages on 2026-07-19. The `*.pages.dev` deployment URLs remain available for diagnostics and carry `X-Robots-Tag: noindex` so the custom domain is the only indexable origin.

See [Production operations](docs/production-operations.md) for deployment, smoke-test, and rollback procedures.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [LICENSE.md](LICENSE.md).
