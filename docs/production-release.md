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

Authentication documentation has an additional ordering rule. Do not publish browser-login,
Windows Credential Manager, or `TeamGrid CLI` lifecycle guidance merely because its portal change
is ready. First verify that the pinned CLI package exists on npm and that the exact App candidate
with browser authorization and structured credential metadata is healthy in both active production
cells. Publish the portal only after DE and US expose the same behavior; otherwise keep the previous
portal revision live. This prevents documentation from becoming an accidental feature flag.

The custom domain does not need a DNS change for routine releases.

## Rollback

Use the `Redeploy a verified documentation revision` workflow with the last known-good commit SHA.
It checks out that immutable revision, installs its locked dependencies, rebuilds and verifies the
site, confirms the documented npm packages still exist, deploys it to the production branch, and
runs the same canonical-domain smoke checks.

This rebuild-and-redeploy path is intentionally independent of short-lived workflow artifacts. It
never changes API, TeamGrid application, credential, or database state.
