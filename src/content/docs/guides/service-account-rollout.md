---
title: Roll out a service account
description: Introduce a long-lived TeamGrid integration with least privilege, resource grants, and tested rotation.
owner: Security
reviewedAt: 2026-07-30
---

Use a service account when an integration represents a system rather than one person. Keep personal
access tokens for human-owned workflows and local development.

## Define the boundary

List the exact operations the integration performs and translate them into the smallest required
scope set. Add resource grants when the service should see only selected governed resources.

Avoid broad administration, finance, audit, or credential-management scopes unless the integration
actually implements those responsibilities.

## Create and reveal once

The Developer Center creates the service-account principal and its first credential together. The
initial grant set is derived from the selected scopes. Before production use, replace it through
the API or CLI when the service must be restricted to specific governed resources. Additional
credentials can then be issued only inside the account's existing scope ceiling.

Every secret is returned once. Move it directly into a secret manager and record only the
credential identifier, owner, purpose, and planned rotation date.

## Prove access before rollout

1. Call `GET /workspace`.
2. Run one expected read.
3. Confirm a forbidden resource returns `403` or remains invisible.
4. Exercise one idempotent write in a dedicated test resource.
5. Revoke a test credential and verify it immediately stops authenticating.

## Rotate without downtime

Issue the replacement credential, deploy it, verify successful traffic, and only then revoke the
old credential. Keep the overlap short and monitor request IDs rather than bearer values.

Review [credentials and scopes](/api/v1/authentication/), [administration](/api/v1/administration/)
and the [error guide](/api/v1/errors/) before enabling the service for customer data.
