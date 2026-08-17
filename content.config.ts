import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const editorialPillars = [
  'fundamentos',
  'pecas',
  'aplicacao',
  'estilos',
  'analises',
] as const

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      source: 'articles/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        status: z.enum(['draft', 'published', 'archived']).default('draft'),
        pillar: z.enum(editorialPillars),
        publishedAt: z.string().optional(),
        updatedAt: z.string().optional(),
        topics: z.array(z.string()).default([]),
        garments: z.array(z.string()).default([]),
        styles: z.array(z.string()).default([]),
        level: z.enum(['iniciante', 'intermediario', 'avancado']).default('iniciante'),
        featured: z.boolean().default(false),
      }),
    }),
  },
})
