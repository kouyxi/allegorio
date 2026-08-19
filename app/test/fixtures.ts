import type { Category, CollectionItem, RecommendationContext } from '~/types/domain'

export const CONTEXTS: RecommendationContext[] = [
  { id: 'everyday', label: 'Dia a dia', eyebrow: '', description: '', targetFormality: 1, requiredRoles: ['top', 'bottom', 'footwear'] },
  { id: 'work', label: 'Trabalho', eyebrow: '', description: '', targetFormality: 2, requiredRoles: ['top', 'bottom', 'footwear', 'outer_layer'] },
  { id: 'event', label: 'Evento', eyebrow: '', description: '', targetFormality: 3, requiredRoles: ['top', 'bottom', 'footwear', 'outer_layer'] }
]

export const CATEGORIES: Category[] = [
  { id: 'c-top', name: 'Camisas', kind: 'garment', role: 'top', custom: false },
  { id: 'c-bottom', name: 'Calças', kind: 'garment', role: 'bottom', custom: false },
  { id: 'c-shoe', name: 'Calçados', kind: 'garment', role: 'footwear', custom: false },
  { id: 'c-outer', name: 'Terceira peça', kind: 'garment', role: 'outer_layer', custom: false },
  { id: 'c-scent', name: 'Perfumes', kind: 'scent', role: 'scent', custom: false }
]

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}

export function item(over: Partial<CollectionItem> & Pick<CollectionItem, 'id' | 'categoryId'>): CollectionItem {
  return {
    kind: 'garment',
    ownership: 'owned',
    name: over.id,
    brand: '',
    description: '',
    currency: 'BRL',
    formality: 2,
    climates: ['hot', 'mild', 'cold'],
    contexts: ['everyday', 'work', 'event'],
    styleTags: [],
    ...over
  }
}

/** Acervo mínimo com duas opções por papel, que é o que faz o baralho girar. */
export const ITEMS: CollectionItem[] = [
  item({ id: 'top-a', categoryId: 'c-top', formality: 2 }),
  item({ id: 'top-b', categoryId: 'c-top', formality: 1 }),
  item({ id: 'bottom-a', categoryId: 'c-bottom', formality: 2 }),
  item({ id: 'bottom-b', categoryId: 'c-bottom', formality: 1 }),
  item({ id: 'shoe-a', categoryId: 'c-shoe', formality: 2 }),
  item({ id: 'shoe-b', categoryId: 'c-shoe', formality: 1 }),
  item({ id: 'outer-a', categoryId: 'c-outer', formality: 2 }),
  item({ id: 'scent-a', categoryId: 'c-scent', kind: 'scent', formality: 2, projection: 'moderate' }),
  item({ id: 'scent-b', categoryId: 'c-scent', kind: 'scent', formality: 2, projection: 'high' }),
  item({ id: 'wish-top', categoryId: 'c-top', ownership: 'wishlist' })
]
