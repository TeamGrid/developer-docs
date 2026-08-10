# MCP reference maintenance

`mcp-reference.json` and the pages below `src/content/docs/mcp/reference/` are generated from the
published MCP registry, the API capability mapping, and OpenAPI v1. Do not edit the generated pages
or JSON by hand.

The sibling `developer-platform` checkout must contain the exact MCP package tree pinned by
`sources/packages.json`. Other unrelated commits may exist in that checkout. Build the platform
before synchronization so `packages/mcp-server/dist` reflects the pinned TypeScript source.

```bash
cd ../developer-platform/developer-platform
npm run build

cd ../../developer-docs
node scripts/sync-mcp-reference.mjs
node scripts/sync-mcp-reference.mjs --check
```

Set `TEAMGRID_DEVELOPER_PLATFORM_DIR` or pass
`--platform-root=/absolute/path/to/developer-platform` when the sibling checkout lives elsewhere.
The check exits non-zero when the package tree, version, runtime registry, capability mapping, input
schemas, generated JSON, or any of the 30 generated pages drift.

The documentation drift workflow should run the platform build first, then invoke the `--check`
command. The root `package.json` may expose these commands as `sync:mcp-reference` and
`check:mcp-reference`; the documentation CI should run the check before the Astro build.
