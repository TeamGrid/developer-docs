# Developer portal production release

The production Pages project is `teamgrid-developer-docs`; its public domain is
`developer.teamgridapp.com`. A push to `main` deploys only the exact site artifact that passed the
contract, content, HTML, browser, and visual regression checks.

## Normal release

1. Synchronize API contracts and official client manifests from reviewed commits.
2. Run `npm run verify:full` and `npm run test:external-links`.
3. Open a pull request and review generated contract or package changes explicitly.
4. Merge to `main`.
5. CI deploys the preserved verified artifact atomically to Cloudflare Pages.
6. The workflow runs public smoke requests against the canonical domain.

Candidate documentation uses `sources/release-status.json` with `status: candidate`,
the candidate version and the last `publishedVersion`. Builds show a visible candidate
banner while the changelog feed and compatibility badge retain the published version.
CI verifies candidates but skips Production deployment even if their npm packages
already exist. After package and cell qualification, update the status to `published`,
the published version and maintained availability text together; then run the full
verification again. Changing this marker is a release decision, not a test repair.

For the exact MCP 1.2.2 release accepted on 2 October 2026, the release owner's
instruction waives additional functional exercises. Retain genuine Staging proof
and immutable DE/US promotion evidence. Activate guarded hosted MCP and CLI login
in both active production cells, verify the effective configuration and standing
feature baseline, then publish packages and this portal. Record unexecuted regional,
client and desktop exercises as waived, never as passing. macOS is the only real
desktop acceptance platform. Existing source, content and deployment integrity
checks remain applicable.

Authentication documentation has an additional ordering rule. Do not publish browser-login,
Windows Credential Manager, or `TeamGrid CLI` lifecycle guidance merely because its portal change
is ready. First verify that the pinned CLI package exists on npm and that the exact App candidate
with browser authorization and structured credential metadata is healthy in both active production
cells. Publish the portal only after DE and US expose the same behavior; otherwise keep the previous
portal revision live. This prevents documentation from becoming an accidental feature flag.

Corrections that explicitly document a disabled login gate may ship while that gate is closed.
Record the observation date and give the working manual import path. Do not describe the browser
flow as generally available until the same behavior is verified in both cells. This distinction
allows inaccurate availability guidance to be corrected without enabling authentication features.

The custom domain does not need a DNS change for routine releases.

## Rollback

Use the `Redeploy a verified documentation revision` workflow with the last known-good commit SHA.
It checks out that immutable revision, installs its locked dependencies, rebuilds and verifies the
site, confirms the documented npm packages still exist, deploys it to the production branch, and
runs the same canonical-domain smoke checks.

This rebuild-and-redeploy path is intentionally independent of short-lived workflow artifacts. It
never changes API, TeamGrid application, credential, or database state.
