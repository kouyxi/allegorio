import type { PILARES } from '~~/content.config'

export type Pilar = (typeof PILARES)[number]

/** Campos que a home e as listagens consomem de uma entrada da collection. */
export interface Artigo {
  path: string
  title: string
  summary: string
  pergunta: string
  date: string
  pilar: Pilar
  minutos: number
  imagem: string
  legenda: string
  destaque?: boolean
}
