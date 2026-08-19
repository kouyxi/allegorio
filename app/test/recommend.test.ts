import { describe, expect, it } from 'vitest'
import { buildLook, defaultContextId, ROLE_LABELS } from '~/utils/recommend'
import type { LookRequest, RecommendationRole } from '~/types/domain'
import { CATEGORIES, CONTEXTS, daysAgo, item, ITEMS } from './fixtures'

function look(over: Partial<LookRequest> = {}, items = ITEMS) {
  const request: LookRequest = { contextId: 'work', climate: 'mild', seed: 0, overrides: {}, ...over }
  return buildLook(items, CATEGORIES, CONTEXTS, request)
}

const ids = (result: ReturnType<typeof look>) => result.items.map(entry => entry.id)

describe('buildLook', () => {
  it('monta todos os papéis exigidos pelo contexto mais o perfume', () => {
    const roles = look().slots.map(slot => slot.role)
    expect(roles).toEqual<RecommendationRole[]>(['top', 'bottom', 'footwear', 'outer_layer', 'scent'])
  })

  it('nunca usa item da lista de desejos', () => {
    const chosen = look({ seed: 0 })
    for (let seed = 0; seed < 8; seed += 1) {
      expect(ids(look({ seed }))).not.toContain('wish-top')
    }
    expect(chosen.items.every(entry => entry.ownership === 'owned')).toBe(true)
  })

  it('o primeiro cartão traz a peça mais bem pontuada de cada papel', () => {
    // formalidade 2 é o alvo de "work", então as variantes `-a` vencem
    expect(ids(look({ seed: 0 }))).toEqual(['top-a', 'bottom-a', 'shoe-a', 'outer-a', 'scent-a'])
  })

  it('o odômetro gera combinações distintas em vez de girar tudo em bloco', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 8; seed += 1) seen.add(ids(look({ seed })).join('|'))
    // com 2 opções em top, bottom, calçado e perfume, e 1 em terceira peça,
    // existem 16 combinações possíveis: 8 sementes devem dar 8 distintas
    expect(seen.size).toBe(8)
  })

  it('cartões vizinhos diferem por poucas peças', () => {
    const a = ids(look({ seed: 0 }))
    const b = ids(look({ seed: 1 }))
    const diff = a.filter((id, index) => id !== b[index])
    expect(diff.length).toBeLessThanOrEqual(2)
  })

  it('peça fixada vence a pontuação e não gira com a semente', () => {
    const overrides = { top: 'top-b' } as Partial<Record<RecommendationRole, string>>
    for (let seed = 0; seed < 6; seed += 1) {
      const result = look({ seed, overrides })
      expect(result.slots.find(slot => slot.role === 'top')?.item?.id).toBe('top-b')
    }
    expect(look({ overrides }).slots.find(slot => slot.role === 'top')?.note).toBe('escolha sua')
  })

  it('calor dispensa terceira peça e frio exige', () => {
    expect(look({ climate: 'hot' }).slots.map(slot => slot.role)).not.toContain('outer_layer')
    expect(look({ contextId: 'everyday', climate: 'cold' }).slots.map(slot => slot.role)).toContain('outer_layer')
  })

  it('avisa qual papel falta em vez de devolver look incompleto em silêncio', () => {
    const semSapato = ITEMS.filter(entry => entry.categoryId !== 'c-shoe')
    const result = look({}, semSapato)

    expect(result.missingRoles).toContain('footwear')
    const slot = result.slots.find(entry => entry.role === 'footwear')
    expect(slot?.item).toBeNull()
    expect(slot?.roleLabel).toBe(ROLE_LABELS.footwear)
    expect(ids(result)).toHaveLength(4)
  })

  it('penaliza peça usada há pouco', () => {
    const items = ITEMS.map(entry =>
      entry.id === 'top-a' ? { ...entry, lastWornAt: daysAgo(0) } : entry
    )
    const result = look({}, items)
    expect(result.slots.find(slot => slot.role === 'top')?.item?.id).toBe('top-b')
  })

  it('evita perfume de projeção alta no trabalho', () => {
    const soAlta = ITEMS.filter(entry => entry.id !== 'scent-a')
    const trabalho = look({}, soAlta).slots.find(slot => slot.role === 'scent')
    expect(trabalho?.item?.id).toBe('scent-b')
    expect(trabalho?.note).toContain('projeção alta')
  })

  it('não repete a mesma nota em todas as linhas', () => {
    // com o acervo homogêneo, contexto e clima valem para todo mundo e por isso
    // sobem para o bloco "Por quê" em vez de ocupar as cinco linhas
    const notes = look().slots.map(slot => slot.note)
    const generic = notes.filter(note => note.includes('para trabalho'))
    expect(generic.length).toBeLessThan(notes.length)
  })

  it('explica a escolha em frases contáveis', () => {
    const result = look()
    expect(result.reasons.some(reason => /\d+ de \d+ peças/.test(reason))).toBe(true)
    expect(result.reasons.some(reason => reason.includes('Formalidade alvo'))).toBe(true)
  })

  it('devolve vazio sem estourar quando não há contexto', () => {
    const result = buildLook(ITEMS, CATEGORIES, [], { contextId: 'x', climate: 'mild', seed: 0, overrides: {} })
    expect(result.items).toEqual([])
    expect(result.slots).toEqual([])
  })
})

describe('defaultContextId', () => {
  it('assume trabalho em dia útil e dia a dia no fim de semana', () => {
    expect(defaultContextId(new Date('2026-08-19T12:00:00'))).toBe('work')   // quarta
    expect(defaultContextId(new Date('2026-08-22T12:00:00'))).toBe('everyday') // sábado
    expect(defaultContextId(new Date('2026-08-23T12:00:00'))).toBe('everyday') // domingo
  })
})
