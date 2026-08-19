export type Clima = 'hot' | 'mild' | 'cold'

/**
 * Temperatura para a faixa que o recomendador entende.
 *
 * Os cortes são de vestir, não de meteorologia: acima de 25 a terceira peça
 * atrapalha, abaixo de 17 ela deixa de ser opcional. No meio fica a faixa em
 * que a escolha depende mais da situação que do termômetro.
 *
 * O número usado é a sensação térmica e não a temperatura do ar, porque é ela
 * que decide se a pessoa vai suar dentro da jaqueta.
 */
export function climaPorTemperatura(sensacao: number): Clima {
  if (sensacao >= 25) return 'hot'
  if (sensacao <= 17) return 'cold'
  return 'mild'
}

export interface LeituraClima {
  disponivel: boolean
  /** sensação térmica em graus inteiros */
  temperatura?: number
  clima?: Clima
  cidade?: string
  /** `rede` veio do IP na borda, `aparelho` veio do GPS com permissão */
  origem?: 'rede' | 'aparelho'
  motivo?: 'sem-local' | 'sem-resposta'
}
