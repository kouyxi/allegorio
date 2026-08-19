import { describe, expect, it } from 'vitest'
import { fromItem, toCategory, toItem, toOutfit } from '~/utils/mapping'
import type { ItemRow, OutfitRow } from '~/utils/mapping'
import type { CollectionItem } from '~/types/domain'
import { item } from './fixtures'

function row(over: Partial<ItemRow> = {}): ItemRow {
  return {
    id: 'i1', user_id: 'u1', category_id: 'c1', kind: 'garment', ownership: 'owned',
    name: 'Camisa oxford', brand: 'Acervo', description: '', image_path: null,
    image_cutout: false, source_url: null, price: 279, currency: 'BRL', color: 'Azul claro', color_hex: '#9caeb2',
    size: 'M', material: 'Algodão', formality: 2, climates: ['mild', 'cold'],
    contexts: ['work'], style_tags: [], concentration: null, volume_ml: null,
    remaining_percent: null, projection: null, last_worn_at: null, wear_count: 0,
    ...over
  }
}

describe('toItem', () => {
  it('traduz coluna para campo do domínio', () => {
    const result = toItem(row())
    expect(result.categoryId).toBe('c1')
    expect(result.colorHex).toBe('#9caeb2')
    expect(result.climates).toEqual(['mild', 'cold'])
    expect(result.wearCount).toBe(0)
  })

  it('coage numeric que volta como string', () => {
    // PostgREST devolve `numeric` como string quando o valor não cabe em double,
    // e comparar string com número quebraria o filtro de preço em silêncio
    const result = toItem(row({ price: '279.00', volume_ml: '100.00' }))
    expect(result.price).toBe(279)
    expect(result.volumeMl).toBe(100)
  })

  it('trata nulo e string vazia como ausente', () => {
    const result = toItem(row({ color: null, size: '', material: null }))
    expect(result.color).toBeUndefined()
    expect(result.size).toBeUndefined()
    expect(result.material).toBeUndefined()
  })

  it('sobrevive a array nulo vindo do banco', () => {
    const result = toItem(row({ climates: null as never, style_tags: null as never }))
    expect(result.climates).toEqual([])
    expect(result.styleTags).toEqual([])
  })
})

describe('fromItem', () => {
  it('zera campos de perfume numa roupa', () => {
    // a restrição `scent_fields_only_on_scent` rejeita a linha se vazarem
    const garment = item({
      id: 'g', categoryId: 'c1', kind: 'garment',
      concentration: 'EDT', volumeMl: 100, remainingPercent: 50, projection: 'high'
    })
    const result = fromItem(garment)
    expect(result.concentration).toBeNull()
    expect(result.volume_ml).toBeNull()
    expect(result.remaining_percent).toBeNull()
    expect(result.projection).toBeNull()
  })

  it('zera campos de roupa num perfume', () => {
    const scent = item({
      id: 's', categoryId: 'c-scent', kind: 'scent',
      color: 'Âmbar', size: '100', material: 'vidro', concentration: 'EDP'
    })
    const result = fromItem(scent)
    expect(result.color).toBeNull()
    expect(result.size).toBeNull()
    expect(result.material).toBeNull()
    expect(result.concentration).toBe('EDP')
  })

  it('não manda user_id: quem preenche é a chamada e a RLS confere', () => {
    expect(Object.keys(fromItem(item({ id: 'g', categoryId: 'c1' })))).not.toContain('user_id')
  })

  it('faz ida e volta sem perder campo', () => {
    const original: CollectionItem = item({
      id: 'g', categoryId: 'c1', name: 'Camisa', brand: 'Acervo',
      price: 279, color: 'Azul', colorHex: '#9caeb2', size: 'M', material: 'Oxford',
      formality: 3, climates: ['mild'], contexts: ['work'], lastWornAt: '2026-08-10', wearCount: 4
    })
    const back = toItem({ ...fromItem(original), user_id: 'u1' } as ItemRow)

    for (const key of Object.keys(original) as (keyof CollectionItem)[]) {
      expect(back[key], `campo ${key}`).toEqual(original[key])
    }
  })
})

describe('toOutfit', () => {
  it('ordena as peças pela posição gravada', () => {
    const row: OutfitRow = {
      id: 'o1', user_id: 'u1', name: 'Usado', context_id: 'work', climate: 'mild',
      worn: true, created_at: '2026-08-19T10:00:00Z',
      outfit_items: [
        { item_id: 'c', position: 2 },
        { item_id: 'a', position: 0 },
        { item_id: 'b', position: 1 }
      ]
    }
    expect(toOutfit(row).itemIds).toEqual(['a', 'b', 'c'])
  })

  it('aceita combinação sem peças vinculadas', () => {
    const row = { id: 'o1', user_id: 'u1', name: '', context_id: 'work', climate: 'mild', worn: false, created_at: '' } as OutfitRow
    expect(toOutfit(row).itemIds).toEqual([])
  })
})

describe('toCategory', () => {
  it('preserva o papel e a marca de customizada', () => {
    const result = toCategory({ id: 'c1', user_id: 'u1', name: 'Overshirts', kind: 'garment', role: 'outer_layer', custom: true })
    expect(result).toEqual({ id: 'c1', name: 'Overshirts', kind: 'garment', role: 'outer_layer', custom: true })
  })
})

describe('fotografia', () => {
  it('leva caminho e marca de recorte nos dois sentidos', () => {
    const linha = row({ image_path: 'u1/abc.webp', image_cutout: true })
    const dominio = toItem(linha)

    expect(dominio.imagePath).toBe('u1/abc.webp')
    expect(dominio.imageCutout).toBe(true)
    // `imageUrl` é resolvida na exibição e nunca vem do banco
    expect(dominio.imageUrl).toBeUndefined()

    const volta = fromItem(dominio)
    expect(volta.image_path).toBe('u1/abc.webp')
    expect(volta.image_cutout).toBe(true)
  })

  it('grava nulo quando o item não tem foto', () => {
    const volta = fromItem(item({ id: 'i1', categoryId: 'c1' }))
    expect(volta.image_path).toBeNull()
    expect(volta.image_cutout).toBe(false)
  })

  it('não manda a URL assinada de volta para o banco', () => {
    const comUrl = { ...item({ id: 'i1', categoryId: 'c1' }), imagePath: 'u1/a.webp', imageUrl: 'https://assinada' }
    expect(fromItem(comUrl)).not.toHaveProperty('imageUrl')
  })
})
