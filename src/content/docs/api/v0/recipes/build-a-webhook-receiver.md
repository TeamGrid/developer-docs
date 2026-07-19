---
title: "Build a webhook receiver"
description: "import express from 'express'"
---

> This page documents the legacy API v0. New integrations should use [API v1](/api/v1/).

```javascript Node.js
import express from 'express'

const app = express()
app.use(express.json())

app.post('/teamgrid/webhook', async (req, res) => {
  const { webhookId, event, collection, fieldNames, doc } = req.body

  await enqueueWebhookEvent({
    webhookId,
    event,
    collection,
    fieldNames,
    documentId: doc && doc._id,
    payload: req.body,
  })

  res.status(204).end()
})

app.listen(3000)

// Register this endpoint in TeamGrid:
// curl https://api.teamgrid.app/webhooks \
//   -X POST \
//   -H "Authorization: Bearer $TEAMGRID_API_TOKEN" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "url": "https://example.com/teamgrid/webhook",
//     "actions": ["task_created", "task_completed"]
//   }'
```

```json Response Example
Make webhook handlers idempotent and respond quickly. If processing fails later in your own queue, retry from that queue rather than blocking the TeamGrid webhook response.
```

# Create the receiver endpoint

<!-- javascript@1-18 -->

Expose a POST endpoint that accepts JSON and returns a 2xx response after the event is safely recorded.

# Register the webhook

<!-- javascript@20-30 -->

Use POST /webhooks with the public HTTPS URL and the event actions your integration needs.

# Process events asynchronously

<!-- javascript@8-15 -->

Use event, webhookId, collection, and doc._id for routing and idempotency. Enqueue slow work after receipt.
