import type { Climate } from '~/types/domain'

export interface PedidoRepetir {
  contextId: string
  climate: Climate
  itemIds: string[]
}

/**
 * Combinação escolhida no histórico e esperando a tela Hoje montar de novo.
 *
 * A alternativa seria a tela Hoje guardar situação, clima e peças fixadas num
 * estado global e o histórico escrever lá dentro. Isso obrigaria dois donos a
 * concordar sobre quando o baralho é refeito, que é justamente a coisa que a
 * tela Hoje decide sozinha hoje. Um pedido de mão única é menos acoplamento:
 * o histórico deixa recado, a tela Hoje lê uma vez e apaga.
 */
export function useRepetir() {
  return useState<PedidoRepetir | null>('look-repetir', () => null)
}
