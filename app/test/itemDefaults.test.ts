import { describe, expect, it } from 'vitest'
import { defaultsForCategory } from '~/utils/itemDefaults'
import type { Category } from '~/types/domain'

const category = (over: Partial<Category> = {}): Category => ({
  id: 'custom', name: 'Bermudas', kind: 'garment', role: 'bottom', custom: true, ...over
})

describe('cadastro rápido', () => {
  it('aplica padrão específico às categorias da casa', () => {
    const defaults = defaultsForCategory(category({ id: 'cat-tshirts', name: 'Camisetas', role: 'top' }))
    expect(defaults.name).toBe('Camiseta')
    expect(defaults.formality).toBe(1)
    expect(defaults.climates).toEqual(['hot', 'mild'])
  })

  it('reconhece categoria padrão mesmo quando a conta gerou outro UUID', () => {
    const defaults = defaultsForCategory(category({ id: 'uuid-remoto', name: 'Camisetas', role: 'top' }))
    expect(defaults.name).toBe('Camiseta')
    expect(defaults.formality).toBe(1)
  })

  it('usa o papel semântico para categoria customizada', () => {
    const defaults = defaultsForCategory(category())
    expect(defaults.name).toBe('Bermudas')
    expect(defaults.climates).toContain('hot')
    expect(defaults.contexts).toContain('everyday')
  })

  it('devolve novos arrays para uma edição não contaminar a próxima peça', () => {
    const first = defaultsForCategory(category())
    first.climates.pop()
    expect(defaultsForCategory(category()).climates).toHaveLength(3)
  })
})
