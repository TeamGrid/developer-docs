---
title: Verify webhook signatures
description: Verify TeamGrid webhook v2 HMAC signatures over the exact raw request body in Node.js.
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
