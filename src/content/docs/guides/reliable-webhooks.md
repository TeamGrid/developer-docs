---
title: Process webhooks reliably
description: Verify, acknowledge and process TeamGrid webhook deliveries without losing events.
owner: Security
reviewedAt: 2026-07-29
---

## Verify the raw request

Validate the signature against the exact bytes received from TeamGrid before parsing JSON. Enforce a
bounded body size and reject signatures outside the documented timestamp tolerance.

The TypeScript SDK exposes `verifyTeamGridWebhook` for this purpose. Keep the webhook secret in a
secret manager and support overlapping secrets during a controlled rotation.

## Acknowledge quickly

After verification, store the delivery ID and payload in a durable queue, then return a success
response. Do not perform slow third-party calls while TeamGrid is waiting for acknowledgement.

Use the delivery ID as a deduplication key. Delivery is at least once, so a receiver must treat a
repeat as normal.

## Re-read important resources

A webhook tells you that something changed. When correctness matters, fetch the current resource
through API v1 before applying a downstream update. This avoids building state from an event that
was followed immediately by another change.

## Operate the receiver

Monitor signature failures, queue age and repeated processing errors separately. Rotate the secret
through `POST /webhooks/{id}/secret-rotation`, confirm the new receiver path, then retire the old
secret.

See [signed webhooks](/api/v1/webhooks/) and the
[SDK verification guide](/sdk/webhook-verification/) for the exact contract.
