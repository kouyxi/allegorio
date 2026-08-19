import { describe, expect, it } from 'vitest'
import { quandoUsado } from '~/utils/format'

const AGORA = new Date('2026-08-19T12:00:00')

describe('quandoUsado', () => {
  it('não diz nada de peça sem uso nenhum', () => {
    expect(quandoUsado(undefined, 0, AGORA)).toBeUndefined()
  })

  it('conta uso registrado sem data', () => {
    // Estado alcançável: backup antigo trouxe contagem sem `last_worn_at`
    expect(quandoUsado(undefined, 3, AGORA)).toBe('3 usos registrados.')
  })

  it('usa palavra em vez de número no que é recente', () => {
    expect(quandoUsado('2026-08-19', 1, AGORA)).toBe('1 uso registrado, o último hoje.')
    expect(quandoUsado('2026-08-18', 2, AGORA)).toBe('2 usos registrados, o último ontem.')
  })

  it('conta dias dentro do mês e meses depois', () => {
    expect(quandoUsado('2026-08-04', 4, AGORA)).toContain('há 15 dias')
    expect(quandoUsado('2026-07-04', 4, AGORA)).toContain('há mais de um mês')
    expect(quandoUsado('2026-02-04', 4, AGORA)).toContain('há 6 meses')
  })

  it('ignora data inválida em vez de imprimir NaN', () => {
    expect(quandoUsado('nunca', 2, AGORA)).toBeUndefined()
  })
})
