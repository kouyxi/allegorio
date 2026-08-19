import { describe, expect, it } from 'vitest'
import {
  catalogItemFromPayload,
  catalogItemFromProduct,
  concentrationFromText,
  normalizeBarcode,
  normalizePerfumeQuery,
  volumeFromQuantity
} from '#shared/perfume'

describe('catálogo de perfumes', () => {
  it('normaliza os formatos de GTIN aceitos', () => {
    expect(normalizeBarcode('789 1234-567890')).toBe('7891234567890')
    expect(normalizeBarcode('123')).toBeUndefined()
    expect(normalizeBarcode('12345678')).toBe('12345678')
  })

  it('normaliza a busca por nome ou marca e rejeita termos ruins', () => {
    expect(normalizePerfumeQuery('  Dior   Sauvage ')).toBe('Dior Sauvage')
    expect(normalizePerfumeQuery('D')).toBeUndefined()
    expect(normalizePerfumeQuery('a'.repeat(81))).toBeUndefined()
  })

  it('converte volume para ml', () => {
    expect(volumeFromQuantity('Eau de parfum 100 ml')).toBe(100)
    expect(volumeFromQuantity('7,5 cl')).toBe(75)
    expect(volumeFromQuantity('0.1 L')).toBe(100)
  })

  it('reconhece concentração sem confundir eau de parfum com extrait', () => {
    expect(concentrationFromText('Eau de Parfum 100 ml')).toBe('EDP')
    expect(concentrationFromText('Eau de toilette')).toBe('EDT')
    expect(concentrationFromText('Parfum extrait')).toBe('Extrait')
  })

  it('traduz o produto e carimba toda a procedência', () => {
    const item = catalogItemFromPayload({
      product: {
        product_name: 'Vetiver Eau de Parfum', brands: 'Casa, Outra', quantity: '100 ml',
        image_front_url: 'https://images.openfoodfacts.org/images/a.jpg'
      }
    }, '7891234567890')

    expect(item).toMatchObject({
      barcode: '7891234567890', name: 'Vetiver Eau de Parfum', brand: 'Casa',
      volumeMl: 100, concentration: 'EDP', hasImage: true,
      sourceProvider: 'Open Beauty Facts'
    })
    expect(item?.sourceLicense).toContain('CC BY-SA')
    expect(item?.sourceAttribution).toContain('Open Beauty Facts')
  })

  it('não inventa um registro sem nome', () => {
    expect(catalogItemFromPayload({ product: { brands: 'Casa' } }, '12345678')).toBeUndefined()
  })

  it('traduz um resultado da pesquisa textual usando o código do produto', () => {
    expect(catalogItemFromProduct({
      code: '7891234567890',
      product_name: 'Sauvage Eau de Toilette',
      brands: 'Dior',
      image_front_url: 'https://images.openfoodfacts.org/images/a.jpg'
    })).toMatchObject({
      barcode: '7891234567890',
      name: 'Sauvage Eau de Toilette',
      brand: 'Dior',
      concentration: 'EDT',
      hasImage: true
    })
  })
})
