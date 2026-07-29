const statusEndpoint = 'https://status.teamgrid.app/api/v1/status'
const allowedStatuses = new Set(['operational', 'degraded', 'outage', 'unknown'])
const maximumPayloadBytes = 256 * 1024

async function readBoundedJson(response) {
  if (!response.body) throw new Error('Status response has no body.')

  const declaredLength = Number(response.headers.get('content-length') || 0)
  if (Number.isFinite(declaredLength) && declaredLength > maximumPayloadBytes) {
    throw new Error('Status response is too large.')
  }

  const reader = response.body.getReader()
  const chunks = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > maximumPayloadBytes) {
      await reader.cancel()
      throw new Error('Status response is too large.')
    }
    chunks.push(value)
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(body))
}

function jsonResponse(payload, status, cacheControl) {
  return Response.json(payload, {
    headers: {
      'Cache-Control': cacheControl,
      'Content-Security-Policy': "default-src 'none'",
      'X-Content-Type-Options': 'nosniff',
    },
    status,
  })
}

export const onRequestGet = async () => {
  try {
    const response = await fetch(statusEndpoint, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'TeamGrid-Developer-Portal/1.0',
      },
      signal: AbortSignal.timeout(4_000),
    })
    if (!response.ok) throw new Error('Status endpoint is unavailable.')

    const payload = await readBoundedJson(response)
    const overallStatus = allowedStatuses.has(payload.overallStatus)
      ? payload.overallStatus
      : 'unknown'

    return jsonResponse(
      {
        generatedAt: typeof payload.generatedAt === 'string' ? payload.generatedAt : null,
        overallStatus,
      },
      200,
      'public, max-age=15, stale-while-revalidate=60',
    )
  } catch {
    return jsonResponse(
      { generatedAt: null, overallStatus: 'unknown' },
      503,
      'no-store',
    )
  }
}

export const onRequest = async (context) => {
  if (context.request.method === 'GET') return onRequestGet(context)
  return new Response(null, { headers: { Allow: 'GET' }, status: 405 })
}
