import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequest } from '../../functions/api/status.js'

function request(method = 'GET') {
  return {
    request: new Request('https://developer.teamgridapp.com/api/status', { method }),
  }
}

test('returns the bounded public status projection', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({
    generatedAt: '2026-07-29T15:21:11.700Z',
    groups: [{ privateImplementationDetail: true }],
    overallStatus: 'operational',
  }))

  const response = await onRequest(request())
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'public, max-age=15, stale-while-revalidate=60')
  assert.deepEqual(await response.json(), {
    generatedAt: '2026-07-29T15:21:11.700Z',
    overallStatus: 'operational',
  })
})

test('fails closed when the upstream status is invalid or unavailable', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({
    overallStatus: 'unexpected',
  }))
  const invalid = await onRequest(request())
  assert.equal(invalid.status, 200)
  assert.deepEqual(await invalid.json(), {
    generatedAt: null,
    overallStatus: 'unknown',
  })

  globalThis.fetch.mock.mockImplementation(async () => {
    throw new Error('network unavailable')
  })
  const unavailable = await onRequest(request())
  assert.equal(unavailable.status, 503)
  assert.equal(unavailable.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await unavailable.json(), {
    generatedAt: null,
    overallStatus: 'unknown',
  })
})

test('rejects unsupported methods', async () => {
  const response = await onRequest(request('POST'))
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('allow'), 'GET')
})
