import {
  catalogItemFromProduct,
  normalizePerfumeQuery,
  type PerfumeSearchResponse
} from '#shared/perfume'
import { safeOpenBeautyFactsImageUrl, searchOpenBeautyFacts } from '../../utils/openBeautyFacts'

export default defineEventHandler(async (event): Promise<PerfumeSearchResponse> => {
  const query = normalizePerfumeQuery(String(getQuery(event).q ?? ''))
  if (!query) {
    setResponseStatus(event, 400)
    return { items: [], reason: 'invalid-query' }
  }

  try {
    const payload = await searchOpenBeautyFacts(query)
    const seen = new Set<string>()
    const items = []

    for (const product of payload.products ?? []) {
      const item = catalogItemFromProduct(product)
      if (!item || seen.has(item.barcode)) continue

      seen.add(item.barcode)
      item.imageUrl = safeOpenBeautyFactsImageUrl(item.imageUrl)
      item.hasImage = Boolean(item.imageUrl)
      items.push(item)
      if (items.length === 8) break
    }

    setResponseHeader(event, 'cache-control', 'public, max-age=300, s-maxage=3600')
    return { items }
  } catch {
    setResponseStatus(event, 503)
    return { items: [], reason: 'unavailable' }
  }
})
