---
title: Security
description: Handle TeamGrid API credentials, scopes, regional routing, webhooks, and vulnerability reports safely.
---

## Credentials

API credentials are bearer secrets. TeamGrid reveals a new API v1 credential once; store it immediately in a secret manager or the CLI's operating-system credential store.

- Grant only the scopes required by the integration.
- Use separate credentials per environment and workload.
- Never place credentials in URLs, source control, screenshots, or support messages.
- Do not pass credentials as command-line arguments.
- Revoke suspected or unused credentials in **Settings → Developer**.
- Treat a copied credential as compromised, even if it was not used.

The location prefix helps official clients choose the correct regional endpoint. It is not an authorization decision. The destination cell validates the full secret and workspace permissions.

## Authorization boundary

Every authenticated API v1 operation is registered once in a canonical action-policy registry. A
request is allowed only at the intersection of credential authentication, active principal and
workspace state, owning region and cell, entitlements, effective scopes, current product
permissions, resource grants, conditional domain policy, sensitive-field overlays, and the domain
command's own invariants. If a required evaluator or registry identity is unavailable, the request
fails closed.

SDK, CLI, and MCP are clients of this same API boundary. They cannot add authority. MCP further
removes most sensitive and all write operations from its local tool catalog, but its allowed reads
still pass through the complete API policy.

The current controlled beta still issues `tg_sk_v1_` credentials. Native personal-access tokens,
autonomous service accounts, and delegated OAuth remain separate rollout gates; no legacy
credential is automatically promoted to a service account.

## Sensitive resource scopes

Finance scopes are overlays and must be paired with the corresponding base product or
project-statement scope. Do not grant them to an MCP credential: MCP product tools remove
`purchasePrice`, and project statements are unavailable in every tool profile. Call notes, contacts,
users, service billing data, audit events, and webhook delivery metadata also deserve dedicated
least-privilege credentials and controlled downstream retention.

The first public beta does not expose a change feed. Do not use audit events, delivery history, or
aggressive polling as an undocumented substitute. For supported webhook workflows, keep signing
secrets and delivery metadata out of logs and fetch current resource state through its independently
scoped endpoint.

Custom-field values and planned-work schedules can contain customer, personnel, or workload data.
Their write operations require strong compare-and-set revisions so integrations cannot silently
overwrite concurrent edits. Project templates can encode an organization's workflow structure.
All three families and their operation status resources are unavailable in every MCP profile.

Calendar, absence, availability, comments, documents, and files can contain personal or free-form
content. Administration PII, export jobs, automation metadata, and integration-installation status
use sensitive scopes and should have dedicated credentials. Export download capabilities are sent
only in `X-TeamGrid-Export-Download-Intent`; never place them in URLs, logs, command arguments, or AI
transcripts. All of these resource families remain unavailable to MCP except bounded federated
search, which is a separately curated sensitive tool and still enforces every requested domain
scope.

## Webhooks

For signed v2 webhooks, verify the HMAC over the exact raw request body before parsing it, reject stale timestamps, compare signatures in constant time, and deduplicate the delivery ID. Store the reveal-once webhook signing secret separately from API credentials.

Delivery-history reads are credential-owned. Returned records intentionally exclude URLs, payloads,
headers, bodies, secrets, and routing internals. Do not use delivery metadata as a substitute for a
receiver-side event log.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability or include live credentials in a report. Follow the private reporting instructions in the repository's [security policy](https://github.com/TeamGrid/developer-docs/security/policy).
