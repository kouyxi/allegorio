import { describe, expect, it } from 'vitest'
import { corDominante } from '~/utils/imagem'

describe('cor sugerida pela fotografia', () => {
  it('ignora pixels transparentes e escolhe o grupo recorrente', () => {
    const pixels = new Uint8ClampedArray([
      240, 240, 240, 0,
      32, 64, 96, 255,
      35, 66, 98, 255,
      200, 20, 20, 255
    ])
    expect(corDominante(pixels)).toBe('#224161')
  })

  it('não sugere cor quando o recorte ficou vazio', () => {
    expect(corDominante(new Uint8ClampedArray([1, 2, 3, 0]))).toBeUndefined()
  })
})
