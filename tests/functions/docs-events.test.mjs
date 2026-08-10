import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequest } from '../../functions/api/docs-events.js'

function context(body, method = 'POST') {
  const points = []
  return {
    context: {
      env: { DOCS_ANALYTICS: { writeDataPoint: (point) => points.push(point) } },
      request: new Request('https://developer.teamgridapp.com/api/docs-events', {
        body: method === 'POST' ? JSON.stringify(body) : undefined,
        headers: { 'Content-Type': 'application/json' },
        method,
      }),
    },
    points,
  }
}

test('accepts a bounded feedback event without identity data', async () => {
  const fixture = context({
    event: 'page_feedback',
    path: '/api/v1/errors/?token=must-not-survive',
    value: 1,
  })
  const response = await onRequest(fixture.context)
  assert.equal(response.status, 204)
  assert.deepEqual(fixture.points, [{
    blobs: ['page_feedback', '/api/v1/errors/', 'all', 'none', ''],
    doubles: [1],
    indexes: ['developer-docs'],
  }])
})

test('stores only the allow-listed search filter and count', async () => {
  const fixture = context({
    event: 'search_performed',
    filter: 'API v1',
    path: '/guides/get-started/',
    query: 'this field is intentionally ignored',
    value: 12,
  })
  const response = await onRequest(fixture.context)
  assert.equal(response.status, 204)
  assert.deepEqual(fixture.points[0].blobs, [
    'search_performed',
    '/guides/get-started/',
    'API v1',
    'none',
    '',
  ])
  assert.deepEqual(fixture.points[0].doubles, [12])
})

test('stores only a one-way bounded hash for searches without results', async () => {
  const fixture = context({
    event: 'search_no_results',
    filter: 'CLI',
    path: '/cli/reference/',
    query: 'the raw search phrase must be ignored',
    queryHash: '0123456789abcdef01234567',
    value: 0,
  })
  const response = await onRequest(fixture.context)
  assert.equal(response.status, 204)
  assert.deepEqual(fixture.points[0].blobs, [
    'search_no_results',
    '/cli/reference/',
    'CLI',
    '0123456789abcdef01234567',
    '',
  ])
})

test('accepts short optional detail but rejects credential-shaped content', async () => {
  const fixture = context({
    event: 'page_feedback_detail',
    feedback: 'Please add a service account rotation example.',
    path: '/guides/service-account-rollout/',
    value: 0,
  })
  assert.equal((await onRequest(fixture.context)).status, 204)
  assert.deepEqual(fixture.points[0].blobs, [
    'page_feedback_detail',
    '/guides/service-account-rollout/',
    'all',
    'none',
    'Please add a service account rotation example.',
  ])

  const secret = context({
    event: 'page_feedback_detail',
    feedback: 'My token is tg_pat_v2_not-a-real-value',
    path: '/',
    value: 0,
  })
  assert.equal((await onRequest(secret.context)).status, 400)
  assert.equal(secret.points.length, 0)
})

test('rejects unsupported events and methods', async () => {
  const invalid = context({ event: 'credential_seen', path: '/' })
  assert.equal((await onRequest(invalid.context)).status, 400)
  assert.equal(invalid.points.length, 0)
  const get = context({}, 'GET')
  assert.equal((await onRequest(get.context)).status, 405)
})
