---
title: Audit users and integration access
description: Review workspace users, scopes and service-account authority without broadening access.
owner: Security
reviewedAt: 2026-07-29
---

## Keep identity and authority separate

`GET /users` returns users visible to the credential. It does not grant permission to act as those
users. Delegated calendar or administrative operations require their own documented scopes and
product permissions.

## Inventory machine access

List personal credentials and service accounts through the administration endpoints. Record the
owner, purpose, creation date, last rotation and granted scopes outside the token itself. Never log
or export reveal-once secrets.

For service accounts with resource grants, read the current grant revision before replacing the
complete desired set. Grant replacement is a compare-and-set operation, not an additive patch.

## Review regularly

A useful access review checks:

- whether the integration is still in use;
- whether each scope is exercised;
- whether the owner still has the expected role;
- whether credentials have a recent tested rotation;
- whether resource grants remain narrower than workspace-wide access.

Revoke unused credentials immediately and verify that the integration fails closed. See
[credentials and scopes](/api/v1/authentication/) and
[administration](/api/v1/administration/) for the complete contract.
