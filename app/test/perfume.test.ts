import { describe, expect, it } from 'vitest'
import {
  catalogItemFromPayload,
  concentrationFromText,
  normalizeBarcode,
  volumeFromQuantity
} from '#shared/perfume'

describe('catálogo de perfumes', () => {
  it('normaliza os formatos de GTIN aceitos', () => {
    expect(normalizeBarcode('789 1234-567890')).toBe('7891234567890')
    expect(normalizeBarcode('123')).toBeUndefined()
    expect(normalizeBarcode('12345678')).toBe('12345678')
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
})
