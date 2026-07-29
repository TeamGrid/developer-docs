---
title: Automate project setup
description: Create repeatable TeamGrid project structures without duplicating work on retries.
owner: Developer Experience
reviewedAt: 2026-07-29
---

## Prefer templates for stable structures

If many projects share lists, tasks or other setup data, start from a project template. Keep the
template ID in configuration and validate that it still belongs to the target workspace before
running the automation.

## Use a stable business key

Derive the idempotency key from a source record that is unique within the integration, such as
`crm-opportunity-4821`. A network retry can then recover the original TeamGrid result instead of
creating a second project.

## Separate creation from lifecycle actions

Create the project through `POST /projects`. Completion, reopening, archiving and restoring are
explicit lifecycle operations. They can be asynchronous, so retain the returned operation ID and
poll `GET /project-lifecycle-operations/{id}` with a bounded deadline.

## Keep later changes safe

Read the project before updating it and pass its current validator. If a workspace member changed
the project in the meantime, a `412` should lead to a deliberate merge decision rather than a blind
retry.

The [project templates guide](/api/v1/project-templates/) documents template semantics and
[resource concurrency](/api/v1/resource-concurrency/) covers validators and idempotency.
