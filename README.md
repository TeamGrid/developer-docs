# TeamGrid Developer Documentation

Source for [developer.teamgridapp.com](https://developer.teamgridapp.com), covering API v1, legacy API v0, the TypeScript SDK, CLI, and optional read-only MCP server.

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

## Sources of truth

- The checked-in `public/openapi/v1.json` contract drives the API v1 reference.
- The checked-in `public/openapi/v0.json` contract describes the frozen v0 runtime.
- `sources/contracts.json` records contract provenance and SHA-256 digests.
- SDK, CLI, and MCP behavior follows the public `TeamGrid/developer-platform` packages.
- Historical v0 prose was migrated from ReadMe and retains source attribution in frontmatter.

`scripts/sync-contracts.mjs` and `scripts/import-readme-v0.mjs` are maintainer tools. They require the canonical local source repositories and are not part of a normal CI build.

## Deployment model

The site is a static Astro/Starlight build deployed to the `teamgrid-developer-docs` Cloudflare Pages project. Pull requests build and validate the complete site. A protected `main` push deploys that exact commit after the verification job succeeds, using the least-privilege credentials stored in the GitHub `production` environment.

The production domain is [developer.teamgridapp.com](https://developer.teamgridapp.com). It was cut over to Cloudflare Pages on 2026-07-19. The `*.pages.dev` deployment URLs remain available for diagnostics and carry `X-Robots-Tag: noindex` so the custom domain is the only indexable origin.

See [Production operations](docs/production-operations.md) for deployment, smoke-test, and rollback procedures.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [LICENSE.md](LICENSE.md).
