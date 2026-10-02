import type { CollectionEntry } from 'astro:content'
import { relative, resolve } from 'node:path'

export function docPath(entry: CollectionEntry<'docs'>) {
  const id = entry.id.replace(/\.(md|mdx)$/, '')
  if (id === 'index') return '/'
  if (id.endsWith('/index')) return `/${id.slice(0, -'/index'.length)}/`
  return `/${id}/`
}

export function sourcePath(entry: CollectionEntry<'docs'>) {
  // Astro's content ID omits extensions and normalizes directory index pages.
  // The loader's file path preserves both for the GitHub edit link.
  if (!entry.filePath) throw new Error(`Missing source path for documentation ${entry.id}`)
  return relative(process.cwd(), resolve(entry.filePath)).split('\\').join('/')
}
