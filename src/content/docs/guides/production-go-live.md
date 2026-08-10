---
title: Production go-live checklist
description: Verify TeamGrid credentials, routing, retries, concurrency, observability, webhooks, rollout, and rollback before handling customer data.
owner: Developer Platform
reviewedAt: 2026-08-10
---

Use this checklist for every deployed API or SDK integration and every unattended CLI process.
Record the evidence in the integration's release ticket. MCP remains a supervised read surface and
uses the separate host review below.

## 1. Ownership and contract

- Name a technical owner and an operational escalation contact.
- Pin `@teamgrid/api-client`, `@teamgrid/cli`, or `@teamgrid/mcp-server` to the verified stable
  version where reproducibility matters.
- Record every API operation used by the integration.
- Review the [capability coverage](/guides/capability-coverage/) and changelog.
- Keep API v0 dependencies in a separate migration inventory.

## 2. Credential and authority

- Use a service account for every deployed, scheduled, shared, or CI process.
- Store the reveal-once credential in a secret manager and inject it only at runtime.
- Apply the smallest scope set from the [scope recipes](/guides/scope-recipes/).
- Add resource grants when the service must be narrower than workspace-wide access.
- Verify one allowed and one deliberately forbidden operation.
- Document rotation, emergency revocation, owner departure, and compromised-secret procedures.

Never allow an application credential to mint or broaden its own authority.

## 3. Region and network path

- Call `GET /workspace` and record the expected workspace, region, and cell.
- Let official clients derive the regional endpoint from the credential.
- For direct HTTP clients, route German credentials to `api.de.teamgrid.app` and United States
  credentials to `api.us.teamgrid.app`.
- Refuse cross-origin redirects that could forward an Authorization header.
- Bound DNS, connect, TLS, request, and total operation timeouts where the HTTP stack exposes them.
- Test the production proxy, CA trust, egress allow-list, and IPv4/IPv6 behavior from the actual
  runtime environment.

## 4. Reads, pagination, and limits

- Set an explicit `limit` on every list request.
- Treat cursors as opaque and bind them to the original credential, region, and filter set.
- Bound total pages, records, bytes, and elapsed time for every batch.
- Reject responses that exceed the application's expected size.
- Persist a cursor only after the corresponding page is durably committed.

## 5. Writes and concurrency

- Derive stable idempotency keys from a durable business operation, not the current time.
- Read protected resources immediately before writing and retain their strong ETag or developer
  revision.
- Handle `412` by re-reading and making a deliberate merge decision.
- Treat `428` as an implementation error; do not retry without a precondition.
- Never use wildcard `If-Match` values.
- Bound all asynchronous operation polling by time and interval, and bind polling to the accepted
  operation returned by the start request.

## 6. Retry and error policy

- Retry only transient reads and writes protected by an idempotency key.
- Respect `Retry-After` and add bounded jitter.
- Cap attempts and total elapsed time.
- Do not retry validation, permission, scope, stale-revision, or not-found failures blindly.
- Give operators a stable classification for `401`, `403`, `409`, `412`, `428`, `429`, and
  dependency failures.

## 7. Observability and support

- Record status, operation name, duration, attempt count, region, and TeamGrid request ID.
- Never record bearer credentials, webhook secrets, authorization URLs, upload/download intents,
  headers, environment dumps, or unrestricted customer payloads.
- Monitor success rate, latency, rate limits, retry exhaustion, authentication failures, and queue
  age.
- Link alerts to the [request troubleshooting](/resources/troubleshooting/) runbook and
  [TeamGrid Status](https://status.teamgrid.app/).

## 8. Webhooks and durable synchronization

- Verify the signature against the exact raw body before parsing.
- Enforce timestamp tolerance and a bounded body size.
- Claim the delivery ID atomically before processing.
- Persist or enqueue valid events before returning success.
- Re-read important resources through API v1.
- Use a checkpoint-before-snapshot change-feed flow when durable reconciliation is required.
- Test signing-secret rotation with the documented overlap procedure.

## 9. Data protection

- Classify personal, commercial, finance, audit, and file data handled by the integration.
- Apply downstream access controls and the shortest practical retention period.
- Verify that logs, traces, error reporting, test fixtures, and support bundles redact secrets and
  customer payloads.
- Keep production credentials and customer data out of local examples and automated tests.

## 10. Rollout and rollback

1. Deploy with processing disabled or limited to a dedicated test resource.
2. Run workspace discovery and one bounded read.
3. Exercise one idempotent write where the integration writes data.
4. Enable a small, observable cohort or bounded workload.
5. Monitor errors, latency, rate limits, and audit events.
6. Expand only after the observation window passes.

The rollback plan must stop new work, preserve safe retry identifiers and cursors, revert the
application, and revoke a credential only when continued access is unsafe. Do not discard a cursor
or idempotency record merely because the application version was rolled back.

## MCP host review

Before enabling MCP, additionally verify the selected tool profile, dedicated credential, host and
extension trust, transcript retention, model-provider data controls, approval behavior, and result
redaction. Run only the `core` profile until broader access has a written justification.
