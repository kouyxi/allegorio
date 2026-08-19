import type { Category, Climate, RecommendationRole } from '~/types/domain'

export interface ItemDefaults {
  name: string
  formality: number
  climates: Climate[]
  contexts: string[]
}

const BY_ID: Record<string, ItemDefaults> = {
  'cat-tshirts': {
    name: 'Camiseta', formality: 1, climates: ['hot', 'mild'],
    contexts: ['everyday', 'date']
  },
  'cat-shirts': {
    name: 'Camisa', formality: 2, climates: ['hot', 'mild', 'cold'],
    contexts: ['everyday', 'work', 'date', 'event']
  },
  'cat-trousers': {
    name: 'Calça', formality: 2, climates: ['hot', 'mild', 'cold'],
    contexts: ['everyday', 'work', 'date', 'event']
  },
  'cat-outerwear': {
    name: 'Terceira peça', formality: 2, climates: ['mild', 'cold'],
    contexts: ['everyday', 'work', 'date', 'event']
  },
  'cat-footwear': {
    name: 'Calçado', formality: 2, climates: ['hot', 'mild', 'cold'],
    contexts: ['everyday', 'work', 'date', 'event']
  },
  'cat-accessories': {
    name: 'Acessório', formality: 2, climates: ['hot', 'mild', 'cold'],
    contexts: ['everyday', 'work', 'date', 'event']
  }
}

const ID_BY_NAME: Record<string, string> = {
  camisetas: 'cat-tshirts',
  camisas: 'cat-shirts',
  calcas: 'cat-trousers',
  'terceira peca': 'cat-outerwear',
  calcados: 'cat-footwear',
  acessorios: 'cat-accessories'
}

function normalizedName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
}

const BY_ROLE: Record<RecommendationRole, Omit<ItemDefaults, 'name'>> = {
  top: { formality: 1, climates: ['hot', 'mild'], contexts: ['everyday', 'date'] },
  bottom: { formality: 2, climates: ['hot', 'mild', 'cold'], contexts: ['everyday', 'work', 'date'] },
  outer_layer: { formality: 2, climates: ['mild', 'cold'], contexts: ['everyday', 'work', 'date'] },
  footwear: { formality: 2, climates: ['hot', 'mild', 'cold'], contexts: ['everyday', 'work', 'date'] },
  accessory: { formality: 2, climates: ['hot', 'mild', 'cold'], contexts: ['everyday', 'work', 'date', 'event'] },
  one_piece: { formality: 2, climates: ['hot', 'mild', 'cold'], contexts: ['everyday', 'work', 'date'] },
  scent: { formality: 2, climates: ['hot', 'mild', 'cold'], contexts: ['everyday'] }
}

export function defaultsForCategory(category?: Category): ItemDefaults {
  if (!category) {
    return { name: 'Roupa', formality: 2, climates: ['hot', 'mild', 'cold'], contexts: ['everyday'] }
  }

  const exact = BY_ID[category.id] ?? BY_ID[ID_BY_NAME[normalizedName(category.name)] ?? '']
  if (exact) return { ...exact, climates: [...exact.climates], contexts: [...exact.contexts] }

  const role = BY_ROLE[category.role]
  return {
    name: category.name.trim() || 'Roupa',
    formality: role.formality,
    climates: [...role.climates],
    contexts: [...role.contexts]
  }
}
