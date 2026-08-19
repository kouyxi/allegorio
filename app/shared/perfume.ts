export const PERFUME_PROVIDER = 'Open Beauty Facts'
export const PERFUME_DATA_LICENSE = 'ODbL 1.0'
export const PERFUME_IMAGE_LICENSE = 'CC BY-SA'
export const PERFUME_ATTRIBUTION = 'Open Beauty Facts contributors'

export interface PerfumeCatalogItem {
  barcode: string
  name: string
  brand: string
  volumeMl?: number
  concentration?: 'EDC' | 'EDT' | 'EDP' | 'Extrait'
  hasImage: boolean
  /** URL remota só atravessa o proxy do aplicativo; nunca é gravada no item. */
  imageUrl?: string
  sourceUrl: string
  sourceProvider: string
  sourceLicense: string
  sourceAttribution: string
}

export interface PerfumeLookupResponse {
  found: boolean
  item?: PerfumeCatalogItem
  reason?: 'invalid-barcode' | 'not-found' | 'unavailable'
}

export interface PerfumeSearchResponse {
  items: PerfumeCatalogItem[]
  reason?: 'invalid-query' | 'unavailable'
}

export interface OpenBeautyFactsProduct {
  code?: string
  product_name?: string
  product_name_pt?: string
  product_name_en?: string
  brands?: string
  quantity?: string
  image_front_url?: string
  url?: string
}

export interface OpenBeautyFactsPayload {
  status?: number | string
  product?: OpenBeautyFactsProduct
}

export interface OpenBeautyFactsSearchPayload {
  count?: number
  products?: OpenBeautyFactsProduct[]
}

/** GTINs may arrive grouped with spaces or punctuation printed on the box. */
export function normalizeBarcode(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  return [8, 12, 13, 14].includes(digits.length) ? digits : undefined
}

export function normalizePerfumeQuery(value: string): string | undefined {
  const query = value.trim().replace(/\s+/g, ' ')
  return query.length >= 2 && query.length <= 80 ? query : undefined
}

export function volumeFromQuantity(value?: string): number | undefined {
  if (!value) return undefined
  const match = value.replace(',', '.').match(/(\d+(?:\.\d+)?)\s*(ml|cl|l)\b/i)
  if (!match) return undefined

  const amount = Number(match[1])
  if (!Number.isFinite(amount)) return undefined
  const unit = match[2]!.toLowerCase()
  const ml = unit === 'l' ? amount * 1000 : unit === 'cl' ? amount * 10 : amount
  return ml > 0 && ml <= 5000 ? Math.round(ml) : undefined
}

export function concentrationFromText(value?: string): PerfumeCatalogItem['concentration'] {
  if (!value) return undefined
  const text = value.toLowerCase()
  if (/\b(eau de parfum|edp)\b/.test(text)) return 'EDP'
  if (/\b(extrait|parfum)\b/.test(text)) return 'Extrait'
  if (/\b(eau de toilette|edt)\b/.test(text)) return 'EDT'
  if (/\b(eau de cologne|edc)\b/.test(text)) return 'EDC'
  return undefined
}

/** Keeps the provider-specific response shape outside the UI and persistence. */
export function catalogItemFromPayload(
  payload: OpenBeautyFactsPayload,
  barcode: string
): PerfumeCatalogItem | undefined {
  return catalogItemFromProduct(payload.product, barcode)
}

export function catalogItemFromProduct(
  product: OpenBeautyFactsProduct | undefined,
  barcode = product?.code ?? ''
): PerfumeCatalogItem | undefined {
  const validBarcode = normalizeBarcode(barcode)
  const name = product?.product_name_pt?.trim()
    || product?.product_name?.trim()
    || product?.product_name_en?.trim()
  if (!product || !name || !validBarcode) return undefined

  const providerUrl = product.url?.startsWith('https://world.openbeautyfacts.org/')
    ? product.url
    : `https://world.openbeautyfacts.org/product/${validBarcode}`

  return {
    barcode: validBarcode,
    name,
    brand: product.brands?.split(',')[0]?.trim() ?? '',
    volumeMl: volumeFromQuantity(product.quantity),
    concentration: concentrationFromText(`${name} ${product.quantity ?? ''}`),
    hasImage: Boolean(product.image_front_url),
    imageUrl: product.image_front_url,
    sourceUrl: providerUrl,
    sourceProvider: PERFUME_PROVIDER,
    sourceLicense: `${PERFUME_DATA_LICENSE} (dados) · ${PERFUME_IMAGE_LICENSE} (imagem)`,
    sourceAttribution: PERFUME_ATTRIBUTION
  }
}
