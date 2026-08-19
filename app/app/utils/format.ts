const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0
})

export function money(value?: number): string | undefined {
  return typeof value === 'number' ? BRL.format(value) : undefined
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

const WEEKDAY = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
const DAY = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' })

export function today(date = new Date()) {
  const weekday = WEEKDAY.format(date)
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    date: DAY.format(date)
  }
}

const DIA_MS = 86_400_000

/**
 * Frase de registro de uso de uma peça.
 *
 * `wear_count` e `last_worn_at` já existiam no banco e alimentavam a penalidade
 * de recência do recomendador, mas nenhuma tela mostrava os dois. Quem edita uma
 * peça é justamente quem quer saber se ela anda parada.
 */
export function quandoUsado(iso?: string, vezes?: number, agora = new Date()): string | undefined {
  const total = vezes ?? 0
  if (!iso) return total ? `${plural(total, 'uso registrado', 'usos registrados')}.` : undefined

  const data = new Date(`${iso.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(data.getTime())) return undefined

  const dias = Math.floor((agora.getTime() - data.getTime()) / DIA_MS)
  const quando = dias <= 0 ? 'hoje'
    : dias === 1 ? 'ontem'
    : dias < 30 ? `há ${dias} dias`
    : dias < 60 ? 'há mais de um mês'
    : `há ${Math.floor(dias / 30)} meses`

  return `${plural(total, 'uso registrado', 'usos registrados')}, o último ${quando}.`
}

/** Cor de apoio quando o item não tem cor registrada. Perfume puxa âmbar de
 *  vidro, roupa puxa um neutro de linho. */
export function itemColor(kind: 'garment' | 'scent', hex?: string): string {
  return hex ?? (kind === 'scent' ? '#c2a277' : '#b9b3a6')
}

/** Escolhe o desenho técnico de um item.
 *
 *  A busca é por palavra no nome da categoria e depois no nome do item, porque
 *  a categoria é renomeável pelo usuário e "Overshirts" precisa cair em camisa
 *  sem que ninguém configure nada. O papel semântico é a rede de segurança. */
export function flatFor(
  itemName: string,
  categoryName: string | undefined,
  role: import('~/types/domain').RecommendationRole | undefined,
  kind: 'garment' | 'scent'
): import('~/types/desenho').Flat {
  if (kind === 'scent') return 'frasco'

  const haystack = `${categoryName ?? ''} ${itemName}`.toLocaleLowerCase('pt-BR')
  const has = (pattern: RegExp) => pattern.test(haystack)

  if (has(/t[êe]nis|bota|botina|sapato|mocassim|sneaker|boot|loafer|chinelo|sandália/)) return 'tenis'
  if (has(/sobretudo|casaco|trench|parka|puffer|coat/)) return 'casaco'
  if (has(/jaqueta|jacket|bomber|trucker|blus[ãa]o|colete|overshirt/)) return 'jaqueta'
  if (has(/camiseta|t-shirt|tee|regata|polo|moletom|suéter|su[ée]ter|tricot/)) return 'camiseta'
  if (has(/camisa|shirt/)) return 'camisa'
  if (has(/cal[çc]a|jeans|bermuda|short|trouser|pants|chino/)) return 'calca'
  if (has(/rel[óo]gio|bolsa|cinto|boné|bon[ée]|gorro|[óo]culos|carteira|meia|len[çc]o/)) return 'etiqueta'

  switch (role) {
    case 'bottom': return 'calca'
    case 'outer_layer': return 'jaqueta'
    case 'footwear': return 'tenis'
    case 'accessory': return 'etiqueta'
    case 'scent': return 'frasco'
    default: return 'camiseta'
  }
}
