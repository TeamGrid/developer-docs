# Contract drift automation

The `Developer contract drift` workflow compares this repository with the current `main` commits of
`TeamGrid/teamgrid-api` and `TeamGrid/developer-platform` every weekday.

Configure the repository variable `TEAMGRID_REPOSITORY_APP_ID` and secret
`TEAMGRID_REPOSITORY_APP_PRIVATE_KEY` for a dedicated GitHub App installed only on those
repositories with read-only Contents access. The workflow mints a short-lived, repository-bounded
token scoped to the two private repositories. It synchronizes contracts and package manifests in its
ephemeral runner and fails if the committed OpenAPI files, generated collections, AI-readable
documentation, or source provenance would change.

Resolve a failure by running the two synchronization commands locally from reviewed source commits,
reviewing the documentation impact, regenerating the site, and opening a normal pull request. The
workflow never writes to a repository or deploys production.
