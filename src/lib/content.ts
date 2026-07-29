import type { CollectionEntry } from 'astro:content'

export function docPath(entry: CollectionEntry<'docs'>) {
  const id = entry.id.replace(/\.(md|mdx)$/, '')
  if (id === 'index') return '/'
  if (id.endsWith('/index')) return `/${id.slice(0, -'/index'.length)}/`
  return `/${id}/`
}

export function sourcePath(entry: CollectionEntry<'docs'>) {
  return `src/content/docs/${entry.id}`
}
