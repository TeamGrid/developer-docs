import assert from 'node:assert/strict'
import test from 'node:test'
import { publicationRedirect, assertPublicationRedirect } from '../scripts/lib/publication-redirects.mjs'

const page = new URL('https://developer.teamgridapp.com/reference/')
const target = new URL('/api/v0/reference/', page)

test('ordinary content does not authorize a redirect', () => {
  assert.equal(publicationRedirect('<meta name="description" content="Docs">', page), null)
})

test('legacy fallback declares an exact same-origin destination', () => {
  assert.equal(publicationRedirect('<meta content="0; url=/api/v0/reference/" http-equiv="refresh">', page).href, target.href)
  assert.equal(publicationRedirect("<meta http-equiv='refresh' content='0; URL=/api/v0/reference/'>", page).href, target.href)
  assert.throws(() => publicationRedirect('<meta http-equiv="refresh" content="0; url=https://example.com/">', page), /canonical origin/)
})

test('only the declared HTTP redirect is accepted', () => {
  assertPublicationRedirect(new Response(null, { status: 301, headers: { location: target.pathname } }), page, target)
  assert.throws(() => assertPublicationRedirect(new Response(null, { status: 301, headers: { location: '/login/' } }), page, target), /does not match/)
  assert.throws(() => assertPublicationRedirect(new Response(null, { status: 200 }), page, target), /does not match/)
  assert.throws(() => assertPublicationRedirect(new Response(null, { status: 302, headers: { location: 'https://example.com/' } }), page, target), /does not match/)
})

test('only the unchanged audit cache-buster may be propagated', () => {
  const request = new URL(page)
  request.searchParams.set('__teamgrid_docs_audit', 'test-1')
  assertPublicationRedirect(new Response(null, { status: 301, headers: { location: `${target.pathname}?__teamgrid_docs_audit=test-1` } }), request, target)
  for (const query of ['__teamgrid_docs_audit=wrong', '__teamgrid_docs_audit=test-1&extra=true', '__teamgrid_docs_audit=test-1&__teamgrid_docs_audit=test-1']) {
    assert.throws(() => assertPublicationRedirect(new Response(null, { status: 301, headers: { location: `${target.pathname}?${query}` } }), request, target), /does not match/)
  }
})
