---
title: Changelog
description: Track TeamGrid Developer Platform documentation, API, SDK, CLI, and MCP changes.
---

## Current platform

API v1 and the npm packages are in a controlled beta. Until stable releases begin, authoritative changes are recorded in the public source repositories and their release history:

- [Developer documentation](https://github.com/TeamGrid/developer-docs)
- [SDK, CLI, and MCP packages](https://github.com/TeamGrid/developer-platform)

Breaking changes are not made silently. OpenAPI contract changes, package versions, and migration notes are reviewed together before release.

## 2026-07-19

- Expanded the controlled-beta API v1 contract to 107 paths and 176 operations, with matching SDK
  methods, CLI commands, and an explicit MCP exposure decision for every operation.
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
- Expanded the read-only MCP profiles to 15 `core` tools and 30 `all` tools. Federated search is the
  only newly curated tool; product tools always omit `purchasePrice`, while personal schedules,
  files, exports, administration, automations, project statements, and webhook delivery history
  remain forbidden.
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
