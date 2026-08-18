import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// The five editorial pillars from docs/02-editorial-mvp.md. Kept as an enum so
// a typo in frontmatter fails the build instead of leaking to the site.
export const PILARES = ['Fundamentos', 'Peças', 'Aplicação', 'Estilos', 'Análises'] as const

export default defineContentConfig({
  collections: {
    artigos: defineCollection({
      type: 'page',
      source: { include: 'artigos/**/*.md', prefix: '/artigos' },
      schema: z.object({
        date: z.string(),
        summary: z.string(),
        // a pergunta que o artigo declara na etapa I do método
        pergunta: z.string(),
        pilar: z.enum(PILARES),
        minutos: z.number().int().positive(),
        // specimen photograph: files live in public/img and public/img/thumb
        imagem: z.string(),
        legenda: z.string(),
        destaque: z.boolean().default(false),
        tags: z.array(z.string()).default([])
      })
    })
  }
})
