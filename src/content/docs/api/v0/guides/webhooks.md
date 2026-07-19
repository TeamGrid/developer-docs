---
title: "Webhooks"
description: "Register webhook endpoints, understand delivery payloads, and handle TeamGrid event notifications."
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

Register webhook endpoints, understand delivery payloads, and handle TeamGrid event notifications.

Webhooks let your integration receive event notifications from TeamGrid.

Register a webhook with a target URL and a list of event actions. When one of
the selected events occurs, TeamGrid sends a `POST` request to your URL.

## Register a Webhook

Use [POST /webhooks](/api/v0/reference/operations/v0_post_webhooks/) to register a webhook. Existing
registrations can be listed with [GET /webhooks](/api/v0/reference/operations/v0_get_webhooks/).

```sh
curl https://api.teamgrid.app/webhooks \
  -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/teamgrid/webhook",
    "actions": ["task_created", "task_completed"]
  }'
```

## Delivery Payload

Webhook deliveries include event metadata and the changed document.

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

The exact `doc` shape depends on the event. Some internal or calculated fields
are omitted from update events to reduce noisy deliveries.

## Event Catalog

See the [Webhook Event Catalog](/api/v0/guides/webhook-event-catalog/) for the full list
of event action names, trigger conditions, source collections, and delivery
notes.

## Receiver Security

Use an HTTPS endpoint that you control and keep the webhook URL private. The
public webhook contract does not define a built-in signature header, so protect
your receiver with your own gateway rule, shared-secret URL, or network policy
when the endpoint is reachable from the public internet.

Treat webhook payloads as untrusted input until your receiver has validated the
outer shape, `event`, `collection`, and expected `doc._id`. Ignore unknown
fields so newly added TeamGrid fields do not break your integration.

## Delivery Behavior

TeamGrid only delivers webhooks for active webhook registrations. Disabled
webhooks are skipped. Webhooks are also skipped while a team is locked.

Build your receiver to respond quickly with a `2xx` status code. If you need to
perform slower work, enqueue it in your own system and acknowledge the webhook
first.

Use [Get webhook](/api/v0/reference/operations/v0_get_webhooks_id/) to inspect a registration with
`GET /webhooks/{_id}` and [Delete webhook](/api/v0/reference/operations/v0_delete_webhooks_id/) to remove
one with `DELETE /webhooks/{_id}`.

## Receiver Checklist

* Verify that the request reaches a private endpoint you control.
* Add your own receiver-level secret or allowlist when possible.
* Return a `2xx` response for successful receipt.
* Log the `event`, `webhookId`, and document id.
* Make handlers idempotent where possible.
* Do not assume every event has the same `doc` shape.
* Avoid long-running synchronous work in the webhook response path.
