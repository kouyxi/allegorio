import type { Category, Climate, CollectionItem, ItemKind, Ownership, RecommendationRole, SavedOutfit } from '~/types/domain'

/**
 * Tradução entre a linha do Postgres e o domínio do aplicativo.
 *
 * Fica num módulo só de propósito: com o mapeamento espalhado pelas chamadas,
 * um `color_hex` esquecido vira campo silenciosamente vazio na interface e
 * ninguém descobre até a peça aparecer cinza.
 */

export interface ItemRow {
  id: string
  user_id: string
  category_id: string
  kind: ItemKind
  ownership: Ownership
  name: string
  brand: string
  description: string
  image_path: string | null
  image_cutout: boolean
  source_url: string | null
  price: string | number | null
  currency: string
  color: string | null
  color_hex: string | null
  size: string | null
  material: string | null
  formality: number
  climates: Climate[]
  contexts: string[]
  style_tags: string[]
  concentration: string | null
  volume_ml: string | number | null
  remaining_percent: number | null
  projection: 'low' | 'moderate' | 'high' | null
  last_worn_at: string | null
  wear_count: number
}

export interface CategoryRow {
  id: string
  user_id: string
  name: string
  kind: ItemKind
  role: RecommendationRole
  custom: boolean
}

export interface OutfitRow {
  id: string
  user_id: string
  name: string
  context_id: string
  climate: Climate
  worn: boolean
  created_at: string
  outfit_items?: { item_id: string, position: number }[]
}

/** `numeric` volta como string no PostgREST quando o valor não cabe em double.
 *  Coagir sempre evita comparar string com número no filtro de preço. */
function num(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function text(value: string | null | undefined): string | undefined {
  return value === null || value === undefined || value === '' ? undefined : value
}

export function toItem(row: ItemRow): CollectionItem {
  return {
    id: row.id,
    kind: row.kind,
    ownership: row.ownership,
    categoryId: row.category_id,
    name: row.name,
    brand: row.brand ?? '',
    description: row.description ?? '',
    // `image_path` é caminho no bucket; a URL assinada é resolvida na exibição
    imagePath: text(row.image_path),
    imageCutout: row.image_cutout ?? false,
    imageUrl: undefined,
    sourceUrl: text(row.source_url),
    price: num(row.price),
    currency: 'BRL',
    color: text(row.color),
    colorHex: text(row.color_hex),
    size: text(row.size),
    material: text(row.material),
    formality: row.formality,
    climates: row.climates ?? [],
    contexts: row.contexts ?? [],
    styleTags: row.style_tags ?? [],
    concentration: text(row.concentration),
    volumeMl: num(row.volume_ml),
    remainingPercent: row.remaining_percent ?? undefined,
    projection: row.projection ?? undefined,
    lastWornAt: text(row.last_worn_at),
    wearCount: row.wear_count ?? 0
  }
}

/** Campos que o cliente pode escrever. `user_id` sai daqui de propósito: quem
 *  preenche é a chamada, com o id da sessão, e a RLS confere. */
export function fromItem(item: CollectionItem): Omit<ItemRow, 'user_id'> {
  const scent = item.kind === 'scent'
  return {
    id: item.id,
    category_id: item.categoryId,
    kind: item.kind,
    ownership: item.ownership,
    name: item.name,
    brand: item.brand ?? '',
    description: item.description ?? '',
    image_path: item.imagePath ?? null,
    image_cutout: item.imageCutout ?? false,
    source_url: item.sourceUrl ?? null,
    price: item.price ?? null,
    currency: 'BRL',
    color: scent ? null : item.color ?? null,
    color_hex: item.colorHex ?? null,
    size: scent ? null : item.size ?? null,
    material: scent ? null : item.material ?? null,
    formality: item.formality,
    climates: item.climates,
    contexts: item.contexts,
    style_tags: item.styleTags ?? [],
    // a restrição `scent_fields_only_on_scent` rejeita a linha se estes campos
    // vierem preenchidos numa roupa
    concentration: scent ? item.concentration ?? null : null,
    volume_ml: scent ? item.volumeMl ?? null : null,
    remaining_percent: scent ? item.remainingPercent ?? null : null,
    projection: scent ? item.projection ?? null : null,
    last_worn_at: item.lastWornAt ?? null,
    wear_count: item.wearCount ?? 0
  }
}

export function toCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, kind: row.kind, role: row.role, custom: row.custom }
}

export function fromCategory(category: Category): Omit<CategoryRow, 'user_id'> {
  return {
    id: category.id,
    name: category.name,
    kind: category.kind,
    role: category.role,
    custom: category.custom
  }
}

export function toOutfit(row: OutfitRow): SavedOutfit {
  const links = [...(row.outfit_items ?? [])].sort((a, b) => a.position - b.position)
  return {
    id: row.id,
    name: row.name ?? '',
    contextId: row.context_id,
    climate: row.climate,
    itemIds: links.map(link => link.item_id),
    createdAt: row.created_at,
    worn: row.worn
  }
}
