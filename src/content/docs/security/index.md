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

## Sensitive resource scopes

Finance scopes are overlays and must be paired with the corresponding base product or
project-statement scope. Do not grant them to an MCP credential: MCP product tools remove
`purchasePrice`, and project statements are unavailable in every tool profile. Call notes, contacts,
users, service billing data, audit events, and webhook delivery metadata also deserve dedicated
least-privilege credentials and controlled downstream retention.

Change-feed cursors are not bearer credentials, but they are signed for one credential, workspace,
cell, epoch, and filter set. Keep them in the integration's state store rather than logs or URLs.
Change events contain metadata only; fetch current resource state through its independently scoped
endpoint. The change feed is intentionally unavailable to MCP.

Custom-field values and planned-work schedules can contain customer, personnel, or workload data.
Their write operations require strong compare-and-set revisions so integrations cannot silently
overwrite concurrent edits. Project templates can encode an organization's workflow structure.
All three families and their operation status resources are unavailable in every MCP profile.

## Webhooks

For signed v2 webhooks, verify the HMAC over the exact raw request body before parsing it, reject stale timestamps, compare signatures in constant time, and deduplicate the delivery ID. Store the reveal-once webhook signing secret separately from API credentials.

Delivery-history reads are credential-owned. Returned records intentionally exclude URLs, payloads,
headers, bodies, secrets, and routing internals. Do not use delivery metadata as a substitute for a
receiver-side event log.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability or include live credentials in a report. Follow the private reporting instructions in the repository's [security policy](https://github.com/TeamGrid/developer-docs/security/policy).
