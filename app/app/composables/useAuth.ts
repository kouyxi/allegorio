import type { User } from '@supabase/supabase-js'

/** O que a interface precisa saber da conta. Guardar o objeto inteiro do
 *  Supabase em `useState` faria payload de hidratação com token dentro. */
export interface AuthUser {
  id: string
  email: string
}

export function toAuthUser(user?: User | null): AuthUser | null {
  return user ? { id: user.id, email: user.email ?? '' } : null
}

export function useAuth() {
  const { $supabase } = useNuxtApp()

  const user = useState<AuthUser | null>('auth-user', () => null)
  const ready = useState('auth-ready', () => false)

  /** Sem projeto configurado o aplicativo continua local e sem login. */
  const configured = computed(() => Boolean($supabase))
  const signedIn = computed(() => Boolean(user.value))

  /* Entrada por e-mail e senha, e não por link mágico. O SMTP embutido do
     Supabase é limitado a poucos envios por hora e o próprio serviço avisa que
     serve para teste, então link mágico ficaria frágil justamente no momento em
     que a pessoa precisa entrar. Link mágico volta a ser opção quando houver
     provedor de e-mail próprio. */
  async function signIn(email: string, password: string) {
    if (!$supabase) throw new Error('Supabase não configurado.')
    const { error } = await $supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error(translate(error.message))
  }

  async function signUp(email: string, password: string) {
    if (!$supabase) throw new Error('Supabase não configurado.')
    const { data, error } = await $supabase.auth.signUp({ email: email.trim(), password })
    if (error) throw new Error(translate(error.message))
    /* Com confirmação de e-mail ligada no painel, o cadastro volta sem sessão. */
    return Boolean(data.session)
  }

  /**
   * Entrada pelo Google.
   *
   * O Supabase leva a pessoa para o Google e devolve com a sessão no fragmento
   * da URL. Quem lê esse fragmento é o `detectSessionInUrl` do cliente, então
   * aqui não existe retorno para tratar: a página sai do ar antes disso, e o
   * `onAuthStateChange` do plugin é que percebe a volta.
   *
   * `redirectTo` precisa apontar para a origem atual e não para uma URL fixa,
   * senão desenvolvimento em `localhost` e produção exigiriam builds
   * diferentes. A origem ainda precisa estar na lista de redirecionamentos
   * permitidos do painel do Supabase.
   */
  async function signInWithGoogle() {
    if (!$supabase) throw new Error('Supabase não configurado.')

    const { error } = await $supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          /* `consent` mais `offline` é o que faz o Google devolver refresh
             token na primeira vez. Sem isso a sessão morre no fim do dia e a
             pessoa entra de novo achando que o aplicativo esqueceu dela. */
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) throw new Error(translate(error.message))
  }

  async function signOut() {
    if (!$supabase) return
    await $supabase.auth.signOut()
    user.value = null
  }

  return { user, ready, configured, signedIn, signIn, signUp, signInWithGoogle, signOut }
}

const MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha não conferem.',
  'Email not confirmed': 'Confirme o e-mail pelo link que o Supabase enviou antes de entrar.',
  'User already registered': 'Essa conta já existe. Use entrar.',
  'Password should be at least 6 characters.': 'A senha precisa de ao menos 6 caracteres.',
  'Signup requires a valid password': 'Digite uma senha.',
  'Unable to validate email address: invalid format': 'E-mail em formato inválido.'
}

/* O Supabase devolve o provedor desligado como texto livre e com mais de uma
   redação. Vale casar por trecho: a mensagem crua não diz a quem lê que falta
   uma configuração no painel, e não no aplicativo. */
const TRECHOS: [RegExp, string][] = [
  [/provider is not enabled|unsupported provider/i,
    'Entrar com Google ainda não está ligado no painel do Supabase.'],
  [/redirect|not allowed/i,
    'O endereço de retorno não está na lista permitida do projeto Supabase.'],
  [/rate limit|too many/i,
    'Muitas tentativas seguidas. Espere um minuto e tente de novo.'],
  [/fetch|network/i,
    'Não consegui falar com o servidor. Confira a conexão.']
]

export function translate(message: string) {
  const exata = MESSAGES[message]
  if (exata) return exata

  for (const [padrao, texto] of TRECHOS) {
    if (padrao.test(message)) return texto
  }
  return message
}
