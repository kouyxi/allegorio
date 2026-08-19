/** Peças com desenho técnico disponível em FlatTecnico.vue. */
export type Peca = 'jaqueta' | 'calca' | 'camisa' | 'casaco'

export const NOME_PECA: Record<Peca, string> = {
  jaqueta: 'Jaqueta de trabalho',
  calca: 'Calça',
  camisa: 'Camisa',
  casaco: 'Sobretudo'
}
