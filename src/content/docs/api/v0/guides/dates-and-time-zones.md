---
title: "Dates and Time Zones"
description: "Use ISO 8601 timestamps and UTC for predictable filtering, scheduling, and time tracking."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Use ISO 8601 timestamps and UTC for predictable filtering, scheduling, and time tracking.

Use ISO 8601 timestamps for all date and time values.

Recommended format:

```text
2026-07-01T09:30:00Z
```

The `Z` suffix means UTC. Sending UTC timestamps is the safest option for
integrations because it avoids ambiguity around local time zones and daylight
saving changes.

## Request Fields

Common timestamp fields include:

* `createdAt`
* `updatedAt`
* `plannedStart`
* `plannedEnd`
* `scheduledStart`
* `scheduledEnd`
* `dueDate`
* `start`
* `end`
* `date`
* `time`

## Date Range Filters

Many list endpoints support `From` and `To` filters.

Examples:

```text
GET /tasks?plannedStartFrom=2026-07-01T00:00:00Z
GET /tasks?plannedStartTo=2026-07-31T23:59:59Z
GET /times?startFrom=2026-07-01T00:00:00Z&startTo=2026-07-31T23:59:59Z
GET /scheduledWork?dateFrom=2026-07-01T00:00:00Z&dateTo=2026-07-31T23:59:59Z
```

See [List tasks](/api/v0/reference/operations/v0_get_tasks/), [List time entries](/api/v0/reference/operations/v0_get_times/),
and [List scheduled work](/api/v0/reference/operations/v0_get_scheduledwork/) for the full filter
sets.

## Time Tracking

When [starting](/api/v0/reference/operations/v0_post_tasks_id_starttracking/) or
[stopping](/api/v0/reference/operations/v0_post_tasks_id_stoptracking/) time tracking, send the event time
explicitly:

```json
{
  "userId": "USER_ID",
  "time": "2026-07-01T09:00:00Z"
}
```

This makes the integration deterministic and avoids relying on server receipt
time.

## Best Practices

* Store timestamps in UTC.
* Send timezone-aware timestamps.
* Avoid date-only values for fields that represent a precise moment.
* Convert to local time only in your user interface or reporting layer.
