---
title: Verify webhook signatures
description: Verify TeamGrid webhook v2 HMAC signatures over the exact raw request body in Node.js.
owner: Security
reviewedAt: 2026-07-29
---

Capture the request body as raw bytes before any JSON parser runs. The SDK helper verifies the
signature and timestamp before parsing JSON, compares the HMAC in constant time, and can claim
the delivery ID through an atomic deduplication store.

```ts
import { verifyTeamGridWebhook } from '@teamgrid/api-client'

const rawBody = new Uint8Array(await request.arrayBuffer())
const delivery = await verifyTeamGridWebhook<MyEvent>({
  body: rawBody,
  headers: request.headers,
  signingSecret: process.env.TEAMGRID_WEBHOOK_SECRET!,
  deduplicationStore: {
    // This claim must be atomic: true for the first delivery ID, false thereafter.
    claim: (deliveryId, expiresAt) => deliveryIds.claim(deliveryId, expiresAt),
  },
})

await processEvent(delivery.payload)
```

The default timestamp window is five minutes and can be bounded with
`maxTimestampSkewSeconds`. A duplicate claim, invalid metadata, stale timestamp, malformed JSON,
or invalid signature throws `TeamGridWebhookVerificationError` with a stable `code`. Store the
reveal-once signing secret separately from API credentials.

## Express: preserve the raw body

Register the raw-body parser on the webhook route before any application-wide JSON parser. Parse
the payload only after verification succeeds.

```ts
import express from 'express'
import { verifyTeamGridWebhook } from '@teamgrid/api-client'

const app = express()

app.post(
  '/webhooks/teamgrid',
  express.raw({ type: 'application/json', limit: '1mb' }),
  async (request, response, next) => {
    try {
      const delivery = await verifyTeamGridWebhook({
        body: new Uint8Array(request.body),
        headers: request.headers,
        signingSecret: process.env.TEAMGRID_WEBHOOK_SECRET!,
        deduplicationStore: deliveryIds,
      })

      await events.enqueue(delivery.payload)
      response.sendStatus(204)
    } catch (error) {
      next(error)
    }
  },
)
```

Do not call `express.json()` for this route before signature verification. Re-serializing a parsed
object can change whitespace or property ordering and therefore changes the signed byte sequence.

## Failure handling

Return a non-2xx response for an invalid signature, stale timestamp, or malformed envelope. For a
valid delivery, persist or enqueue the event before returning `204`; perform slow downstream work
asynchronously. The deduplication claim must be atomic and retained for at least the delivery retry
window. Log the stable verification error code and delivery identifier when available, but never
log the signing secret or an unrestricted payload.
