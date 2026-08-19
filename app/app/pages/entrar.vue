<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { signIn, signUp, signInWithGoogle } = useAuth()

type Modo = 'in' | 'up'

const mode = ref<Modo>('in')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
/* Qual botão está ocupado, e não um `busy` só: com dois caminhos de entrada na
   mesma tela, um booleano faria o botão do Google girar quando a pessoa mandou
   o formulário de e-mail. */
const ocupado = ref<'' | 'form' | 'google'>('')
const error = ref('')
const notice = ref('')

const creating = computed(() => mode.value === 'up')
const bloqueado = computed(() => ocupado.value !== '')

watch(mode, () => {
  error.value = ''
  notice.value = ''
})

async function submit() {
  if (bloqueado.value) return
  error.value = ''
  notice.value = ''

  if (!email.value.trim()) return (error.value = 'Digite o e-mail.')
  if (password.value.length < 6) return (error.value = 'A senha precisa de ao menos 6 caracteres.')

  ocupado.value = 'form'
  try {
    if (creating.value) {
      const session = await signUp(email.value, password.value)
      if (session) await navigateTo('/')
      else notice.value = 'Conta criada. Confirme pelo link que o Supabase mandou e volte para entrar.'
    } else {
      await signIn(email.value, password.value)
      await navigateTo('/')
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Não consegui entrar.'
  } finally {
    ocupado.value = ''
  }
}

/* Não existe `finally` que solte o botão no caminho feliz: quando dá certo, o
   navegador já saiu para o Google e esta página deixou de existir. Soltar só
   no erro é o que mantém o estado honesto enquanto a saída acontece. */
async function comGoogle() {
  if (bloqueado.value) return
  error.value = ''
  notice.value = ''
  ocupado.value = 'google'

  try {
    await signInWithGoogle()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Não consegui abrir o Google.'
    ocupado.value = ''
  }
}

useHead({ title: 'Entrar · Allegorio' })
</script>

<template>
  <div class="enter">
    <header class="enter__head rise">
      <!-- O óculo da marca, mesmo desenho do ícone do aplicativo, herdando a
           cor do texto. Componente próprio seria peso para um uso só. -->
      <svg class="enter__marca" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" stroke-linecap="round">
          <circle cx="256" cy="238" r="150" stroke-width="20" />
          <circle cx="256" cy="238" r="100" stroke-width="11" />
          <circle cx="256" cy="238" r="52" stroke-width="8" stroke-dasharray="17 14" />
          <path d="M76 442h360" stroke-width="20" />
          <path d="M76 472h360" stroke-width="10" stroke-dasharray="24 20" />
        </g>
        <circle cx="256" cy="238" r="19" fill="currentColor" />
      </svg>
      <p class="label dimmer">Allegorio</p>
      <h1 class="display display-md">{{ creating ? 'Criar conta' : 'Entrar' }}</h1>
      <p class="enter__lede">
        {{ creating
          ? 'A conta guarda o acervo no servidor. As fotos e as fichas passam a acompanhar você em qualquer aparelho.'
          : 'O acervo passa a viver no servidor, com backup, e acompanha você em qualquer aparelho.' }}
      </p>
    </header>

    <div class="enter__card card rise rise-1">
      <AppSegmented
        v-model="mode"
        label="Entrar ou criar conta"
        :options="[{ value: 'in' as Modo, label: 'Entrar' }, { value: 'up' as Modo, label: 'Criar conta' }]"
      />

      <!-- O caminho mais curto vem primeiro. Quem tem conta Google não digita nada. -->
      <button type="button" class="btn btn--ghost btn--full enter__google" :disabled="bloqueado" @click="comGoogle">
        <AppIcon name="google" size="1.125rem" />
        {{ ocupado === 'google' ? 'Abrindo o Google…' : 'Continuar com Google' }}
      </button>

      <p class="enter__ou"><span>ou com e-mail</span></p>

      <form class="enter__form" novalidate @submit.prevent="submit">
        <label class="field">
          <span class="label">E-mail</span>
          <input
            v-model="email"
            class="input"
            type="email"
            autocomplete="email"
            inputmode="email"
            autocapitalize="off"
            spellcheck="false"
            placeholder="voce@exemplo.com"
          >
        </label>

        <div class="field">
          <span class="label">Senha</span>
          <div class="senha">
            <input
              v-model="password"
              class="input senha__campo"
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="creating ? 'new-password' : 'current-password'"
              placeholder="Ao menos 6 caracteres"
              @keyup.enter="submit"
            >
            <button
              type="button"
              class="senha__olho"
              :aria-label="showPassword ? 'Esconder a senha' : 'Mostrar a senha'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <AppIcon :name="showPassword ? 'olhoFechado' : 'olho'" size="1.0625rem" />
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn--full" :disabled="bloqueado">
          <AppIcon :name="ocupado === 'form' ? 'clock' : 'arrow'" size="1.0625rem" />
          {{ ocupado === 'form' ? 'Um instante…' : creating ? 'Criar conta' : 'Entrar' }}
        </button>
      </form>

      <p v-if="error" class="enter__msg enter__msg--bad" role="alert">
        <AppIcon name="info" size="1.0625rem" />
        <span>{{ error }}</span>
      </p>
      <p v-else-if="notice" class="enter__msg" role="status">
        <AppIcon name="check" size="1.0625rem" />
        <span>{{ notice }}</span>
      </p>
    </div>

    <p class="enter__pe rise rise-2">
      Entrando, o acervo sai deste navegador e passa a viver na sua conta.
      Nenhuma foto é usada para outra coisa.
    </p>
  </div>
</template>

<style scoped>
/* A tela inteira é uma coluna só, e nada aqui pode ter largura fixa: em
   telefone estreito ou em janela dividida, um único valor em pixel empurra o
   documento para além da tela e corta o texto pela esquerda. */
.enter { display: grid; gap: var(--s5); width: 100%; min-width: 0; }

.enter__head { display: grid; justify-items: start; gap: var(--s2); }
.enter__marca { width: 2.5rem; height: 2.5rem; margin-bottom: var(--s1); color: var(--ink); }
.enter__head h1 { margin-top: var(--s1); }
.enter__lede {
  max-width: 38ch;
  margin-top: var(--s1);
  color: var(--ink-3);
  font-size: var(--fs-sm);
  line-height: 1.55;
  text-wrap: pretty;
}

.enter__card { display: grid; gap: var(--s4); padding: var(--pad); }
.enter__google { justify-content: center; }
.enter__form { display: grid; gap: var(--s4); }

/* Separador com rótulo no meio. As duas réguas crescem sozinhas, então o texto
   fica centrado sem ninguém medir nada. */
.enter__ou {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--s3);
  margin-block: calc(var(--s1) * -1);
  color: var(--ink-4);
  font-size: var(--fs-micro);
  font-variation-settings: "wght" 620;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.enter__ou::before, .enter__ou::after { content: ""; height: 1px; background: var(--line-2); }

.senha { position: relative; display: grid; }
/* Espaço reservado para o botão dentro do próprio campo, senão a senha longa
   corre por baixo do olho. */
.senha__campo { padding-right: 3.25rem; }
.senha__olho {
  position: absolute;
  inset: 50% var(--s1) auto auto;
  display: grid;
  place-items: center;
  width: 2.5rem; height: 2.5rem;
  border: 0;
  border-radius: var(--r-full);
  background: transparent;
  color: var(--ink-4);
  transform: translateY(-50%);
  transition: color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.senha__olho:hover { background: var(--paper-2); color: var(--ink-2); }
.senha__olho[aria-pressed="true"] { color: var(--ink-2); }

.enter__msg {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: var(--s2);
  padding: var(--s3) var(--s4);
  border: 1px solid var(--line-2);
  border-radius: var(--r-md);
  background: var(--paper-2);
  font-size: var(--fs-sm);
  line-height: 1.45;
}
.enter__msg .ico { margin-top: 0.125rem; }
.enter__msg--bad { border-color: var(--ink); background: var(--card); }

.enter__pe { color: var(--ink-4); font-size: var(--fs-xs); line-height: 1.5; text-wrap: pretty; }
</style>
