---
title: Changelog
description: Track TeamGrid Developer Platform documentation, API, SDK, CLI, and MCP changes.
---

## Current platform

API v1 and the npm packages are in a controlled beta. Until stable releases begin, authoritative changes are recorded in the public source repositories and their release history:

- [Developer documentation](https://github.com/TeamGrid/developer-docs)
- [SDK, CLI, and MCP packages](https://github.com/TeamGrid/developer-platform)

Breaking changes are not made silently. OpenAPI contract changes, package versions, and migration notes are reviewed together before release.

## 2026-07-21

- Prepared the `1.0.0-beta.2` contract checkpoint with 111 paths, 181 operations, and 78 canonical
  scopes while preserving all 87 frozen API v0 operations.
- Removed the unqualified `/v1/changes` operation, `changes:read` scope, ChangeEvent schema, SDK
  client, and CLI commands from the public beta. The internal implementation remains unavailable
  until preimage, ownership, retention, failover, and recovery semantics are fully qualified.
- Aligned the API client, CLI, and MCP package versions at `1.0.0-beta.2`. MCP remains a bounded
  read-only interface.
- Corrected the earlier documentation mismatch: `1.0.0-alpha.3` was a source checkpoint and was
  never the version installed by npm `next`. Public installation instructions only move to beta 2
  after all three packages have been published and verified.

## 2026-07-20

- Published the code-owned `developer-action-policy-v4` registry for all 182 operations and all 12
  principal-policy families. V4 adds the conditional scopes and dynamic target policies required by
  collaboration, automation, custom-field content, calendar, work-management, and search/export;
  it is pinned by SHA-256 across API, App, packages, and documentation. Native personal,
  service-account, and OAuth issuance remains closed and is not implied by this contract update.
- Published the internal `1.0.0-beta.1` contract checkpoint without changing the controlled-beta
  claim: the contract still contains 112 paths and 182 operations and does not claim complete
  TeamGrid product coverage.
- Added opaque `developerRevision` and `developerUpdatedAt` fields to public project, task, and
  project-template representations, with body-to-header validation for type-specific `prj1`,
  `tsk1`, and `tpl1` strong ETags.
- Made `If-Match` mandatory on exactly 14 project, task, and project-template mutations. Missing,
  malformed, stale, legacy-operation, and temporarily unverifiable revision states use explicit
  `428`, `400`, `412`, `410`, and `503` responses.
- Bound asynchronous project lifecycle and project-template instantiation requests to both their
  idempotency key and source revision. Operation resources now distinguish `sourceRevision` from a
  successful `resultRevision`.
- Added SDK revision and ETag types, required mutation options, CLI `--if-match` handling, and
  read–mutate–reconcile guidance in the synchronized `1.0.0-alpha.3` package checkpoint. Typed
  transport ETags preserve their resource brand, and wait helpers bind polling to the accepted
  operation identity and source revision. MCP remains a curated read-only surface and exposes no
  resource-CAS mutation tools.
- Kept revisions cell-local: clients must return a revision to the same credential-derived regional
  endpoint and must not use a global or cross-region bearer redirect.

## 2026-07-19

- Expanded the controlled-beta API v1 contract to 112 paths and 182 operations, with matching SDK
  methods, CLI commands, and an explicit MCP exposure decision for every operation.
- Added scope- and entitlement-aware system capabilities, secret-free workspace entitlements, a
  six-field revisioned workspace-settings resource, and an authorization-filtered event catalog.
- Added credential-owned webhook configuration revisions and replay-safe reveal-once signing-secret
  rotation. Workspace administration, capability negotiation, event discovery, and secret rotation
  remain unavailable through MCP.
- Added a machine-checked 73-entry product capability ledger plus a canonical SHA-256 manifest for
  the v0 inventory, both OpenAPI contracts, and the cross-interface policy.
- Added asynchronous project complete, reopen, archive, and restore operations with idempotent start,
  durable status records, SDK polling helpers, and CLI wait controls.
- Added scoped call-note and contact-group lifecycle resources. Call notes expose plain text rather
  than internal rich-text state; contact-group parent changes reject cycles and invalid hierarchies.
- Added product, product-group, and project-statement resources. Product acquisition cost and
  project-statement budget data use separate finance read and write overlays.
- Added scoped custom-field-definition lifecycle operations with canonical type/configuration
  validation and explicit legacy compatibility states. Dedicated custom-field-value operations use
  target-resource scopes and strong compare-and-set revisions.
- Added metadata-only project templates with asynchronous, credential-owned instantiation and
  added bounded planned-work reads plus idempotent compare-and-set schedule replacement operations.
- Added credential-owned webhook delivery history with pagination and sanitized attempt metadata.
  URLs, payloads, headers, bodies, signing secrets, and tenant-routing fields are not exposed.
- Added a 90-day, cell-local metadata change feed with credential- and filter-bound checkpoints,
  explicit `410` resynchronization semantics, an authoritative `caughtUp` watermark, typed SDK bootstrap helpers, and script-safe CLI
  checkpoint output. The high-volume feed remains unavailable through MCP.
- Added bounded calendar, absence, availability, comments, activity, document, private-file,
  workspace-administration, federated-search, export, automation, and integration-status contracts.
  Export capabilities are header-only and private storage is streamed through TeamGrid.
- Expanded the read-only MCP profiles to 15 `core` tools and 29 `all` tools. Federated search is the
  only newly curated tool; product tools always omit `purchasePrice`, while personal schedules,
  files, exports, administration, automations, project statements, and webhook delivery history
  remain forbidden.
- Removed Developer Platform audit events from MCP. Audit metadata remains available through the
  explicitly governed API, SDK, and CLI surfaces, but is forbidden in model transcripts.
- Added API discovery, runtime response conformance checks, v1 rate-limit and retry documentation,
  immutable SDK transport metadata, and a Web Crypto webhook verifier with replay protection.
- Added explicit task and time-entry restore operations, task timer start/stop, task
  complete/reopen, and the distinct `timeentry_restored` webhook event.
- Added dedicated lifecycle scopes for lists, services, tags, products, product groups, project
  statements, call notes, contact groups, and custom-field definitions instead of coupling them to
  unrelated task or project access.

## Legacy API v0 history

The previous ReadMe changelog has been preserved below for historical context:

- [Documentation refresh 2026](/api/v0/legacy-changelog/documentation-refresh-2026/)
- [More filters on tasks](/api/v0/legacy-changelog/more-filters-on-tasks/)
- [Project templates and journal entries](/api/v0/legacy-changelog/new-endpoints-for-project-templates-and-journal-entries/)
- [Scheduled work of tasks](/api/v0/legacy-changelog/scheduled-work-of-tasks/)
- [Specifying `userId` on `stopTracking`](/api/v0/legacy-changelog/specifying-userid-on-stoptracking/)
