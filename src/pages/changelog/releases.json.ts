import type { APIRoute } from 'astro'
import { developerReleases } from '../../data/releases'

export const prerender = true

export const GET: APIRoute = () => new Response(JSON.stringify({
  releases: developerReleases,
  schemaVersion: 1,
}), {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})
