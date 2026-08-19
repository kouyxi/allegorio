import { catalogItemFromPayload, normalizeBarcode, type PerfumeLookupResponse } from '#shared/perfume'
import { fetchOpenBeautyFacts } from '../../utils/openBeautyFacts'

export default defineEventHandler(async (event): Promise<PerfumeLookupResponse> => {
  const barcode = normalizeBarcode(getRouterParam(event, 'barcode') ?? '')
  if (!barcode) {
    setResponseStatus(event, 400)
    return { found: false, reason: 'invalid-barcode' }
  }

  try {
    const payload = await fetchOpenBeautyFacts(barcode)
    const item = catalogItemFromPayload(payload, barcode)
    setResponseHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=86400')
    return item ? { found: true, item } : { found: false, reason: 'not-found' }
  } catch {
    setResponseStatus(event, 503)
    return { found: false, reason: 'unavailable' }
  }
})
