---
title: Calendar and availability
description: Work with TeamGrid appointments, absences, availability, and planned-work schedules without bypassing delegated access controls.
---

API v1 separates four scheduling concepts:

| Resource | Contract |
| --- | --- |
| Appointments | Bounded list, get, create, compare-and-set update, archive, and restore |
| Absences | Bounded list, get, create, compare-and-set update, archive, and restore |
| Availability | Read-only intervals derived for an explicit time zone and bounded window |
| Planned work | Task schedules with atomic, asynchronous whole-schedule replacement |

Appointment and absence list requests require `start` and `end`. Availability additionally requires
an IANA `timeZone`. These bounds are part of the safety contract; do not use the calendar resources
as an unbounded history export.

## Acting user and delegated access

The base appointment and absence scopes cover the credential's normal acting-user boundary. Reading
another user's appointments requires `appointments:delegated:read`; writing them requires
`appointments:delegated:write`. Foreign absence reads require `absences:delegated:read`, while
administrative absence writes require `absences:admin:write`. Foreign availability requires
`availability:delegated:read`.

An overlay scope is necessary but not sufficient. TeamGrid also checks active membership, the
relevant product permission and, for appointments or availability, calendar sharing. A caller cannot
gain delegated access by supplying another `userId` without those checks.

## Concurrency and lifecycle

Create requests support `Idempotency-Key`. Read the latest appointment or absence before changing it,
then send its strong revision with `If-Match`. A missing precondition returns `428`; a stale revision
returns `412`. Archive and restore are explicit lifecycle operations rather than generic field
patches.

Planned-work replacement has a separate asynchronous operation resource because it replaces the
complete task schedule. Follow the [planned-work guide](/api/v1/planned-work/) for its revision,
idempotency, and polling contract.

Calendar, absence, availability, and planned-work data are intentionally unavailable through MCP,
including the `all` profile.
