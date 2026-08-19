import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cria o cliente e resolve a sessão antes de qualquer rota renderizar.
 *
 * A inicialização da sessão mora aqui, e não num plugin separado, porque a
 * ordem de carregamento de plugin é alfabética: um `auth.client.ts` rodaria
 * antes deste e não teria `$supabase` para usar.
 *
 * Sem as variáveis de ambiente o cliente é nulo e o aplicativo segue no
 * armazenamento local, sem tela de entrada. É o que mantém o protótipo
 * utilizável para quem clona o repositório sem projeto próprio.
 */
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl
  const key = config.public.supabasePublishableKey

  const user = useState<AuthUser | null>('auth-user', () => null)
  const ready = useState('auth-ready', () => false)

  if (!url || !key) {
    ready.value = true
    return { provide: { supabase: null as SupabaseClient | null } }
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

  const { data } = await supabase.auth.getSession()
  user.value = toAuthUser(data.session?.user)

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = toAuthUser(session?.user)
  })

  ready.value = true

  return { provide: { supabase } }
})
