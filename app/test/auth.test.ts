import { describe, expect, it } from 'vitest'
import { translate } from '~/composables/useAuth'

describe('translate', () => {
  it('traduz as mensagens exatas do Supabase', () => {
    expect(translate('Invalid login credentials')).toBe('E-mail ou senha não conferem.')
  })

  it('reconhece provedor desligado por trecho', () => {
    // O Supabase escreve isso de mais de um jeito, e a mensagem crua não diz a
    // quem lê que falta configuração no painel e não no aplicativo
    expect(translate('Unsupported provider: provider is not enabled'))
      .toContain('painel do Supabase')
    expect(translate('Provider is not enabled')).toContain('painel do Supabase')
  })

  it('reconhece endereço de retorno fora da lista', () => {
    expect(translate('Redirect URL not allowed')).toContain('lista permitida')
  })

  it('devolve a mensagem original quando não conhece', () => {
    expect(translate('Algo bem específico')).toBe('Algo bem específico')
  })
})
