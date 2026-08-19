import type {
  Category,
  Climate,
  CollectionItem,
  LookRequest,
  LookResult,
  LookSlot,
  RecommendationContext,
  RecommendationRole
} from '~/types/domain'

export const ROLE_LABELS: Record<RecommendationRole, string> = {
  top: 'Parte de cima',
  bottom: 'Parte de baixo',
  outer_layer: 'Terceira peça',
  footwear: 'Calçado',
  accessory: 'Acessório',
  one_piece: 'Peça única',
  scent: 'Perfume'
}

export const CLIMATE_LABELS: Record<Climate, string> = {
  hot: 'Calor',
  mild: 'Ameno',
  cold: 'Frio'
}

/** Rótulo curto para a linha miúda do cartão, onde a largura é escassa. O nome
 *  completo continua em ROLE_LABELS e no rótulo de acessibilidade. */
export const ROLE_SHORT: Record<RecommendationRole, string> = {
  top: 'Cima',
  bottom: 'Baixo',
  outer_layer: '3ª peça',
  footwear: 'Calçado',
  accessory: 'Acessório',
  one_piece: 'Peça única',
  scent: 'Perfume'
}

export const ROLE_ICONS: Record<RecommendationRole, string> = {
  top: 'top',
  bottom: 'bottom',
  outer_layer: 'outer',
  footwear: 'footwear',
  accessory: 'accessory',
  one_piece: 'onePiece',
  scent: 'scent'
}

export const CLIMATE_ICONS: Record<Climate, string> = {
  hot: 'sun',
  mild: 'cloud',
  cold: 'snow'
}

export const CONTEXT_ICONS: Record<string, string> = {
  everyday: 'coffee',
  work: 'briefcase',
  date: 'heart',
  event: 'spark'
}

const DAY_MS = 86_400_000

export function daysSince(iso?: string): number | undefined {
  if (!iso) return undefined
  const value = new Date(iso).getTime()
  if (Number.isNaN(value)) return undefined
  return Math.floor((Date.now() - value) / DAY_MS)
}

/** Contexto provável pelo dia da semana. O usuário ajusta depois; ninguém precisa
 *  responder um formulário antes de ver a primeira sugestão. */
export function defaultContextId(date = new Date()): string {
  const day = date.getDay()
  return day >= 1 && day <= 5 ? 'work' : 'everyday'
}

interface Scored {
  item: CollectionItem
  score: number
  /** já ordenadas da mais específica para a mais genérica */
  notas: string[]
}

/** As notas saem ordenadas por especificidade. Contexto e clima valem para
 *  quase toda peça de um look bem montado, então repeti-los em cinco linhas
 *  seguidas não informa nada: só aparecem quando não houver nada melhor. */
type Nota = { texto: string, posto: number }

function scoreItem(
  item: CollectionItem,
  context: RecommendationContext,
  climate: Climate
): Scored {
  let score = 0
  const notas: Nota[] = []

  if (item.contexts.includes(context.id)) {
    score += 40
    notas.push({ texto: `para ${context.label.toLowerCase()}`, posto: 4 })
  }

  if (item.climates.includes(climate)) {
    score += 30
    notas.push({ texto: CLIMATE_LABELS[climate].toLowerCase(), posto: 4 })
  }

  const gap = Math.abs(item.formality - context.targetFormality)
  score += Math.max(0, 20 - gap * 8)
  if (gap === 0) notas.push({ texto: 'formalidade certa', posto: 2 })

  const days = daysSince(item.lastWornAt)
  if (days !== undefined) {
    if (days < 3) {
      score -= 18
      notas.push({ texto: days === 0 ? 'usada hoje' : `usada há ${days}d`, posto: 0 })
    } else if (days > 21) {
      score += 8
      notas.push({ texto: 'parada há semanas', posto: 0 })
    }
  } else if (item.ownership === 'owned') {
    score += 5
    notas.push({ texto: 'nunca registrada', posto: 3 })
  }

  if (item.kind === 'scent') {
    if (context.id === 'work' && item.projection === 'high') {
      score -= 24
      notas.push({ texto: 'projeção alta para sala', posto: 1 })
    }
    if (context.id === 'event' && item.projection === 'high') {
      score += 10
      notas.push({ texto: 'projeção alta, para evento', posto: 1 })
    }
    if (item.projection === 'low') notas.push({ texto: 'projeção curta', posto: 2 })
    if ((item.remainingPercent ?? 100) < 12) {
      score -= 10
      notas.push({ texto: 'quase no fim', posto: 1 })
    }
  }

  notas.sort((a, b) => a.posto - b.posto)
  return { item, score, notas: notas.map(nota => nota.texto) }
}

function rolesFor(context: RecommendationContext, climate: Climate): RecommendationRole[] {
  const roles = context.requiredRoles.filter(role => role !== 'outer_layer' || climate !== 'hot')
  if (climate === 'cold' && !roles.includes('outer_layer')) roles.push('outer_layer')
  if (!roles.includes('scent')) roles.push('scent')
  return roles
}

export function buildLook(
  items: CollectionItem[],
  categories: Category[],
  contexts: RecommendationContext[],
  request: LookRequest
): LookResult {
  const context = contexts.find(entry => entry.id === request.contextId) ?? contexts[0]
  if (!context) return { slots: [], items: [], reasons: [], missingRoles: [] }

  const roleByCategory = new Map(categories.map(category => [category.id, category.role]))
  const owned = items.filter(item => item.ownership === 'owned')

  const slots: LookSlot[] = []
  const notasPorPapel = new Map<RecommendationRole, string[]>()
  const missingRoles: RecommendationRole[] = []

  /* O `seed` é o número do cartão no baralho, lido como odômetro de raiz mista
     sobre as opções de cada papel. Com isso o cartão 1 é sempre a melhor
     combinação, o cartão seguinte troca uma peça, e o baralho percorre o
     produto das opções em vez de girar todos os papéis em bloco (o que dava
     duas combinações e depois repetia). */
  let radix = 1
  let climateMatches = 0
  let contextMatches = 0
  let rested: string | undefined

  for (const role of rolesFor(context, request.climate)) {
    const pool = owned
      .filter(item => roleByCategory.get(item.categoryId) === role)
      .map(item => scoreItem(item, context, request.climate))
      .sort((a, b) => b.score - a.score)

    if (!pool.length) {
      missingRoles.push(role)
      slots.push({ role, roleLabel: ROLE_LABELS[role], item: null, alternatives: [], note: '' })
      continue
    }

    // Uma peça fixada manualmente vence a pontuação e não gira com o baralho.
    const pinnedId = request.overrides[role]
    const pinned = pinnedId ? pool.find(entry => entry.item.id === pinnedId) : undefined

    // Sem fixação, a variação fica nas melhores opções: virar o cartão nunca
    // deve piorar a sugestão, só oferecer outra igualmente defensável.
    const window = Math.min(pool.length, 3)
    let chosen = pinned

    if (!chosen) {
      chosen = pool[Math.floor(request.seed / radix) % window]!
      radix *= window
    }

    if (chosen.item.climates.includes(request.climate)) climateMatches += 1
    if (chosen.item.contexts.includes(context.id)) contextMatches += 1

    const days = daysSince(chosen.item.lastWornAt)
    if (days !== undefined && days > 21 && !rested) rested = chosen.item.name

    if (!pinned) notasPorPapel.set(role, chosen.notas)

    slots.push({
      role,
      roleLabel: ROLE_LABELS[role],
      item: chosen.item,
      note: pinned ? 'escolha sua' : '',
      alternatives: pool.filter(entry => entry.item.id !== chosen.item.id).map(entry => entry.item)
    })
  }

  const filled = slots.filter(slot => slot.item)

  /* Uma nota que aparece em quase todas as linhas não distingue nada: ela é
     característica do look inteiro e já está resumida no "Por quê". Fica na
     linha só quando a alternativa seria deixá-la vazia. */
  const frequencia = new Map<string, number>()
  for (const notas of notasPorPapel.values()) {
    for (const nota of notas) frequencia.set(nota, (frequencia.get(nota) ?? 0) + 1)
  }
  const limite = Math.max(2, Math.ceil(filled.length * 0.6))

  for (const slot of slots) {
    if (slot.note || !slot.item) continue
    const notas = notasPorPapel.get(slot.role) ?? []
    const distintas = notas.filter(nota => (frequencia.get(nota) ?? 0) < limite)
    slot.note = (distintas.length ? distintas : notas.slice(0, 1)).slice(0, 2).join(' · ')
  }

  const reasons: string[] = []

  if (contextMatches) {
    reasons.push(`${contextMatches} de ${filled.length} peças marcadas para ${context.label.toLowerCase()}.`)
  }
  if (climateMatches) {
    reasons.push(`${climateMatches} de ${filled.length} servem para ${CLIMATE_LABELS[request.climate].toLowerCase()}.`)
  }
  reasons.push(`Formalidade alvo ${context.targetFormality} de 3.`)
  if (rested) reasons.push(`${rested} estava sem uso há mais de três semanas.`)

  const scent = filled.find(slot => slot.item?.kind === 'scent')?.item
  if (scent && context.id === 'work' && scent.projection !== 'high') {
    reasons.push('Perfume de projeção contida para dividir sala.')
  }

  return {
    slots,
    items: filled.map(slot => slot.item!),
    reasons,
    missingRoles
  }
}
