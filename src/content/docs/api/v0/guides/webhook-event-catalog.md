---
title: "Webhook Event Catalog"
description: "Review TeamGrid webhook event action names, source collections, trigger conditions, payload shape, and receiver recommendations."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Review TeamGrid webhook event action names, source collections, trigger conditions, payload shape, and receiver recommendations.

Webhook registrations use event action names in the `actions` array. For
example, a webhook that should receive newly created and completed tasks uses
`["task_created", "task_completed"]`.

Use [POST /webhooks](/api/v0/reference/operations/v0_post_webhooks/) to create registrations,
[GET /webhooks](/api/v0/reference/operations/v0_get_webhooks/) to inspect them, and
[Delete webhook](/api/v0/reference/operations/v0_delete_webhooks_id/) to remove a registration with
`DELETE /webhooks/{_id}`.
The `actions` field in the API Reference uses the same event list as an
OpenAPI enum, so API tools can validate webhook registrations before sending
them.

## Delivery Payload

Every delivery has the same outer envelope:

```json
{
  "webhookId": "WEBHOOK_ID",
  "event": "task_completed",
  "collection": "cards",
  "userId": "USER_ID",
  "fieldNames": ["completed", "completedDate"],
  "doc": {
    "_id": "TASK_ID",
    "teamId": "TEAM_ID",
    "name": "Prepare launch checklist",
    "completed": true
  }
}
```

`doc` contains the changed TeamGrid document or an event-specific projection.
Update events may omit internal, calculated, or noisy fields. Use `event`,
`collection`, and `doc._id` as the stable routing keys in your receiver.

## Team And User Events

| Event action   | Source collection | Trigger                                |
| -------------- | ----------------- | -------------------------------------- |
| `user_online`  | `users`           | A team user changes status to online.  |
| `user_offline` | `users`           | A team user changes status to offline. |
| `user_added`   | `teams`           | A user is added to the team.           |
| `user_removed` | `teams`           | A user is removed from the team.       |

`user_added` and `user_removed` send a compact `doc` with the affected
`userIds`.

## Task Events

| Event action     | Source collection | Trigger                                                                      |
| ---------------- | ----------------- | ---------------------------------------------------------------------------- |
| `task_created`   | `cards`           | A task is created.                                                           |
| `task_updated`   | `cards`           | A non-archived task is updated without changing completion or archive state. |
| `task_completed` | `cards`           | A task changes from incomplete to completed.                                 |
| `task_reopened`  | `cards`           | A task changes from completed to incomplete.                                 |
| `task_removed`   | `cards`           | A task is archived or removed.                                               |
| `task_restored`  | `cards`           | An archived task is restored.                                                |

Tasks are stored internally as cards. Webhook payloads therefore use
`collection: "cards"` for task events.

## Time Tracking Events

| Event action                 | Source collection | Trigger                                                                                              |
| ---------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| `timetracking_started`       | `times`           | An active time entry is created without an end time.                                                 |
| `timetracking_stopped`       | `times`           | An active time entry receives an end time.                                                           |
| `timeentry_created_manually` | `times`           | A completed time entry is created with both start and end time.                                      |
| `timeentry_updated`          | `times`           | A non-archived time entry is updated without changing archive state or start/end/duration semantics. |
| `timeentry_removed`          | `times`           | A time entry is archived or removed.                                                                 |
| `timeentry_restored`         | `times`           | An archived time entry is restored.                                                                  |

Use [Dates and Time Zones](/api/v0/guides/dates-and-time-zones/) when interpreting
`start`, `end`, and `duration` values.

## Project Events

| Event action        | Source collection | Trigger                                                                         |
| ------------------- | ----------------- | ------------------------------------------------------------------------------- |
| `project_created`   | `projects`        | A project is created.                                                           |
| `project_updated`   | `projects`        | A non-archived project is updated without changing completion or archive state. |
| `project_completed` | `projects`        | A project changes from incomplete to completed.                                 |
| `project_reopened`  | `projects`        | A project changes from completed to incomplete.                                 |
| `project_archived`  | `projects`        | A project is archived.                                                          |
| `project_restored`  | `projects`        | An archived project is restored.                                                |

## Contact Events

| Event action       | Source collection | Trigger                            |
| ------------------ | ----------------- | ---------------------------------- |
| `contact_created`  | `contacts`        | A contact is created.              |
| `contact_updated`  | `contacts`        | A non-archived contact is updated. |
| `contact_removed`  | `contacts`        | A contact is archived or removed.  |
| `contact_restored` | `contacts`        | An archived contact is restored.   |

## Call And Call Note Events

Call and call note events require the TeamGrid telephony features used by the
team.

| Event action       | Source collection | Trigger                                   |
| ------------------ | ----------------- | ----------------------------------------- |
| `call_incoming`    | `cards`           | An incoming call record is created.       |
| `call_outgoing`    | `cards`           | An outgoing call record is created.       |
| `call_answered`    | `cards`           | A call state changes to active.           |
| `call_missed`      | `cards`           | An incoming call state changes to missed. |
| `call_hangup`      | `cards`           | A call state changes to cancelled.        |
| `callnote_created` | `callnotes`       | A call note is created.                   |
| `callnote_removed` | `callnotes`       | A call note is archived or removed.       |

Call notes are delivered with their rich text content converted to plain text.

## Receiver Recommendations

* Treat webhook delivery as at-least-once and make handlers idempotent.
* Acknowledge successful receipt with a `2xx` response quickly.
* Keep the webhook URL private and protect public receivers with a
  receiver-level secret or gateway rule.
* Enqueue slow work in your own system instead of blocking the webhook response.
* Log `webhookId`, `event`, `collection`, `doc._id`, and `fieldNames`.
* Do not assume every event has the same `doc` shape.
* Ignore unknown fields and tolerate newly added fields.
