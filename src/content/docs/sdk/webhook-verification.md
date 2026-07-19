---
title: Verify webhook signatures
description: Verify TeamGrid webhook v2 HMAC signatures over the exact raw request body in Node.js.
---

Capture the request body as raw bytes before any JSON parser runs. The signed input is `<timestamp>.<exact raw body>`.

```ts
import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyTeamGridWebhook({
  rawBody,
  secret,
  signatureHeader,
  timestamp,
}: {
  rawBody: Buffer
  secret: string
  signatureHeader: string
  timestamp: string
}) {
  const supplied = signatureHeader.replace(/^v1=/, '')
  const expected = createHmac('sha256', secret)
    .update(timestamp)
    .update('.')
    .update(rawBody)
    .digest('hex')

  const left = Buffer.from(supplied, 'hex')
  const right = Buffer.from(expected, 'hex')
  return left.length === right.length && timingSafeEqual(left, right)
}
```

Before accepting the payload, also reject stale timestamps and duplicate `X-TeamGrid-Webhook-Id` values. Store the signing secret separately from the API credential.

The current SDK prerelease documents this procedure but does not yet export a verification helper. Keep this implementation local and covered by receiver tests until that helper is published.
