# Dependency security maintenance

The 2026-11-07 maintenance uses Astro 7.4.7 and Node 24.22.2. `.nvmrc`
and the lockfile are the development/CI source of truth. The daily independent
`Dependency security` workflow checks the complete locked graph, retains its
report and fails on known advisories. It never deploys or auto-merges changes.
An empty registry audit is not proof that every possible vulnerability is absent.

MDX 8.1.3, sitemap 3.7.4 and Wrangler 4.158.0 were qualified with full
source/build/publication checks, ten edge-function tests, and 29 real Chrome
browser/visual tests (one existing mobile case skipped). `astro preview
--ignore-lock` keeps Playwright in charge of its own foreground process in
agent sessions. Public API/client contracts and publication gates are unchanged.
Use `docs/production-operations.md`; only the verified main artifact is deployed.

The browser job uses macOS 15 because GitHub retired macOS 14 runners on
2026-11-02. Screenshot baselines and comparison tolerances remain unchanged.
