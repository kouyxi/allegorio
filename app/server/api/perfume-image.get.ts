import { normalizeBarcode } from '#shared/perfume'
import { fetchOpenBeautyFacts, safeCatalogImageUrl } from '../utils/openBeautyFacts'

export default defineEventHandler(async (event) => {
  const barcode = normalizeBarcode(String(getQuery(event).barcode ?? ''))
  if (!barcode) throw createError({ statusCode: 400, statusMessage: 'Código de barras inválido.' })

  const payload = await fetchOpenBeautyFacts(barcode)
  const imageUrl = safeCatalogImageUrl(payload)
  if (!imageUrl) throw createError({ statusCode: 404, statusMessage: 'Imagem não encontrada.' })

  const response = await fetch(imageUrl, {
    headers: { 'user-agent': 'Allegorio/0.1 (https://app.allegorio.com)' }
  })
  if (!response.ok) throw createError({ statusCode: 502, statusMessage: 'Não consegui buscar a imagem.' })

  const contentType = response.headers.get('content-type')
  if (!contentType?.startsWith('image/')) {
    throw createError({ statusCode: 502, statusMessage: 'O catálogo devolveu um arquivo inválido.' })
  }

  setResponseHeader(event, 'content-type', contentType)
  setResponseHeader(event, 'cache-control', 'public, max-age=86400, s-maxage=604800')
  return new Uint8Array(await response.arrayBuffer())
})
