---
title: Automations and integrations
description: Inspect the public automation DSL, manage versioned definitions and runs, and read installation status without revealing provider secrets.
---

## Public automation contract

`GET /automation-actions` returns the public action catalog, including configuration shape, branches,
inputs, outputs, and the domain-write scopes required by an action. Build automation flows from this
catalog; do not depend on TeamGrid's internal job names or storage representation.

Automation definitions support list, get, create, compare-and-set update, archive, restore, and
version history. Triggers are restricted to public `create` and `change` events for projects or
tasks. A flow may contain only public action IDs and must satisfy every domain-write scope implied by
its trigger and steps in addition to `automations:write`.

Creates accept `Idempotency-Key`. Updates require the latest strong `aut1` revision in `If-Match`.
Archived definitions remain explicit lifecycle state rather than disappearing from history.

## Runs

Runs are read-only execution records with `running`, `succeeded`, `failed`, or `aborted` state. List
requests can filter by definition, state, or a public target reference. Aborting a running execution
requires `automations:run` and the latest strong `aur1` revision. Treat a stale `412` as a state
change, then re-read before deciding whether another action is necessary.

## Integration-installation status

`GET /integration-installations` reports bounded installation status for supported providers such as
Google Calendar, Sipgate, and Slack. It exposes neither access tokens nor provider configuration
secrets and does not perform live provider verification; `verification: "not_checked"` is explicit.
The operation requires the sensitive `integrations:read` scope.

Automation definitions, action metadata, execution records, execution control, and integration
status are forbidden in every MCP profile. Use API v1, the SDK, or the CLI for these administrative
workflows.
