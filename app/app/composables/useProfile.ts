/**
 * Nome de exibição do usuário.
 *
 * A coluna `profiles.display_name` já existia no esquema desde a primeira
 * migração e nada escrevia nela. Sem nome, a única forma de reconhecer qual
 * conta está aberta é o e-mail cru, e num celular compartilhado ou depois de
 * entrar pelo Google é fácil não saber de cabeça qual e-mail é aquele.
 *
 * Só existe com sessão remota: o modo local não tem conta, só um acervo no
 * aparelho, e nome de exibição sem conta para guardar não tem onde morar.
 */
export function useProfile() {
  const { $supabase } = useNuxtApp()
  const { user } = useAuth()

  const displayName = useState<string>('profile-display-name', () => '')
  const loading = useState('profile-loading', () => false)
  const loadedFor = useState<string | null>('profile-loaded-for', () => null)

  async function load() {
    const id = user.value?.id
    if (!$supabase || !id || loadedFor.value === id) return

    loading.value = true
    try {
      const { data } = await $supabase.from('profiles').select('display_name').eq('id', id).single()
      displayName.value = data?.display_name ?? ''
      loadedFor.value = id
    } finally {
      loading.value = false
    }
  }

  /* `null` e não string vazia grava no banco: string vazia ficaria salva como
     "" para sempre, e o próximo carregamento leria "" em vez de cair no nome
     nenhum de novo. */
  async function save(nome: string) {
    const id = user.value?.id
    if (!$supabase || !id) return

    const limpo = nome.trim()
    const anterior = displayName.value
    displayName.value = limpo

    const { error } = await $supabase.from('profiles').update({ display_name: limpo || null }).eq('id', id)
    if (error) {
      displayName.value = anterior
      throw new Error('Não consegui salvar o nome.')
    }
  }

  watch(() => user.value?.id, id => {
    if (!id) {
      displayName.value = ''
      loadedFor.value = null
      return
    }
    load()
  }, { immediate: true })

  return { displayName, loading, save }
}
