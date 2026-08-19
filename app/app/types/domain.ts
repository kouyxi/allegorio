export type ItemKind = 'garment' | 'scent'
export type Ownership = 'owned' | 'wishlist'
export type Climate = 'hot' | 'mild' | 'cold'

export type RecommendationRole =
  | 'top'
  | 'bottom'
  | 'outer_layer'
  | 'footwear'
  | 'accessory'
  | 'one_piece'
  | 'scent'

export interface Category {
  id: string
  name: string
  kind: ItemKind
  role: RecommendationRole
  custom: boolean
}

export interface CollectionItem {
  id: string
  kind: ItemKind
  ownership: Ownership
  categoryId: string
  name: string
  brand: string
  description: string
  /** caminho no bucket, ou chave no depósito local. É o que persiste. */
  imagePath?: string
  /** true quando o arquivo tem alfa e a peça está sobre fundo transparente */
  imageCutout?: boolean
  /** URL utilizável, resolvida em tempo de exibição e nunca gravada: a do
   *  Supabase é assinada e expira, a local é `blob:` e morre com a aba */
  imageUrl?: string
  sourceUrl?: string
  price?: number
  currency: 'BRL'
  color?: string
  colorHex?: string
  size?: string
  material?: string
  formality: number
  climates: Climate[]
  contexts: string[]
  styleTags: string[]
  concentration?: string
  volumeMl?: number
  remainingPercent?: number
  projection?: 'low' | 'moderate' | 'high'
  lastWornAt?: string
  wearCount?: number
}

export interface RecommendationContext {
  id: string
  label: string
  eyebrow: string
  description: string
  targetFormality: number
  requiredRoles: RecommendationRole[]
}

/** Um papel do look: a peça escolhida mais as trocas possíveis. */
export interface LookSlot {
  role: RecommendationRole
  roleLabel: string
  item: CollectionItem | null
  alternatives: CollectionItem[]
  /** motivo curto e concreto da escolha, exibido na linha */
  note: string
}

export interface LookResult {
  slots: LookSlot[]
  items: CollectionItem[]
  /** frases curtas e factuais, derivadas da pontuação */
  reasons: string[]
  missingRoles: RecommendationRole[]
}

export interface LookRequest {
  contextId: string
  climate: Climate
  seed: number
  /** papel -> id do item fixado manualmente pelo usuário */
  overrides: Partial<Record<RecommendationRole, string>>
}

export interface SavedOutfit {
  id: string
  name: string
  contextId: string
  climate: Climate
  itemIds: string[]
  createdAt: string
  worn: boolean
}

export interface NewItemInput {
  kind: ItemKind
  ownership: Ownership
  categoryId: string
  name: string
  brand: string
  description: string
  imagePath?: string
  imageCutout?: boolean
  price?: number
  color?: string
  colorHex?: string
  size?: string
  material?: string
  formality?: number
  climates?: Climate[]
  contexts?: string[]
  concentration?: string
  volumeMl?: number
  projection?: 'low' | 'moderate' | 'high'
  sourceUrl?: string
}
