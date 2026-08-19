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

export interface OpenBeautyFactsPayload {
  status?: number | string
  product?: {
    product_name?: string
    product_name_pt?: string
    product_name_en?: string
    brands?: string
    quantity?: string
    image_front_url?: string
    url?: string
  }
}

/** GTINs may arrive grouped with spaces or punctuation printed on the box. */
export function normalizeBarcode(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  return [8, 12, 13, 14].includes(digits.length) ? digits : undefined
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
  const product = payload.product
  const name = product?.product_name_pt?.trim()
    || product?.product_name?.trim()
    || product?.product_name_en?.trim()
  if (!product || !name) return undefined

  const providerUrl = product.url?.startsWith('https://world.openbeautyfacts.org/')
    ? product.url
    : `https://world.openbeautyfacts.org/product/${barcode}`

  return {
    barcode,
    name,
    brand: product.brands?.split(',')[0]?.trim() ?? '',
    volumeMl: volumeFromQuantity(product.quantity),
    concentration: concentrationFromText(`${name} ${product.quantity ?? ''}`),
    hasImage: Boolean(product.image_front_url),
    sourceUrl: providerUrl,
    sourceProvider: PERFUME_PROVIDER,
    sourceLicense: `${PERFUME_DATA_LICENSE} (dados) · ${PERFUME_IMAGE_LICENSE} (imagem)`,
    sourceAttribution: PERFUME_ATTRIBUTION
  }
}
