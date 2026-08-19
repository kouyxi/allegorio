import { describe, expect, it } from 'vitest'
import { buildBackup, parseBackup } from '~/utils/backup'
import { CATEGORIES, item } from './fixtures'

const ITEMS = [item({ id: 'i1', categoryId: 'c-top' })]
const valid = () => buildBackup(ITEMS, CATEGORIES, [], new Date('2026-08-19T10:00:00Z'))

describe('parseBackup', () => {
  it('aceita um arquivo que ele mesmo gerou', () => {
    const result = parseBackup(JSON.stringify(valid()))
    expect(result.items).toHaveLength(1)
    expect(result.categories).toHaveLength(CATEGORIES.length)
    expect(result.exportedAt).toBe('2026-08-19T10:00:00.000Z')
  })

  it('assume lista vazia quando não há combinações no arquivo', () => {
    const { outfits, ...semOutfits } = valid()
    expect(parseBackup(JSON.stringify(semOutfits)).outfits).toEqual([])
  })

  it('recusa arquivo que não é JSON', () => {
    expect(() => parseBackup('não é json')).toThrow('não é JSON válido')
  })

  it('recusa arquivo de outro programa', () => {
    expect(() => parseBackup('{"format":"outra-coisa"}')).toThrow('não é um backup do Allegorio')
  })

  it('recusa versão futura em vez de adivinhar o formato', () => {
    expect(() => parseBackup(JSON.stringify({ ...valid(), version: 2 }))).toThrow('versão 2')
  })

  it('recusa arquivo sem itens ou sem categorias', () => {
    expect(() => parseBackup(JSON.stringify({ ...valid(), items: undefined }))).toThrow('incompleto')
    expect(() => parseBackup(JSON.stringify({ ...valid(), categories: undefined }))).toThrow('incompleto')
  })

  it('recusa item órfão, que entraria sem categoria e sumiria da grade', () => {
    const orfao = { ...valid(), categories: [] }
    expect(() => parseBackup(JSON.stringify(orfao))).toThrow(/aponta para uma categoria/)
  })

  it('nomeia o item culpado, para dar o que consertar', () => {
    const orfao = { ...valid(), items: [item({ id: 'x', categoryId: 'inexistente', name: 'Bota' })] }
    expect(() => parseBackup(JSON.stringify(orfao))).toThrow(/"Bota"/)
  })

  it('recusa null sem estourar', () => {
    expect(() => parseBackup('null')).toThrow('não é um backup do Allegorio')
  })
})
