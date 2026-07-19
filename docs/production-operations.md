# Production operations

## Runtime

- Production domain: `https://developer.teamgridapp.com`
- Cloudflare Pages project: `teamgrid-developer-docs`
- Production branch: `main`
- Pages fallback: `https://teamgrid-developer-docs.pages.dev`
- DNS: proxied `CNAME` from `developer.teamgridapp.com` to `teamgrid-developer-docs.pages.dev`

The production domain was cut over from ReadMe to Cloudflare Pages on 2026-07-19. The fallback `*.pages.dev` host is intentionally served with `X-Robots-Tag: noindex`; the custom domain is indexable and is used for canonical URLs, the sitemap, and `robots.txt`.

## Normal deployment

Merges to protected `main` run the `verify` job first. The `deploy` job then builds the same commit and uploads `dist` to the production branch of the Pages project. The Cloudflare account ID and the scoped Pages token are stored in the GitHub `production` environment.

Do not deploy an unverified local build over the production branch during normal operation. Use a pull request so the source commit, verification result, and deployed artifact remain traceable.

## Production smoke test

After a deployment, verify:

1. `/`, `/api/v0/`, `/api/v1/`, `/sdk/`, `/cli/`, and `/mcp/` return HTTP 200.
2. `/openapi/v0.json`, `/openapi/v1.json`, `/llms.txt`, `/sitemap-index.xml`, and `/robots.txt` return HTTP 200.
3. A migrated legacy path such as `/reference/createjournalentry` returns HTTP 301 to its `/api/v0/reference/operations/` destination.
4. The custom domain serves a valid certificate, HSTS, and the expected content security policy without `X-Robots-Tag: noindex`.
5. The `*.pages.dev` host still sends `X-Robots-Tag: noindex`.
6. The first API v1 OpenAPI server is `https://api.de.teamgrid.app/v1`.
7. Search opens and returns results for a known term such as `idempotency`.

## Rollback

For a documentation regression, prefer rolling back the Pages deployment to the last known-good production deployment. This keeps DNS, TLS, canonical URLs, and search indexing stable.

Only use a DNS rollback if the Pages service or custom-domain routing itself is unavailable and ReadMe is still operational:

1. Change `developer.teamgridapp.com` back to an unproxied `CNAME` targeting `ssl.readmessl.com` with automatic TTL.
2. Verify the ReadMe site and its certificate before declaring recovery.
3. Leave the Pages deployment intact for diagnosis. Its custom-domain status may deactivate while DNS points elsewhere.
4. Before cutting back to Pages, restore the proxied `CNAME` target `teamgrid-developer-docs.pages.dev`, retry custom-domain validation if necessary, and wait until domain verification and certificate validation are both active.
5. Repeat the full production smoke test.

Do not remove the Pages custom domain or delete production deployments as part of an emergency rollback unless the routing state itself is corrupt and a fresh association is required.
