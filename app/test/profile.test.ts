import { describe, expect, it } from 'vitest'
import { NICKNAME_MAX_LENGTH, normalizeNickname, validateNickname } from '~/utils/profile'

describe('nickname do perfil', () => {
  it('remove espaços das pontas e junta espaços repetidos', () => {
    expect(normalizeNickname('  Victor   K.  ')).toBe('Victor K.')
  })

  it('aceita vazio para permitir remover o nickname', () => {
    expect(validateNickname('   ')).toBe('')
  })

  it('limita o nickname a quarenta caracteres', () => {
    expect(validateNickname('a'.repeat(NICKNAME_MAX_LENGTH))).toBe('')
    expect(validateNickname('a'.repeat(NICKNAME_MAX_LENGTH + 1))).toContain('40')
  })
})
