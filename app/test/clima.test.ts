import { describe, expect, it } from 'vitest'
import { climaPorTemperatura } from '#shared/clima'

describe('climaPorTemperatura', () => {
  it('separa as três faixas', () => {
    expect(climaPorTemperatura(31)).toBe('hot')
    expect(climaPorTemperatura(21)).toBe('mild')
    expect(climaPorTemperatura(9)).toBe('cold')
  })

  it('trata os limites como pertencentes ao extremo', () => {
    // 25 é onde a terceira peça já atrapalha, 17 é onde ela deixa de ser opcional
    expect(climaPorTemperatura(25)).toBe('hot')
    expect(climaPorTemperatura(24.9)).toBe('mild')
    expect(climaPorTemperatura(17)).toBe('cold')
    expect(climaPorTemperatura(17.1)).toBe('mild')
  })

  it('aguenta temperatura negativa', () => {
    expect(climaPorTemperatura(-4)).toBe('cold')
  })
})
