---
title: "Pagination and Filtering"
description: "Use page, limit, id, boolean, and date filters to retrieve the exact TeamGrid records an integration needs."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Use page, limit, id, boolean, and date filters to retrieve the exact TeamGrid records an integration needs.

List endpoints support pagination with `page` and `limit`.
Paginated responses include a `pagination` object next to the returned `data`
array.

Reference pages with the largest filter surfaces:

* [List tasks](/api/v0/reference/operations/v0_get_tasks/)
* [List time entries](/api/v0/reference/operations/v0_get_times/)
* [List scheduled work](/api/v0/reference/operations/v0_get_scheduledwork/)
* [List journal entries](/api/v0/reference/operations/v0_get_journalentries/)

## Pagination Parameters

```text
?page=1&limit=50
```

`page` selects the page number. Pages start at `1`.

`limit` selects the maximum number of records returned per page. The default
page size is `50`. The maximum documented page size is `500`.

Example:

```sh
curl "https://api.teamgrid.app/tasks?page=2&limit=100" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

## Filtering by ID

Several endpoints support filtering by related ids. Where documented, multiple
ids can be sent as a comma-separated list.

Example:

```text
GET /tasks?projectId=PROJECT_ID
GET /tasks?userId=USER_1,USER_2
GET /times?taskId=TASK_ID
```

## Boolean Filters

Boolean filters use `true` or `false`.

Examples:

```text
GET /projects?completed=false&archived=false
GET /tasks?completed=true
GET /times?active=true
```

## Date Filters

Date filters use ISO 8601 timestamps.

Examples:

```text
GET /tasks?updatedAtFrom=2026-07-01T00:00:00Z
GET /times?startFrom=2026-07-01T00:00:00Z&startTo=2026-07-31T23:59:59Z
```

## Common List Filters

Tasks support these filter groups:

| Purpose           | Filters                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Assignment        | `userId`, `contactId`, `projectId`                                                                     |
| State             | `completed`, `archived`                                                                                |
| Creation window   | `createdAtFrom`, `createdAtTo`                                                                         |
| Update window     | `updatedAtFrom`, `updatedAtTo`                                                                         |
| Planning window   | `plannedStartFrom`, `plannedStartTo`, `plannedEndFrom`, `plannedEndTo`                                 |
| Scheduling window | `scheduledStartFrom`, `scheduledStartTo`, `scheduledEndFrom`, `scheduledEndTo`, `includeScheduledWork` |

Time entries support these filter groups:

| Purpose     | Filters                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| Ownership   | `userId`, `taskId`, `projectId`, `serviceId`, `contactId`                                |
| Time window | `startFrom`, `startTo`                                                                   |
| Billing     | `billed`                                                                                 |
| State       | `active`, `type`, `taskCompleted`, `projectCompleted`, `taskArchived`, `projectArchived` |

Scheduled work supports:

| Purpose     | Filters              |
| ----------- | -------------------- |
| Ownership   | `userId`, `taskId`   |
| Date window | `dateFrom`, `dateTo` |

Journal entries support:

| Purpose           | Filters                               |
| ----------------- | ------------------------------------- |
| Ownership         | `projectId`, `productId`, `createdBy` |
| Entry date window | `dateFrom`, `dateTo`                  |
| Creation window   | `createdAtFrom`, `createdAtTo`        |
