import type { OpenBeautyFactsPayload, OpenBeautyFactsSearchPayload } from '#shared/perfume'

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

/** O v2 ainda não oferece texto livre. O endpoint v1 é o caminho documentado
 * pelo próprio projeto para nome e marca enquanto o Search-a-licious não fica
 * disponível para este catálogo. */
export async function searchOpenBeautyFacts(query: string): Promise<OpenBeautyFactsSearchPayload> {
  return $fetch<OpenBeautyFactsSearchPayload>('https://world.openbeautyfacts.org/cgi/search.pl', {
    query: {
      search_terms: query,
      search_simple: 1,
      action: 'process',
      json: 1,
      page: 1,
      page_size: 12,
      sort_by: 'unique_scans_n',
      fields: `code,${FIELDS}`
    },
    timeout: 7000,
    headers: { 'user-agent': 'Allegorio/0.1 (https://app.allegorio.com)' }
  })
}

export function safeOpenBeautyFactsImageUrl(raw?: string): string | undefined {
  if (!raw) return undefined

  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.hostname !== 'images.openfoodfacts.org') return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

export function safeCatalogImageUrl(payload: OpenBeautyFactsPayload): string | undefined {
  return safeOpenBeautyFactsImageUrl(payload.product?.image_front_url)
}
