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

## Webhooks

For signed v2 webhooks, verify the HMAC over the exact raw request body before parsing it, reject stale timestamps, compare signatures in constant time, and deduplicate the delivery ID. Store the reveal-once webhook signing secret separately from API credentials.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability or include live credentials in a report. Follow the private reporting instructions in the repository's [security policy](https://github.com/TeamGrid/developer-docs/security/policy).
