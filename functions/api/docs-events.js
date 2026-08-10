const allowedEvents = new Set(['page_feedback', 'page_feedback_detail', 'search_performed', 'search_no_results'])
const allowedFilters = new Set(['all', 'API v1', 'API v0', 'TypeScript SDK', 'CLI', 'MCP server', 'docs'])

function cleanPath(value) {
  if (typeof value !== 'string' || value.length > 180 || !value.startsWith('/')) return '/'
  return value.replace(/[?#].*$/, '')
}

function cleanQueryHash(value) {
  return typeof value === 'string' && /^[a-f0-9]{24}$/.test(value) ? value : 'none'
}

function cleanFeedback(value) {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cleaned || cleaned.length > 280) return null
  if (/tg_(?:pat|sa|sk)_v\d_/i.test(cleaned)) return null
  if (/authorization:\s*bearer/i.test(cleaned)) return null
  return cleaned
}

export const onRequestPost = async ({ env, request }) => {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > 1024) {
    return new Response(null, { status: 413 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!body.event || !allowedEvents.has(body.event)) {
    return Response.json({ error: 'invalid_event' }, { status: 400 })
  }

  const path = cleanPath(body.path)
  const filter = allowedFilters.has(body.filter || '') ? body.filter : 'all'
  const value = Number.isFinite(body.value) ? Math.max(0, Math.min(100, Number(body.value))) : 0
  const queryHash = body.event === 'search_no_results' ? cleanQueryHash(body.queryHash) : 'none'
  const feedback = body.event === 'page_feedback_detail' ? cleanFeedback(body.feedback) : ''
  if (body.event === 'page_feedback_detail' && !feedback) {
    return Response.json({ error: 'invalid_feedback' }, { status: 400 })
  }

  env.DOCS_ANALYTICS?.writeDataPoint({
    indexes: ['developer-docs'],
    blobs: [body.event, path, filter, queryHash, feedback],
    doubles: [value],
  })

  return new Response(null, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'",
    },
    status: 204,
  })
}

export const onRequest = async (context) => {
  if (context.request.method === 'POST') return onRequestPost(context)
  return new Response(null, { headers: { Allow: 'POST' }, status: 405 })
}
