import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

export const collections = {
  docs: defineCollection({
    loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
    schema: z.looseObject({
      description: z.string(),
      draft: z.boolean().optional(),
      owner: z.string().optional(),
      reviewedAt: z.coerce.date().optional(),
      title: z.string(),
    }),
  }),
}
