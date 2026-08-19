import type { OpenBeautyFactsPayload } from '#shared/perfume'

const FIELDS = [
  'product_name', 'product_name_pt', 'product_name_en', 'brands', 'quantity',
  'image_front_url', 'url'
].join(',')

export async function fetchOpenBeautyFacts(barcode: string): Promise<OpenBeautyFactsPayload> {
  return $fetch<OpenBeautyFactsPayload>(
    `https://world.openbeautyfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
    {
      query: { fields: FIELDS },
      timeout: 5000,
      headers: { 'user-agent': 'Allegorio/0.1 (https://app.allegorio.com)' }
    }
  )
}

export function safeCatalogImageUrl(payload: OpenBeautyFactsPayload): string | undefined {
  const raw = payload.product?.image_front_url
  if (!raw) return undefined

  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.hostname !== 'images.openfoodfacts.org') return undefined
    return url.toString()
  } catch {
    return undefined
  }
}
